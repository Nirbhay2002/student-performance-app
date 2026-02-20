const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const markController = require('../controllers/markController');

router.post('/', markController.addMark);
router.post('/bulk', upload.single('file'), markController.bulkUpload);

module.exports = router;
