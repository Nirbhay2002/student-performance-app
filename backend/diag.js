const mongoose = require('mongoose');
require('dotenv').config();

const diag = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const Marks = require('./models/Marks');
        const Student = require('./models/Student');

        const s = await Student.findOne();
        if (!s) {
            console.log('No student found to attach marks to');
            process.exit(1);
        }

        const m = new Marks({
            studentId: s._id,
            examName: 'Diag',
            attendance: 90,
            disciplinePoint: 9,
            scores: { physics: 70, chemistry: 70, maths: 70, bio: 0 }
        });

        try {
            await m.save();
            console.log('SUCCESS');
        } catch (e) {
            console.log('VALIDATION_ERROR');
            if (e.errors) {
                for (const key in e.errors) {
                    console.log(`FIELD: ${key} - MSG: ${e.errors[key].message}`);
                }
            } else {
                console.log(e.message);
            }
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

diag();
