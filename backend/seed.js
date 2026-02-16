const mongoose = require('mongoose');
require('dotenv').config();

const Student = require('./models/Student');
const Marks = require('./models/Marks');
const { calculatePerformance, getCategory } = require('./logic/ranking');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/student_performance';

// Sample student data
const students = [
    { name: 'Aarav Sharma', rollNumber: 'STU001', email: 'parent.aarav@example.com', batch: 'Batch A' },
    { name: 'Diya Patel', rollNumber: 'STU002', email: 'parent.diya@example.com', batch: 'Batch A' },
    { name: 'Arjun Kumar', rollNumber: 'STU003', email: 'parent.arjun@example.com', batch: 'Batch B' },
    { name: 'Ananya Singh', rollNumber: 'STU004', email: 'parent.ananya@example.com', batch: 'Batch A' },
    { name: 'Vihaan Reddy', rollNumber: 'STU005', email: 'parent.vihaan@example.com', batch: 'Batch B' },
    { name: 'Isha Gupta', rollNumber: 'STU006', email: 'parent.isha@example.com', batch: 'Batch C' },
    { name: 'Rohan Mehta', rollNumber: 'STU007', email: 'parent.rohan@example.com', batch: 'Batch C' },
    { name: 'Saanvi Joshi', rollNumber: 'STU008', email: 'parent.saanvi@example.com', batch: 'Batch B' },
    { name: 'Kabir Verma', rollNumber: 'STU009', email: 'parent.kabir@example.com', batch: 'Batch A' },
    { name: 'Myra Desai', rollNumber: 'STU010', email: 'parent.myra@example.com', batch: 'Batch C' },
];

// Helper function to generate random marks with some variance
const generateMarks = (baseScore, variance = 15) => {
    return Math.max(0, Math.min(100, baseScore + (Math.random() * variance * 2 - variance)));
};

// Generate exam data for each student
const generateExamData = (studentId, studentIndex) => {
    const exams = ['Mid-Term 1', 'Unit Test 1', 'Mid-Term 2', 'Unit Test 2', 'Final Exam'];
    const dates = [
        new Date('2024-01-15'),
        new Date('2024-02-20'),
        new Date('2024-03-25'),
        new Date('2024-05-10'),
        new Date('2024-06-15'),
    ];

    // Different performance profiles for variety
    const profiles = [
        { math: 85, science: 80, english: 75, attendance: 95, discipline: 9 }, // Excellent
        { math: 75, science: 70, english: 80, attendance: 90, discipline: 8 }, // Good
        { math: 60, science: 65, english: 70, attendance: 85, discipline: 7 }, // Average
        { math: 50, science: 55, english: 60, attendance: 75, discipline: 6 }, // Below Average
    ];

    const profile = profiles[studentIndex % profiles.length];

    return exams.map((examName, index) => {
        // Add progressive improvement or decline
        const trend = (index - 2) * 3; // Some students improve, some decline
        const attendanceTrend = studentIndex % 2 === 0 ? index * 1 : -index * 0.5;

        return {
            studentId,
            examName,
            date: dates[index],
            scores: {
                math: Math.round(generateMarks(profile.math + trend)),
                science: Math.round(generateMarks(profile.science + trend)),
                english: Math.round(generateMarks(profile.english + trend)),
            },
            maxScore: 300,
            attendance: Math.max(60, Math.min(100, profile.attendance + attendanceTrend)),
            disciplinePoint: Math.max(1, Math.min(10, profile.discipline + (index % 2 === 0 ? 0.5 : -0.3))),
            remarks: index === exams.length - 1 ? 'Final performance evaluation' : '',
        };
    });
};

const seedDatabase = async () => {
    try {
        console.log('🔌 Connecting to MongoDB Atlas...')
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await Student.deleteMany({});
        await Marks.deleteMany({});
        console.log('✅ Existing data cleared');

        // Insert students
        console.log('👥 Creating students...');
        const createdStudents = await Student.insertMany(students);
        console.log(`✅ Created ${createdStudents.length} students`);

        // Insert marks for each student
        console.log('📝 Creating exam records...');
        let totalMarks = 0;

        for (let i = 0; i < createdStudents.length; i++) {
            const student = createdStudents[i];
            const examData = generateExamData(student._id, i);

            // Insert all exams for this student
            const createdMarks = await Marks.insertMany(examData);
            totalMarks += createdMarks.length;

            // Calculate and update performance
            const allMarks = await Marks.find({ studentId: student._id });
            const score = calculatePerformance(allMarks);
            const avgMarks = calculateAverageMarks(allMarks);
            const category = getCategory(score);

            await Student.findByIdAndUpdate(student._id, {
                performanceScore: score,
                averageMarks: avgMarks,
                category: category,
            });

            console.log(`  ✓ ${student.name}: ${createdMarks.length} exams, Score: ${score.toFixed(2)}, Marks: ${avgMarks.toFixed(1)}, Category: ${category}`);
        }

        console.log(`✅ Created ${totalMarks} exam records`);
        console.log('\n📊 Database seeding completed successfully!');
        console.log('\n📈 Summary:');

        const bestStudents = await Student.find({ category: 'Best' }).countDocuments();
        const mediumStudents = await Student.find({ category: 'Medium' }).countDocuments();
        const worstStudents = await Student.find({ category: 'Worst' }).countDocuments();

        console.log(`   Best: ${bestStudents} students`);
        console.log(`   Medium: ${mediumStudents} students`);
        console.log(`   Worst: ${worstStudents} students`);

    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
    }
};

// Run the seed function
seedDatabase();
