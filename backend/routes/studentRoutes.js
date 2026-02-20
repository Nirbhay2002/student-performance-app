const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

router.get('/', studentController.getStudents);
router.post('/', studentController.registerStudent);
router.get('/:id/performance', studentController.getStudentPerformance);

module.exports = router;
