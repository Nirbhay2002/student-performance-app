const Marks = require('../models/Marks');
const Student = require('../models/Student');
const { calculatePerformance, calculateAverageMarks, recalculateAllCategories } = require('../logic/ranking');
const { processBulkUpload } = require('../logic/bulkUpload');

// Add marks for a student
exports.addMark = async (req, res) => {
    try {
        const { studentId, ...markData } = req.body;
        const mark = new Marks({ studentId, ...markData });
        await mark.save();

        const student = await Student.findById(studentId);
        if (!student) return res.status(404).json({ error: 'Student not found' });

        const allMarks = await Marks.find({ studentId });
        const score = calculatePerformance(allMarks, student.stream);
        const avgMarks = calculateAverageMarks(allMarks, student.stream);

        await Student.findByIdAndUpdate(studentId, {
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
