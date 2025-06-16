const express = require('express');
const router = express.Router();
const multer = require('multer');
const schedulePostController = require('../controllers/schedulePostController');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/timing', upload.single('file'), schedulePostController.schedulePost);
router.post('/instantly', upload.single('file'), schedulePostController.instantPost);

module.exports = router;