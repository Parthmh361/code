const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const requireFacebookAuth = require('../middlewares/userAuthMiddleware');
const schedulePostController = require('../controllers/schedulePostController');

// Order matters: multer goes first, then auth middleware
router.post('/timing', upload.single('file'), requireFacebookAuth, schedulePostController.schedulePost);
router.post('/instantly', upload.single('file'), requireFacebookAuth, schedulePostController.instantPost);

module.exports = router;
