const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

const seed = async () => {
    try {
        if (!MONGO_URI) throw new Error('MONGO_URI is missing from .env');

        console.log('🔗 Connecting to DB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected');

        const Student = require('./models/Student');
        const Marks = require('./models/Marks');

        await Student.deleteMany({});
        await Marks.deleteMany({});
        console.log('🗑️  Collections Cleared');

        const studentProfiles = [
            // High Achievers (85-95%)
            { name: 'Aarav Sharma', roll: 'NM001', stream: 'Non-Medical', trend: 'high' },
            { name: 'Diya Patel', roll: 'M001', stream: 'Medical', trend: 'high' },
            { name: 'Aditya Rao', roll: 'NM002', stream: 'Non-Medical', trend: 'high' },

            // Consistent Average (70-80%)
            { name: 'Arjun Kumar', roll: 'NM003', stream: 'Non-Medical', trend: 'average' },
            { name: 'Ananya Singh', roll: 'M002', stream: 'Medical', trend: 'average' },
            { name: 'Ishaan Malhotra', roll: 'NM004', stream: 'Non-Medical', trend: 'average' },
            { name: 'Sana Khan', roll: 'M003', stream: 'Medical', trend: 'average' },

            // Improving Trend (60% -> 85%)
            { name: 'Vihaan Reddy', roll: 'NM005', stream: 'Non-Medical', trend: 'improving' },
            { name: 'Isha Gupta', roll: 'M004', stream: 'Medical', trend: 'improving' },
            { name: 'Aryan Joshi', roll: 'NM006', stream: 'Non-Medical', trend: 'improving' },

            // Declining Trend (90% -> 60%)
            { name: 'Rohan Mehta', roll: 'NM007', stream: 'Non-Medical', trend: 'declining' },
            { name: 'Saanvi Nair', roll: 'M005', stream: 'Medical', trend: 'declining' },
            { name: 'Tanishq Jain', roll: 'NM008', stream: 'Non-Medical', trend: 'declining' },

            // Struggling (45-60%)
            { name: 'Kabir Verma', roll: 'NM009', stream: 'Non-Medical', trend: 'struggling' },
            { name: 'Myra Desai', roll: 'M006', stream: 'Medical', trend: 'struggling' },
            { name: 'Zoya Ahmed', roll: 'NM010', stream: 'Non-Medical', trend: 'struggling' },

            // Random Mixed
            { name: 'Devansh Pillai', roll: 'NM011', stream: 'Non-Medical', trend: 'random' },
            { name: 'Kiara Sen', roll: 'M007', stream: 'Medical', trend: 'random' },
            { name: 'Rishabh Pant', roll: 'NM012', stream: 'Non-Medical', trend: 'random' },
            { name: 'Avni Shah', roll: 'M008', stream: 'Medical', trend: 'random' }
        ];

        const exams = ['Mid-Term 1', 'Unit Test 1', 'Mid-Term 2', 'Unit Test 2', 'Final Exam'];

        for (const profile of studentProfiles) {
            const student = new Student({
                name: profile.name,
                rollNumber: profile.roll,
                email: `${profile.name.toLowerCase().replace(' ', '.')}@example.com`,
                batch: 'A1',
                stream: profile.stream
            });
            await student.save();

            for (let i = 0; i < exams.length; i++) {
                let baseScore;
                const progress = i / (exams.length - 1); // 0 to 1

                switch (profile.trend) {
                    case 'high':
                        baseScore = 88 + Math.random() * 7;
                        break;
                    case 'average':
                        baseScore = 72 + Math.random() * 8;
                        break;
                    case 'improving':
                        baseScore = 60 + (progress * 25) + (Math.random() * 5);
                        break;
                    case 'declining':
                        baseScore = 90 - (progress * 30) + (Math.random() * 5);
                        break;
                    case 'struggling':
                        baseScore = 45 + Math.random() * 15;
                        break;
                    default:
                        baseScore = 60 + Math.random() * 35;
                }

                const marks = new Marks({
                    studentId: student._id,
                    examName: exams[i],
                    date: new Date(Date.now() - (exams.length - 1 - i) * 30 * 24 * 60 * 60 * 1000), // Monthly intervals
                    scores: {
                        physics: Math.round(baseScore + (Math.random() * 6 - 3)),
                        chemistry: Math.round(baseScore + (Math.random() * 6 - 3)),
                        maths: profile.stream === 'Non-Medical' ? Math.round(baseScore + (Math.random() * 6 - 3)) : 0,
                        bio: profile.stream === 'Medical' ? Math.round(baseScore + (Math.random() * 6 - 3)) : 0,
                    },
                    attendance: Math.round(80 + Math.random() * 20),
                    disciplinePoint: Math.round(7 + Math.random() * 3),
                    remarks: `Performance trend: ${profile.trend}`
                });
                await marks.save();
            }
            console.log(`✅ Seeded: ${profile.name} (${profile.stream}) - Trend: ${profile.trend}`);
        }

        console.log('\n✨ RESEED COMPLETE: 20 Students, 100 Exam Records generated.');
        process.exit(0);
    } catch (err) {
        console.error('❌ SEED ERROR:', err);
        process.exit(1);
    }
};

seed();
