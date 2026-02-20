const mongoose = require('mongoose');
require('dotenv').config();

async function verify() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const Student = require('./models/Student');
        const Marks = require('./models/Marks');
        const { calculatePerformance, getCategory, calculateAverageMarks } = require('./logic/ranking');

        const students = await Student.find().lean();
        console.log(`Verifying ${students.length} students...\n`);

        const distribution = { Best: 0, Medium: 0, Worst: 0 };

        for (const student of students) {
            const marks = await Marks.find({ studentId: student._id });
            const score = calculatePerformance(marks, student.stream);
            const avg = calculateAverageMarks(marks, student.stream);
            const category = getCategory(score);

            distribution[category]++;

            console.log(`[${category.padEnd(6)}] ${student.name.padEnd(20)} (${student.stream}) | Avg: ${avg.toFixed(1)}% | Perf: ${score.toFixed(1)}`);
        }

        console.log('\nCategory Distribution:');
        console.log(JSON.stringify(distribution, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

verify();
