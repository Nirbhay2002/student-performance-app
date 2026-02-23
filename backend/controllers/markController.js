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
