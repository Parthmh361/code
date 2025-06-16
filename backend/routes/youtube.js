const express = require('express');
const router = express.Router();
const multer = require('multer');
const youtubeController = require('../controllers/youtubeController');

const upload = multer({ dest: 'uploads/' });

router.get('/auth-url', youtubeController.getAuthUrl);
router.get('/oauth2callback', youtubeController.oauth2Callback);
router.get('/check-auth', youtubeController.checkAuth);
router.post('/schedule', upload.single('video'), youtubeController.scheduleVideo);
router.get('/uploads', youtubeController.getUploads);

module.exports = router;