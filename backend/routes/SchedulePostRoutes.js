const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const requireFacebookAuth = require('../middlewares/userAuthMiddleware');
const schedulePostController = require('../controllers/schedulePostController');

// Order matters: multer goes first, then auth middleware
router.post('/timing', 
            (req, res, next) => {
  console.log('--- Incoming Request ---');
  console.log('Headers:', req.headers);
  
  let rawData = '';
  req.on('data', chunk => rawData += chunk);
  req.on('end', () => {
    console.log('Raw body:', rawData);
    next(); // proceed to multer
  });
},
            upload.single('file'), requireFacebookAuth, schedulePostController.schedulePost);
router.post('/instantly',
            (req, res, next) => {
  console.log('--- Incoming Request ---');
  console.log('Headers:', req.headers);
  
  let rawData = '';
  req.on('data', chunk => rawData += chunk);
  req.on('end', () => {
    console.log('Raw body:', rawData);
    next(); // proceed to multer
  });
},
            upload.single('file'), requireFacebookAuth, schedulePostController.instantPost);

module.exports = router;
