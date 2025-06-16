const express = require('express');
const router = express.Router();
const insightsController = require('../controllers/insightsController');

router.get('/page', insightsController.getPageInsights);
router.get('/post', insightsController.getPostInsights);

module.exports = router;