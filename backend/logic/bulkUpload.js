const xlsx = require('xlsx');
const Marks = require('../models/Marks');
const Student = require('../models/Student');
const { calculatePerformance, calculateAverageMarks, recalculateAllCategories } = require('./ranking');

/**
 * Process Bulk Upload
 * @param {Buffer} buffer - File buffer
 */
const processBulkUpload = async (buffer) => {
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

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
                physics: Number(row.physics) || 0,
                chemistry: Number(row.chemistry) || 0,
                maths: Number(row.maths) || 0,
                bio: Number(row.bio) || 0
            };

            const maxScores = {
                physics: row.maxPhysics !== undefined ? Number(row.maxPhysics) : 100,
                chemistry: row.maxChemistry !== undefined ? Number(row.maxChemistry) : 100,
                maths: row.maxMaths !== undefined ? Number(row.maxMaths) : 100,
                bio: row.maxBio !== undefined ? Number(row.maxBio) : 100
            };

            const mark = new Marks({
                studentId: student._id,
                examName: row.examName || 'Bulk Test',
                date: row.date ? new Date(row.date) : new Date(),
                scores,
                maxScores,
                attendance: Number(row.attendance) || 100,
                remarks: row.remarks || ''
            });

            await mark.save();
            results.success++;
            results.affectedStudents.add(student._id.toString());
        } catch (err) {
            results.errors.push(`Row ${i + 1} (${row.rollNumber || 'unknown'}): ${err.message}`);
        }
    }

    // Recalculate performance for affected students
    for (const studentId of results.affectedStudents) {
        const student = await Student.findById(studentId);
        if (!student) continue;

        const studentMarks = await Marks.find({ studentId });
        const score = calculatePerformance(studentMarks, student.stream);
        const avgMarks = calculateAverageMarks(studentMarks, student.stream);

        // We only update score here; categories are recalculated globally below
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
