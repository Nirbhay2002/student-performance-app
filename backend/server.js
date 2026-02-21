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

    // --- HEALTH CHECK ---
    app.get('/health', (req, res) => res.json({ status: 'UP' }));

    // --- API ROUTES ---
    const authRoutes = require('./routes/authRoutes');
    const studentRoutes = require('./routes/studentRoutes');
    const markRoutes = require('./routes/markRoutes');

    app.use('/api/auth', authRoutes);
    app.use('/api/students', studentRoutes);
    app.use('/api/marks', markRoutes);

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
