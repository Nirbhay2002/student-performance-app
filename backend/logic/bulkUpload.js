const xlsx = require('xlsx');
const Marks = require('../models/Marks');
const Student = require('../models/Student');
const { calculatePerformance, calculateAverageMarks, recalculateAllCategories } = require('./ranking');

/**
 * Process Bulk Upload
 * @param {Buffer} buffer - File buffer
 */
const processBulkUpload = async (buffer) => {
    // ... (omitted code) ...

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
