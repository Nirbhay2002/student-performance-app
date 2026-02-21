const mongoose = require('mongoose');
const Admin = require('../models/Admin');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/student_performance';

const createAdmin = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB connected for admin creation.');

        const username = 'admin';
        const password = 'password123';

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ username });
        if (existingAdmin) {
            console.log('Admin user already exists.');
            process.exit(0);
        }

        const admin = new Admin({
            username,
            password
        });

        await admin.save();
        console.log(`Admin user created successfully! Username: ${username}, Password: ${password}`);

        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
};

createAdmin();
