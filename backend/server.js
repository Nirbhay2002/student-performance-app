const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/student_performance';
const redactedURI = MONGO_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');

// Global Mongoose Config
mongoose.set('bufferCommands', false);

async function startServer() {
  try {
    console.log(`🔌 Connecting to MongoDB: ${redactedURI}`);
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ MongoDB Connected');

    // ONLY LOAD MODELS AFTER CONNECTION
    const Student = require('./models/Student');
    const Marks = require('./models/Marks');
    const { calculatePerformance, getCategory, calculateAverageMarks } = require('./logic/ranking');

    // --- HEALTH CHECK ---
    app.get('/health', (req, res) => res.json({ status: 'UP' }));

    // --- API ROUTES ---

    app.get('/api/students', async (req, res) => {
      try {
        const page = parseInt(req.query.page) || 0;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const stream = req.query.stream || 'All';
        const batch = req.query.batch || 'All';

        const query = {};
        if (search) {
          query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { rollNumber: { $regex: search, $options: 'i' } }
          ];
        }
        if (stream !== 'All') query.stream = stream;
        if (batch !== 'All') query.batch = batch;

        const total = await Student.countDocuments(query);
        const students = await Student.find(query)
          .skip(page * limit)
          .limit(limit)
          .lean();

        // Fetch marks and calculate scores for the current slice
        const studentData = await Promise.all(students.map(async (student) => {
          const marks = await Marks.find({ studentId: student._id });
          const performanceScore = calculatePerformance(marks);
          const averageMarks = calculateAverageMarks(marks);
          const category = getCategory(performanceScore);

          return {
            ...student,
            performanceScore,
            averageMarks,
            category
          };
        }));

        res.json({
          students: studentData,
          total,
          page,
          totalPages: Math.ceil(total / limit)
        });
      } catch (err) {
        console.error('❌ Error in /api/students:', err.message);
        res.status(500).json({ error: err.message });
      }
    });

    // Register student
    app.post('/api/students', async (req, res) => {
      try {
        const newStudent = new Student(req.body);
        await newStudent.save();
        res.json(newStudent);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // Add marks
    app.post('/api/marks', async (req, res) => {
      try {
        const { studentId, ...markData } = req.body;
        const mark = new Marks({ studentId, ...markData });
        await mark.save();

        const allMarks = await Marks.find({ studentId });
        const score = calculatePerformance(allMarks);
        const avgMarks = calculateAverageMarks(allMarks);
        const category = getCategory(score);

        await Student.findByIdAndUpdate(studentId, {
          performanceScore: score,
          averageMarks: avgMarks,
          category: category
        });

        res.json({ mark, performanceScore: score, averageMarks: avgMarks, category });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // Student performance details
    app.get('/api/students/:id/performance', async (req, res) => {
      try {
        const marks = await Marks.find({ studentId: req.params.id }).sort('date');
        const student = await Student.findById(req.params.id);
        res.json({ student, marks });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // LISTEN
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}/api`);
    });

  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
}

startServer();
