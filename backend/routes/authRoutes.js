const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_123';

// @route   POST /api/auth/login
// @desc    Authenticate admin & get token
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check for user
        const admin = await Admin.findOne({ username });
        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Compare password
        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Create and sign JWT
        const payload = {
            user: {
                id: admin.id,
                username: admin.username
            }
        };

        jwt.sign(
            payload,
            JWT_SECRET,
            { expiresIn: '24h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, message: 'Login successful' });
            }
        );

    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
