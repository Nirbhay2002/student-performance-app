const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const markController = require('../controllers/markController');
const authMiddleware = require('../utils/authMiddleware');

router.post('/', authMiddleware, markController.addMark);
router.post('/bulk', authMiddleware, upload.single('file'), markController.bulkUpload);

module.exports = router;
