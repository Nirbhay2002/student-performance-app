const Student = require('../models/Student');
const Marks = require('../models/Marks');
const { processStudentBulkUpload } = require('../logic/bulkUpload');

// Get all students with filters and pagination
exports.getStudents = async (req, res) => {
    try {
        const page = req.query.page !== undefined ? parseInt(req.query.page) : null;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const stream = req.query.stream || 'All';
        const batch = req.query.batch || 'All';
        const subBatch = req.query.subBatch || 'All';
        const category = req.query.category || 'All';
        const minScore = (req.query.minScore !== undefined && req.query.minScore !== '') ? parseFloat(req.query.minScore) : null;
        const maxScore = (req.query.maxScore !== undefined && req.query.maxScore !== '') ? parseFloat(req.query.maxScore) : null;

        console.log(`🔍 Filter Request: Stream=${stream}, Batch=${batch}, SubBatch=${subBatch}, Category=${category}, Min=${minScore}, Max=${maxScore}`);

        const query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { rollNumber: { $regex: search, $options: 'i' } }
            ];
        }
        if (stream !== 'All') query.stream = stream;
        if (batch !== 'All') query.batch = batch;
        if (subBatch !== 'All') query.subBatch = subBatch;
        if (category !== 'All') query.category = category;

        if (minScore !== null && maxScore !== null) {
            if (maxScore === 100) {
                query.performanceScore = { $gte: minScore, $lte: maxScore };
            } else {
                query.performanceScore = { $gte: minScore, $lt: maxScore };
            }
        } else if (minScore !== null) {
            query.performanceScore = { $gte: minScore };
        } else if (maxScore !== null) {
            query.performanceScore = { $lte: maxScore };
        }

        // Sort: alphabetical when no category filter; rank-ascending when category is filtered
        const sortOrder = category !== 'All' ? { currentRank: 1 } : { name: 1 };

        if (page === null) {
            const students = await Student.find(query).sort(sortOrder).lean();
            return res.json({ students, total: students.length });
        }

        const total = await Student.countDocuments(query);
        const students = await Student.find(query)
            .sort(sortOrder)
            .skip(page * limit)
            .limit(limit)
            .lean();

        res.json({
            students,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (err) {
        console.error('❌ Error in getStudents:', err.message);
        res.status(500).json({ error: err.message });
    }
};

// Register or Update a student (Upsert)
exports.registerStudent = async (req, res) => {
    try {
        const { rollNumber } = req.body;
        if (!rollNumber) {
            return res.status(400).json({ error: 'Roll number is required' });
        }

        // Find existing student by rollNumber
        let student = await Student.findOne({ rollNumber });

        if (student) {
            // Update existing student
            Object.assign(student, req.body);
            await student.save();
            return res.json({ student, message: 'Student information updated successfully!', updated: true });
        } else {
            // Register new student
            student = new Student(req.body);
            await student.save();
            res.json({ student, message: 'Student registered successfully!', updated: false });
        }
    } catch (err) {
        console.error('❌ Error in registerStudent:', err.message);
        res.status(500).json({ error: err.message });
    }
};

// Get student performance details
exports.getStudentPerformance = async (req, res) => {
    try {
        const marks = await Marks.find({ studentId: req.params.id }).sort('date');
        const student = await Student.findById(req.params.id);
        if (!student) return res.status(404).json({ error: 'Student not found' });
        res.json({ student, marks });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get student by roll number (for auto-fill)
exports.getStudentByRoll = async (req, res) => {
    try {
        const student = await Student.findOne({ rollNumber: req.params.rollNumber });
        if (!student) return res.status(404).json({ error: 'Student not found' });
        res.json(student);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
// Process bulk upload of students
exports.bulkUpload = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        const result = await processStudentBulkUpload(req.file.buffer);
        res.json(result);
    } catch (err) {
        console.error('❌ Student Bulk Upload Error:', err.message);
        res.status(500).json({ error: err.message });
    }
};
