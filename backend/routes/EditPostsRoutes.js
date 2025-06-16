const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

router.post('/editpost', postController.editPost);
router.delete('/deletepost', postController.deletePost);

module.exports = router;