const Marks = require('../models/Marks');
const Student = require('../models/Student');
const { calculatePerformance, calculateAverageMarks, recalculateAllCategories } = require('../logic/ranking');
const { processBulkUpload } = require('../logic/bulkUpload');

// Add marks for a student
exports.addMark = async (req, res) => {
    try {
        const { studentId, ...markData } = req.body;

        // Fix #6: Server-side score > max validation
        const { scores = {}, maxScores = {} } = markData;
        for (const subj of ['physics', 'chemistry', 'maths', 'botany', 'zoology']) {
            const sc = scores[subj]; const mx = maxScores[subj];
            if (sc !== null && sc !== undefined && mx !== null && mx !== undefined && sc > mx) {
                return res.status(400).json({ error: `Score ${sc} exceeds max ${mx} for ${subj}` });
            }
        }

        // Fix #5: Reject duplicate (same student + same date)
        const testDate = markData.date ? new Date(markData.date) : new Date();
        const dayStart = new Date(testDate); dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(testDate); dayEnd.setHours(23, 59, 59, 999);
        const existing = await Marks.findOne({ studentId, date: { $gte: dayStart, $lte: dayEnd } });
        if (existing) {
            return res.status(409).json({ error: `A mark already exists for this student on ${testDate.toDateString()}. Remove it first or choose a different date.` });
        }

        const mark = new Marks({ studentId, ...markData });
        await mark.save();

        const student = await Student.findById(studentId);
        if (!student) return res.status(404).json({ error: 'Student not found' });

        const allMarks = await Marks.find({ studentId });
        const score = calculatePerformance(allMarks, student.stream);
        const avgMarks = calculateAverageMarks(allMarks, student.stream);

        await Student.findByIdAndUpdate(studentId, {
            previousPerformanceScore: student.performanceScore,
            performanceScore: score,
            averageMarks: avgMarks
        });

        // Recalculate categories for ALL students to maintain percentile distribution
        await recalculateAllCategories(Student);

        const updatedStudent = await Student.findById(studentId);

        res.json({
            mark,
            performanceScore: score,
            averageMarks: avgMarks,
            category: updatedStudent.category
        });
    } catch (err) {
        console.error('❌ Error in addMark:', err.message);
        res.status(500).json({ error: err.message });
    }
};

// Process bulk upload of marks
exports.bulkUpload = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        const result = await processBulkUpload(req.file.buffer);
        res.json(result);
    } catch (err) {
        console.error('❌ Bulk Upload Error:', err.message);
        res.status(500).json({ error: err.message });
    }
};

// Get class-wide average percentage per subject (for radar chart)
exports.getClassSubjectAverages = async (req, res) => {
    try {
        const subjects = ['physics', 'chemistry', 'maths', 'botany', 'zoology'];

        const result = {};

        await Promise.all(subjects.map(async (subject) => {
            // Only include marks where this subject score is not null
            const agg = await Marks.aggregate([
                { $match: { [`scores.${subject}`]: { $ne: null, $exists: true } } },
                {
                    $project: {
                        percentage: {
                            $cond: {
                                if: { $and: [{ $gt: [`$maxScores.${subject}`, 0] }] },
                                then: { $multiply: [{ $divide: [`$scores.${subject}`, `$maxScores.${subject}`] }, 100] },
                                else: null
                            }
                        }
                    }
                },
                { $match: { percentage: { $ne: null } } },
                { $group: { _id: null, avg: { $avg: '$percentage' } } }
            ]);
            result[subject] = agg.length > 0 ? Math.round(agg[0].avg * 10) / 10 : 0;
        }));

        res.json(result);
    } catch (err) {
        console.error('❌ Error in getClassSubjectAverages:', err.message);
        res.status(500).json({ error: err.message });
    }
};

// Get class-average % per test name, per subject (for test performance chart)
// Query params: subject (required), startDate, endDate (optional ISO date strings)
exports.getTestPerformance = async (req, res) => {
    try {
        const { subject, startDate, endDate } = req.query;

        const VALID_SUBJECTS = ['physics', 'chemistry', 'maths', 'botany', 'zoology'];
        if (!subject || !VALID_SUBJECTS.includes(subject)) {
            return res.status(400).json({ error: `subject must be one of: ${VALID_SUBJECTS.join(', ')}` });
        }

        // Build date filter if provided
        const dateFilter = {};
        if (startDate) dateFilter.$gte = new Date(startDate);
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            dateFilter.$lte = end;
        }

        const matchStage = {
            [`scores.${subject}`]: { $ne: null, $exists: true },
        };
        if (startDate || endDate) matchStage.date = dateFilter;

        const agg = await Marks.aggregate([
            { $match: matchStage },
            {
                $project: {
                    studentId: 1,
                    testName: `$testNames.${subject}`,
                    percentage: {
                        $cond: {
                            if: { $gt: [`$maxScores.${subject}`, 0] },
                            then: { $multiply: [{ $divide: [`$scores.${subject}`, `$maxScores.${subject}`] }, 100] },
                            else: null
                        }
                    }
                }
            },
            { $match: { percentage: { $ne: null }, testName: { $nin: [null, '', 'Combined test'] } } },
            {
                $group: {
                    _id: '$testName',
                    avgPct: { $avg: '$percentage' },
                    studentIds: { $addToSet: '$studentId' }
                }
            },
            { $sort: { avgPct: -1 } },
            {
                $project: {
                    _id: 0,
                    testName: '$_id',
                    avgPct: { $round: ['$avgPct', 1] },
                    count: { $size: '$studentIds' }
                }
            }
        ]);

        res.json(agg);
    } catch (err) {
        console.error('❌ Error in getTestPerformance:', err.message);
        res.status(500).json({ error: err.message });
    }
};
