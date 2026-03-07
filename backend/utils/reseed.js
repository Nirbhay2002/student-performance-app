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
        const Attendance = require('../models/Attendance');
        const { calculatePerformance, calculateAverageMarks, recalculateAllCategories } = require('../logic/ranking');

        await Student.deleteMany({});
        await Marks.deleteMany({});
        await Attendance.deleteMany({});
        console.log('🗑️  Collections Cleared');

        const firstNames = ['Aarav', 'Diya', 'Aditya', 'Arjun', 'Ananya', 'Ishaan', 'Sana', 'Vihaan', 'Isha', 'Aryan', 'Rohan', 'Saanvi', 'Tanishq', 'Kabir', 'Myra', 'Zoya', 'Devansh', 'Kiara', 'Rishabh', 'Avni', 'Rudra', 'Navya', 'Reyansh', 'Prisha', 'Krishna', 'Kaira', 'Shaurya', 'Anvi', 'Atharv', 'Aadhya'];
        const lastNames = ['Sharma', 'Patel', 'Singh', 'Rao', 'Kumar', 'Malhotra', 'Khan', 'Reddy', 'Gupta', 'Joshi', 'Mehta', 'Nair', 'Jain', 'Verma', 'Desai', 'Ahmed', 'Pillai', 'Sen', 'Pant', 'Shah', 'Pandey', 'Chopra', 'Kapoor', 'Iyer', 'Bose', 'Das', 'Mishra', 'Yadav', 'Thakur', 'Kulkarni'];
        const trends = ['high', 'average', 'improving', 'declining', 'struggling', 'random'];
        const streams = ['Medical', 'Non-Medical'];

        const subBatchConfig = [
            { label: 'Growth Morning', batch: 'Growth', subBatch: 'Growth Morning' },
            { label: 'Growth Evening', batch: 'Growth', subBatch: 'Growth Evening' },
            { label: 'Excel Morning', batch: 'Excel', subBatch: 'Excel Morning' },
            { label: 'Excel Evening', batch: 'Excel', subBatch: 'Excel Evening' },
            { label: 'Conquer Morning', batch: 'Conquer', subBatch: 'Conquer Morning' },
            { label: 'Conquer Evening', batch: 'Conquer', subBatch: 'Conquer Evening' },
        ];

        // ... (test names and exams same as before)
        const physicTests = [
            'Kinematics DPP', 'Laws of Motion Test', 'Work & Energy Quiz',
            'Rotational Mechanics', 'Gravitation Unit Test', 'Thermodynamics Mock',
            'Waves & Oscillations', 'Electrostatics Test', 'Current Electricity',
            'Optics Chapter Test', 'Modern Physics Mock', 'Magnetic Effects Test'
        ];
        const chemistryTests = [
            'Mole Concept Test', 'Chemical Bonding Quiz', 'Redox Reactions DPP',
            'Equilibrium Mock', 'Organic Basics Test', 'Hydrocarbons Unit Test',
            'Aldehydes & Ketones', 'Coordination Chemistry', 'p-Block Elements',
            's-Block Revision', 'Electrochemistry Test', 'Polymers Final Mock'
        ];
        const mathsTests = [
            'Quadratic Equations', 'Sequences & Series', 'Complex Numbers Test',
            'Permutations & Combi', 'Binomial Theorem', 'Trigonometry Mock',
            'Matrices & Determinants', 'Differential Calculus', 'Integral Calculus',
            'Vectors & 3D Test', 'Probability Quiz', 'Statistics Unit Test'
        ];
        const botanyTests = [
            'Cell Biology Test', 'Plant Morphology Quiz', 'Anatomy of Plants',
            'Cell Division Mock', 'Mineral Nutrition DPP', 'Photosynthesis Test',
            'Respiration in Plants', 'Plant Growth Chapter', 'Reproduction in Plants',
            'Anatomy Revision', 'Ecology Mock', 'Genetics & Evolution'
        ];
        const zoologyTests = [
            'Animal Kingdom Test', 'Structural Organisation', 'Human Physiology Mock',
            'Digestion & Absorption', 'Breathing & Exchange', 'Body Fluids Test',
            'Excretory Products', 'Locomotion & Movement', 'Neural Control Mock',
            'Chemical Coordination', 'Reproduction in Animals', 'Genetics Revision'
        ];

        const exams = [
            'April Unit Test', 'May Unit Test', 'June Mid-Term',
            'July Unit Test', 'August Unit Test', 'September Mid-Term',
            'October Unit Test', 'November Unit Test', 'December Mid-Term',
            'January Unit Test', 'February Unit Test', 'March Final Exam'
        ];

        const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
        const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
        const jitter = (v, d) => Math.round(clamp(v + (Math.random() * d * 2 - d), 0, 100));

        console.log('🌱 Generating 600 students with rich test data...');

        const createdStudentIds = [];

        for (let i = 1; i <= 600; i++) {
            const firstName = rand(firstNames);
            const lastName = rand(lastNames);
            const name = `${firstName} ${lastName} #${i}`;
            const stream = streams[Math.floor(Math.random() * streams.length)];
            const config = rand(subBatchConfig);
            const batch = config.batch;
            const subBatch = config.subBatch;
            const trend = rand(trends);
            const rollPrefix = stream === 'Medical' ? 'M' : 'NM';
            const roll = `${rollPrefix}${i.toString().padStart(3, '0')}`;

            const baseRank = Math.floor(Math.random() * 600) + 1;
            const rankVariance = trend === 'improving' ? Math.floor(Math.random() * 50) + 10
                : trend === 'declining' ? -(Math.floor(Math.random() * 50) + 10)
                    : Math.floor(Math.random() * 20) - 10;
            const prevRank = clamp(baseRank + rankVariance, 1, 600);
            const bestRankSimulated = Math.max(1, Math.min(baseRank, prevRank) - Math.floor(Math.random() * 30));

            const student = new Student({
                name, rollNumber: roll,
                email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${i}@example.com`,
                batch, subBatch, stream,
                performanceScore: 0, averageMarks: 0, category: 'Medium',
                currentRank: baseRank, previousRank: prevRank, bestRank: bestRankSimulated,
                previousPerformanceScore:
                    trend === 'improving' ? Math.random() * 60
                        : trend === 'declining' ? 70 + Math.random() * 20
                            : 50 + Math.random() * 30
            });
            await student.save();
            createdStudentIds.push(student);

            const subjectBias = {
                high: { physics: +5, chemistry: +3, maths: +4, botany: +6, zoology: +5 },
                average: { physics: 0, chemistry: +2, maths: -3, botany: +1, zoology: -2 },
                improving: { physics: -8, chemistry: -5, maths: -10, botany: -6, zoology: -7 },
                declining: { physics: +2, chemistry: -4, maths: +3, botany: -5, zoology: +1 },
                struggling: { physics: -12, chemistry: -8, maths: -15, botany: -10, zoology: -9 },
                random: { physics: 0, chemistry: 0, maths: 0, botany: 0, zoology: 0 }
            };
            const bias = subjectBias[trend];
            const examRecords = [];

            for (let j = 0; j < exams.length; j++) {
                const progress = j / (exams.length - 1);
                let base;
                switch (trend) {
                    case 'high': base = 82 + Math.random() * 10; break;
                    case 'average': base = 68 + Math.random() * 10; break;
                    case 'improving': base = 48 + progress * 35 + Math.random() * 5; break;
                    case 'declining': base = 88 - progress * 35 + Math.random() * 5; break;
                    case 'struggling': base = 35 + Math.random() * 18; break;
                    default: base = 55 + Math.random() * 38;
                }
                base = clamp(base, 10, 100);

                examRecords.push(new Marks({
                    studentId: student._id,
                    testNames: {
                        physics: physicTests[j % physicTests.length],
                        chemistry: chemistryTests[j % chemistryTests.length],
                        maths: stream === 'Non-Medical' ? mathsTests[j % mathsTests.length] : null,
                        botany: stream === 'Medical' ? botanyTests[j % botanyTests.length] : null,
                        zoology: stream === 'Medical' ? zoologyTests[j % zoologyTests.length] : null,
                    },
                    date: new Date(Date.now() - (exams.length - 1 - j) * 30 * 24 * 60 * 60 * 1000),
                    scores: {
                        physics: jitter(base + bias.physics, 8),
                        chemistry: jitter(base + bias.chemistry, 8),
                        maths: stream === 'Non-Medical' ? jitter(base + bias.maths, 8) : null,
                        botany: stream === 'Medical' ? jitter(base + bias.botany, 8) : null,
                        zoology: stream === 'Medical' ? jitter(base + bias.zoology, 8) : null,
                    },
                    maxScores: { physics: 100, chemistry: 100, maths: 100, botany: 100, zoology: 100 },
                    attendance: Math.round(clamp(80 + Math.random() * 20, 60, 100)),
                    remarks: `${trend} trend · ${exams[j]}`
                }));
            }
            await Marks.insertMany(examRecords);

            const perfScore = calculatePerformance(examRecords, stream);
            const avgMarks = calculateAverageMarks(examRecords, stream);
            await Student.findByIdAndUpdate(student._id, { performanceScore: perfScore, averageMarks: avgMarks });

            if (i % 100 === 0) console.log(`🚀 Progress: ${i}/600 students seeded...`);
        }

        console.log('📅 Generating some attendance history (last 10 days)...');
        for (let d = 0; d < 10; d++) {
            const date = new Date();
            date.setDate(date.getDate() - d);
            date.setUTCHours(0, 0, 0, 0);

            for (const config of subBatchConfig) {
                for (const stream of streams) {
                    const batchStudents = createdStudentIds.filter(s => s.batch === config.batch && s.subBatch === config.subBatch && s.stream === stream);
                    if (batchStudents.length === 0) continue;

                    const records = batchStudents.map(s => ({
                        studentId: s._id,
                        status: Math.random() > 0.15 ? 'Present' : 'Absent'
                    }));

                    await new Attendance({
                        date,
                        batch: config.batch,
                        subBatch: config.subBatch,
                        stream,
                        records
                    }).save().catch(() => { }); // catch unique constraint if any (not expected here)
                }
            }
        }

        console.log('🔄 Recalculating Percentile Categories...');
        await recalculateAllCategories(Student);

        const best = await Student.countDocuments({ category: 'Best' });
        const medium = await Student.countDocuments({ category: 'Medium' });
        const worst = await Student.countDocuments({ category: 'Worst' });

        console.log(`\n✨ RESEED COMPLETE`);
        console.log(`   Best: ${best} · Medium: ${medium} · Worst: ${worst}`);
        process.exit(0);
    } catch (err) {
        console.error('❌ SEED ERROR:', err);
        process.exit(1);
    }
};

seed();
