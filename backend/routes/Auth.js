const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Register route
router.post('/register', authController.register);

// Login route
router.post('/login', authController.login);

// Update App Credentials route
router.put('/update-app-credentials', authController.updateAppCredentials);

module.exports = router;