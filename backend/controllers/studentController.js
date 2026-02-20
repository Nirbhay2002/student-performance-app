const Student = require('../models/Student');
const Marks = require('../models/Marks');

// Get all students with filters and pagination
exports.getStudents = async (req, res) => {
    try {
        const page = req.query.page !== undefined ? parseInt(req.query.page) : null;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const stream = req.query.stream || 'All';
        const batch = req.query.batch || 'All';
        const category = req.query.category || 'All';
        const minScore = (req.query.minScore !== undefined && req.query.minScore !== '') ? parseFloat(req.query.minScore) : null;
        const maxScore = (req.query.maxScore !== undefined && req.query.maxScore !== '') ? parseFloat(req.query.maxScore) : null;

        console.log(`🔍 Filter Request: Stream=${stream}, Batch=${batch}, Category=${category}, Min=${minScore}, Max=${maxScore}`);

        const query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { rollNumber: { $regex: search, $options: 'i' } }
            ];
        }
        if (stream !== 'All') query.stream = stream;
        if (batch !== 'All') query.batch = batch;
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

        if (page === null) {
            const students = await Student.find(query).lean();
            return res.json({ students, total: students.length });
        }

        const total = await Student.countDocuments(query);
        const studentsRaw = await Student.find(query)
            .skip(page * limit)
            .limit(limit)
            .lean();

        const students = await Promise.all(studentsRaw.map(async (s) => {
            const higherScores = await Student.countDocuments({ performanceScore: { $gt: s.performanceScore || 0 } });
            return { ...s, rank: higherScores + 1 };
        }));

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

// Register a new student
exports.registerStudent = async (req, res) => {
    try {
        const newStudent = new Student(req.body);
        await newStudent.save();
        res.json(newStudent);
    } catch (err) {
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
