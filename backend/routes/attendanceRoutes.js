const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const authMiddleware = require('../utils/authMiddleware');

router.post('/', authMiddleware, attendanceController.saveAttendance);
router.get('/', authMiddleware, attendanceController.getAttendance);
router.get('/student/:id', authMiddleware, attendanceController.getStudentAttendance);
router.delete('/:id', authMiddleware, attendanceController.deleteAttendance);

module.exports = router;
