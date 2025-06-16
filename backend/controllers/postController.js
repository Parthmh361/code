const axios = require('axios');
const Page = require('../models/Page');

// Edit a post
exports.editPost = async (req, res) => {
  const { postId, pageId, message } = req.body;

  if (!postId || !pageId || !message) {
    return res.status(400).json({ error: 'Missing postId, pageId, or message' });
  }

  try {
    // Fetch access token from DB
    const page = await Page.findOne({ pageId });
    if (!page || !page.access_token) {
      return res.status(404).json({ error: 'Page or access token not found in DB' });
    }

    const response = await axios.post(
      `https://graph.facebook.com/${postId}`,
      { message, access_token: page.access_token }
    );

    res.json({ success: true, response: response.data });

    // Optionally update the post in the DB if needed
    if (response.data && response.data.success) {
      await Page.updateOne(
        { pageId, "posts.postId": postId },
        { $set: { "posts.$.message": message } }
      );
    }
  } catch (error) {
    console.error('Edit error:', error?.response?.data || error.message);
    res.status(500).json({
      error: error?.response?.data?.error?.message || 'Failed to edit post'
    });
  }
};

// Delete a post
exports.deletePost = async (req, res) => {
  const { postId, pageId } = req.body;

  if (!postId || !pageId) {
    return res.status(400).json({ error: 'Missing postId or pageId' });
  }

  try {
    // Fetch access token from DB
    const page = await Page.findOne({ pageId });
    if (!page || !page.access_token) {
      return res.status(404).json({ error: 'Page or access token not found in DB' });
    }

    const response = await axios.delete(`https://graph.facebook.com/${postId}`, {
      params: { access_token: page.access_token }
    });

    res.json({ success: true, response: response.data });
  } catch (error) {
    console.error('Delete error:', error?.response?.data || error.message);
    res.status(500).json({
      error: error?.response?.data?.error?.message || 'Failed to delete post'
    });
  }
};