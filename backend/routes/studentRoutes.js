const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const authMiddleware = require('../utils/authMiddleware');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', authMiddleware, studentController.getStudents);
router.get('/roll/:rollNumber', authMiddleware, studentController.getStudentByRoll);
router.post('/', authMiddleware, studentController.registerStudent);
router.get('/:id/performance', authMiddleware, studentController.getStudentPerformance);
router.post('/bulk', authMiddleware, upload.single('file'), studentController.bulkUpload);

module.exports = router;
