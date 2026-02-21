const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const authMiddleware = require('../utils/authMiddleware');

router.get('/', authMiddleware, studentController.getStudents);
router.post('/', authMiddleware, studentController.registerStudent);
router.get('/:id/performance', authMiddleware, studentController.getStudentPerformance);

module.exports = router;
