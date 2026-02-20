const mongoose = require('mongoose');
require('dotenv').config();
const Student = require('./models/Student');
const MONGO_URI = process.env.MONGO_URI;

const verifyPercentiles = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const total = await Student.countDocuments();
        const best = await Student.countDocuments({ category: 'Best' });
        const medium = await Student.countDocuments({ category: 'Medium' });
        const worst = await Student.countDocuments({ category: 'Worst' });

        console.log(`\n📊 Total Students: ${total}`);
        console.log(`Best:   ${best} \t(${(best / total * 100).toFixed(1)}%) \t- Target: ~25%`);
        console.log(`Medium: ${medium} \t(${(medium / total * 100).toFixed(1)}%) \t- Target: ~50%`);
        console.log(`Worst:  ${worst} \t(${(worst / total * 100).toFixed(1)}%) \t- Target: ~25%`);

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
};

verifyPercentiles();
