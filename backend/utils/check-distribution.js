const mongoose = require('mongoose');
require('dotenv').config();

const Student = require('./models/Student');
const Marks = require('./models/Marks');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/student_performance';

async function checkMarksDistribution() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const students = await Student.find();
        console.log(`Checking ${students.length} students...\n`);

        for (const student of students) {
            const marksCount = await Marks.countDocuments({ studentId: student._id });
            console.log(`Student: ${student.name} (${student.rollNumber})`);
            console.log(`_id: ${student._id}`);
            console.log(`Marks Count: ${marksCount}`);

            if (marksCount > 0) {
                const sampleMark = await Marks.findOne({ studentId: student._id });
                console.log(`Sample Mark studentId: ${sampleMark.studentId}`);
                console.log(`Types Match: ${typeof sampleMark.studentId === typeof student._id}`);
            }
            console.log('-------------------');
        }

        const totalMarks = await Marks.countDocuments();
        console.log(`\nTotal Marks in DB: ${totalMarks}`);

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await mongoose.connection.close();
    }
}

checkMarksDistribution();
