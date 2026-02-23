const xlsx = require('xlsx');
const Marks = require('../models/Marks');
const Student = require('../models/Student');
const { calculatePerformance, calculateAverageMarks, recalculateAllCategories } = require('./ranking');

/**
 * Parse a score cell from the CSV/Excel file.
 * Returns null if the cell is empty, undefined, or the string "absent" (case-insensitive).
 * Returns the numeric value otherwise.
 */
const parseScore = (value) => {
    if (value === undefined || value === null || value === '') return null;
    if (typeof value === 'string' && value.trim().toLowerCase() === 'absent') return null;
    const n = Number(value);
    return isNaN(n) ? null : n;
};

/**
 * Returns an error string if any score exceeds its max, otherwise null.
 */
const validateScores = (scores, maxScores) => {
    const subjects = ['physics', 'chemistry', 'maths', 'botany', 'zoology'];
    for (const s of subjects) {
        const score = scores[s];
        const max = maxScores[s];
        if (score !== null && score !== undefined && max !== null && max !== undefined) {
            if (score > max) return `Score ${score} exceeds max ${max} for ${s}`;
        }
    }
    return null;
};

const processBulkUpload = async (buffer) => {
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });

    const results = {
        success: 0,
        errors: [],
        affectedStudents: new Set()
    };

    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        try {
            if (!row.rollNumber) throw new Error('Missing rollNumber');

            const student = await Student.findOne({ rollNumber: row.rollNumber });
            if (!student) throw new Error(`Student with roll ${row.rollNumber} not found`);

            const scores = {
                physics: parseScore(row.physics),
                chemistry: parseScore(row.chemistry),
                maths: parseScore(row.maths),
                botany: parseScore(row.botany),
                zoology: parseScore(row.zoology)
            };

            const maxScores = {
                physics: row.maxPhysics !== undefined && row.maxPhysics !== '' ? Number(row.maxPhysics) : 100,
                chemistry: row.maxChemistry !== undefined && row.maxChemistry !== '' ? Number(row.maxChemistry) : 100,
                maths: row.maxMaths !== undefined && row.maxMaths !== '' ? Number(row.maxMaths) : 100,
                botany: row.maxBotany !== undefined && row.maxBotany !== '' ? Number(row.maxBotany) : 100,
                zoology: row.maxZoology !== undefined && row.maxZoology !== '' ? Number(row.maxZoology) : 100
            };

            const testNames = {
                physics: row.testNamePhysics || 'Combined test',
                chemistry: row.testNameChemistry || 'Combined test',
                maths: row.testNameMaths || 'Combined test',
                botany: row.testNameBotany || 'Combined test',
                zoology: row.testNameZoology || 'Combined test'
            };

            const validationError = validateScores(scores, maxScores);
            if (validationError) throw new Error(validationError);

            // Fix #5: Reject duplicate (same student + same date)
            const testDate = row.date ? new Date(row.date) : new Date();
            const dayStart = new Date(testDate); dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(testDate); dayEnd.setHours(23, 59, 59, 999);
            const existing = await Marks.findOne({ studentId: student._id, date: { $gte: dayStart, $lte: dayEnd } });
            if (existing) throw new Error(`Duplicate entry: a mark already exists for ${row.rollNumber} on ${testDate.toDateString()}`);

            const mark = new Marks({
                studentId: student._id,
                examName: row.examName || 'Bulk Test',
                testNames,
                date: testDate,
                scores,
                maxScores,
                attendance: Number(row.attendance) || 100,
                remarks: row.remarks || ''
            });

            await mark.save();
            results.success++;
            results.affectedStudents.add(student._id.toString());
        } catch (err) {
            // Fix #8: cap error list at 50
            if (results.errors.length < 50) {
                results.errors.push(`Row ${i + 1} (${row.rollNumber || 'unknown'}): ${err.message}`);
            } else if (results.errors.length === 50) {
                results.errors.push('... and more errors (truncated at 50)');
            }
        }
    }

    for (const studentId of results.affectedStudents) {
        const student = await Student.findById(studentId);
        if (!student) continue;

        const studentMarks = await Marks.find({ studentId });
        const score = calculatePerformance(studentMarks, student.stream);
        const avgMarks = calculateAverageMarks(studentMarks, student.stream);

        await Student.findByIdAndUpdate(studentId, {
            previousPerformanceScore: student.performanceScore,
            performanceScore: score,
            averageMarks: avgMarks
        });
    }

    // Global percentile recalculation
    if (results.affectedStudents.size > 0) {
        await recalculateAllCategories(Student);
    }

    return {
        message: `Processed ${data.length} rows. Successfully added ${results.success} records.`,
        successCount: results.success,
        errorCount: results.errors.length,
        errors: results.errors
    };
};

module.exports = { processBulkUpload };
