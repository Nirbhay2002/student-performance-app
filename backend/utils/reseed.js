const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

const seed = async () => {
    try {
        if (!MONGO_URI) throw new Error('MONGO_URI is missing from .env');

        console.log('🔗 Connecting to DB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected');

        const Student = require('../models/Student');
        const Marks = require('../models/Marks');
        const { calculatePerformance, calculateAverageMarks, recalculateAllCategories } = require('../logic/ranking');

        await Student.deleteMany({});
        await Marks.deleteMany({});
        console.log('🗑️  Collections Cleared');

        const firstNames = ['Aarav', 'Diya', 'Aditya', 'Arjun', 'Ananya', 'Ishaan', 'Sana', 'Vihaan', 'Isha', 'Aryan', 'Rohan', 'Saanvi', 'Tanishq', 'Kabir', 'Myra', 'Zoya', 'Devansh', 'Kiara', 'Rishabh', 'Avni', 'Rudra', 'Navya', 'Reyansh', 'Prisha', 'Krishna', 'Kaira', 'Shaurya', 'Anvi', 'Atharv', 'Aadhya'];
        const lastNames = ['Sharma', 'Patel', 'Singh', 'Rao', 'Kumar', 'Malhotra', 'Khan', 'Reddy', 'Gupta', 'Joshi', 'Mehta', 'Nair', 'Jain', 'Verma', 'Desai', 'Ahmed', 'Pillai', 'Sen', 'Pant', 'Shah', 'Pandey', 'Chopra', 'Kapoor', 'Iyer', 'Bose', 'Das', 'Mishra', 'Yadav', 'Thakur', 'Kulkarni'];
        const trends = ['high', 'average', 'improving', 'declining', 'struggling', 'random'];
        const streams = ['Medical', 'Non-Medical'];
        const batches = ['Growth', 'Excel', 'Conquer'];

        console.log('🌱 Generating 600 students...');

        const exams = [
            'April Unit Test', 'May Unit Test', 'June Mid-Term',
            'July Unit Test', 'August Unit Test', 'September Mid-Term',
            'October Unit Test', 'November Unit Test', 'December Mid-Term',
            'January Unit Test', 'February Unit Test', 'March Final Exam'
        ];

        for (let i = 1; i <= 600; i++) {
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            const name = `${firstName} ${lastName} #${i}`;
            const stream = streams[Math.floor(Math.random() * streams.length)];
            const batch = batches[Math.floor(Math.random() * batches.length)];
            const trend = trends[Math.floor(Math.random() * trends.length)];
            const rollPrefix = stream === 'Medical' ? 'M' : 'NM';
            const roll = `${rollPrefix}${i.toString().padStart(3, '0')}`;

            const baseRank = Math.floor(Math.random() * 600) + 1;
            const rankVariance = trend === 'improving' ? Math.floor(Math.random() * 50) + 10 :
                trend === 'declining' ? -(Math.floor(Math.random() * 50) + 10) :
                    Math.floor(Math.random() * 20) - 10;

            const prevRank = Math.max(1, Math.min(600, baseRank + rankVariance));
            const bestRankSimulated = Math.max(1, Math.min(baseRank, prevRank) - Math.floor(Math.random() * 30));

            const student = new Student({
                name,
                rollNumber: roll,
                email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${i}@example.com`,
                batch,
                stream,
                performanceScore: 0,
                averageMarks: 0,
                category: 'Medium',
                currentRank: baseRank,
                previousRank: prevRank,
                bestRank: bestRankSimulated,
                previousPerformanceScore: trend === 'improving' ? Math.random() * 60 :
                    trend === 'declining' ? 70 + Math.random() * 20 :
                        50 + Math.random() * 30
            });
            await student.save();

            let examRecords = [];

            for (let j = 0; j < exams.length; j++) {
                let baseScore;
                const progress = j / (exams.length - 1);

                switch (trend) {
                    case 'high': baseScore = 88 + Math.random() * 7; break;
                    case 'average': baseScore = 72 + Math.random() * 8; break;
                    case 'improving': baseScore = 60 + (progress * 25) + (Math.random() * 5); break;
                    case 'declining': baseScore = 90 - (progress * 30) + (Math.random() * 5); break;
                    case 'struggling': baseScore = 45 + Math.random() * 15; break;
                    default: baseScore = 60 + Math.random() * 35;
                }

                const marks = new Marks({
                    studentId: student._id,
                    examName: exams[j],
                    date: new Date(Date.now() - (exams.length - 1 - j) * 30 * 24 * 60 * 60 * 1000),
                    scores: {
                        physics: Math.round(baseScore + (Math.random() * 6 - 3)),
                        chemistry: Math.round(baseScore + (Math.random() * 6 - 3)),
                        maths: stream === 'Non-Medical' ? Math.round(baseScore + (Math.random() * 6 - 3)) : 0,
                        bio: stream === 'Medical' ? Math.round(baseScore + (Math.random() * 6 - 3)) : 0,
                    },
                    attendance: Math.round(80 + Math.random() * 20),
                    remarks: `Auto-generated ${trend} trend`
                });
                examRecords.push(marks);
            }

            // Save all marks for this student
            await Marks.insertMany(examRecords);

            // Calculate overall performance once for seeding
            const perfScore = calculatePerformance(examRecords, stream);
            const avgMarks = calculateAverageMarks(examRecords, stream);

            await Student.findByIdAndUpdate(student._id, {
                performanceScore: perfScore,
                averageMarks: avgMarks
            });

            if (i % 50 === 0) console.log(`🚀 Progress: ${i}/600 students seeded...`);
        }

        console.log('🔄 Recalculating Percentile Categories...');
        await recalculateAllCategories(Student);

        console.log('\n✨ RESEED COMPLETE: 600 Students generated with full exam history.');
        process.exit(0);
    } catch (err) {
        console.error('❌ SEED ERROR:', err);
        process.exit(1);
    }
};

seed();
