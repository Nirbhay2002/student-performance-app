const xlsx = require('xlsx');
const Marks = require('../models/Marks');
const Student = require('../models/Student');
const { calculatePerformance, getCategory, calculateAverageMarks } = require('./ranking');

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

    for (const row of data) {
        try {
            const { rollNumber, examName, date, physics, chemistry, maths, bio, attendance, remarks } = row;

            if (!rollNumber || !examName) {
                results.errors.push(`Row missing rollNumber or examName: ${JSON.stringify(row)}`);
                continue;
            }

            const student = await Student.findOne({ rollNumber });
            if (!student) {
                results.errors.push(`Student not found for rollNumber: ${rollNumber}`);
                continue;
            }

            const markDate = date ? new Date(date) : new Date();

            const newMark = new Marks({
                studentId: student._id,
                examName,
                date: markDate,
                scores: {
                    physics: Number(physics || 0),
                    chemistry: Number(chemistry || 0),
                    maths: Number(maths || 0),
                    bio: Number(bio || 0)
                },
                attendance: Number(attendance || 0),
                remarks: remarks || ''
            });

            await newMark.save();
            results.affectedStudents.add(student._id.toString());
            results.success++;

        } catch (err) {
            results.errors.push(`Error processing row: ${err.message}`);
        }
    }

    // Recalculate performance for affected students
    for (const studentId of results.affectedStudents) {
        const studentMarks = await Marks.find({ studentId });
        const score = calculatePerformance(studentMarks);
        const avgMarks = calculateAverageMarks(studentMarks);
        const category = getCategory(score);

        await Student.findByIdAndUpdate(studentId, {
            performanceScore: score,
            averageMarks: avgMarks,
            category: category
        });
    }

    return {
        message: `Processed ${data.length} rows. Successfully added ${results.success} records.`,
        successCount: results.success,
        errorCount: results.errors.length,
        errors: results.errors
    };
};

module.exports = { processBulkUpload };
