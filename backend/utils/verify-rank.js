const mongoose = require('mongoose');
require('dotenv').config();

const Student = require('./models/Student');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/student_performance';

const verifyRank = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Fetch top 5 students based on performanceScore
        const topStudents = await Student.find().sort({ performanceScore: -1 }).limit(5).lean();

        console.log('\n🏆 Top 5 Students (Expected Ranks 1-5):');
        for (const s of topStudents) {
            const higherScores = await Student.countDocuments({ performanceScore: { $gt: s.performanceScore || 0 } });
            const rank = higherScores + 1;
            console.log(`Rank #${rank}: ${s.name} - Score: ${s.performanceScore.toFixed(2)}`);
        }

        // Fetch a random student
        const randomStudent = await Student.findOne().skip(100).lean();
        if (randomStudent) {
            const higherScores = await Student.countDocuments({ performanceScore: { $gt: randomStudent.performanceScore || 0 } });
            const rank = higherScores + 1;
            console.log(`\n🎲 Random Check: ${randomStudent.name}`);
            console.log(`Score: ${randomStudent.performanceScore.toFixed(2)} -> Rank #${rank}`);
        }

    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
};

verifyRank();
