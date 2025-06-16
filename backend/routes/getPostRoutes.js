const express = require('express');
const router = express.Router();
const postFetchController = require('../controllers/postFetchController');

router.get('/getallposts', postFetchController.getAllPosts);
router.get('/getallpostsfilter', postFetchController.getAllPostsFilter);

module.exports = router;