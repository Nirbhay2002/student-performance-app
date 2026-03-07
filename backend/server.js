const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
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
    app.get('/api/health', (req, res) => res.json({ status: 'UP' }));

    // --- API ROUTES ---
    const authRoutes = require('./routes/authRoutes');
    const studentRoutes = require('./routes/studentRoutes');
    const markRoutes = require('./routes/markRoutes');
    const attendanceRoutes = require('./routes/attendanceRoutes');

    app.use('/api/auth', authRoutes);
    app.use('/api/students', studentRoutes);
    app.use('/api/marks', markRoutes);
    app.use('/api/attendance', attendanceRoutes);

    // LISTEN
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}/api`);

      // --- SELF PING TO KEEP AWAKE (For Render Free Tier) ---
      const EXTERNAL_URL = process.env.VITE_API_URL_PROD || `http://localhost:${PORT}`;
      setInterval(async () => {
        try {
          console.log('💓 Wakey Wakey, Eggs and bakey nigga');
          await axios.get(`${EXTERNAL_URL}/api/health`);
        } catch (err) {
          console.error('❌ Self-ping failed:', err.message);
        }
      }, 14 * 60 * 1000); // 14 minutes
    });

  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
}

startServer();
