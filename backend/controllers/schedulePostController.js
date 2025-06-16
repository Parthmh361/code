const FormData = require('form-data');
const axios = require('axios');
const Page = require('../models/Page');

// Helper to upload photo to Facebook
async function uploadPhoto({ pageId, pageAccessToken, caption, buffer, filename, scheduledTime }) {
  const formData = new FormData();
  formData.append('access_token', pageAccessToken);
  if (caption) formData.append('caption', caption);
  formData.append('published', scheduledTime ? 'false' : 'true');
  if (scheduledTime) formData.append('scheduled_publish_time', scheduledTime);
  formData.append('source', buffer, {
    filename: filename || 'photo.jpg',
    contentType: 'image/jpeg',
  });
  const response = await axios.post(
    `https://graph.facebook.com/${pageId}/photos`,
    formData,
    { headers: formData.getHeaders() }
  );
  return response.data;
}

// Helper to upload video to Facebook
async function uploadVideo({ pageId, pageAccessToken, description, buffer, filename, scheduledTime }) {
  const formData = new FormData();
  formData.append('access_token', pageAccessToken);
  if (description) formData.append('description', description);
  formData.append('published', scheduledTime ? 'false' : 'true');
  if (scheduledTime) formData.append('scheduled_publish_time', scheduledTime);
  formData.append('source', buffer, {
    filename: filename || 'video.mp4',
    contentType: 'video/mp4',
  });
  const response = await axios.post(
    `https://graph.facebook.com/${pageId}/videos`,
    formData,
    { headers: formData.getHeaders() }
  );
  return response.data;
}

// Schedule photo or video post with uploaded file
exports.schedulePost = async (req, res) => {
  try {
    const {
      user_id,
      pageId,
      caption,
      message,
      scheduledTime,
      mediaType,
    } = req.body;
       if (!user_id) {
      return res.status(400).json({ error: 'Missing user_id' });
    }
    if (!pageId || !req.file) {
      return res.status(400).json({ error: 'Missing required fields or file' });
    }

    const page = await Page.findOne({ pageId });
    if (!page || !page.access_token) {
      return res.status(404).json({ error: 'Page or access token not found in DB' });
    }

    const unixScheduledTime = parseInt(scheduledTime);
    if (isNaN(unixScheduledTime)) {
      return res.status(400).json({ error: 'Invalid scheduledTime' });
    }

    let responseData;
    if (mediaType === 'video') {
      responseData = await uploadVideo({
        pageId,
        pageAccessToken: page.access_token,
        description: caption || message,
        buffer: req.file.buffer,
        filename: req.file.originalname,
        scheduledTime: unixScheduledTime,
      });
    } else {
      responseData = await uploadPhoto({
        pageId,
        pageAccessToken: page.access_token,
        caption: caption || message,
        buffer: req.file.buffer,
        filename: req.file.originalname,
        scheduledTime: unixScheduledTime,
      });
    }

    page.posts = page.posts || [];
    page.posts.push({
      postId: responseData.id || responseData.post_id,
      message: caption || message,
      created_time: new Date().toISOString(),
    });
    await page.save();

    res.status(200).json({ success: true, postId: responseData.id || responseData.post_id || null });
  } catch (error) {
    console.error('Schedule Post Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to schedule post' });
  }
};

// Post photo or video immediately with uploaded file
exports.instantPost = async (req, res) => {
  try {
    const {
      user_id,
      pageId,
      caption,
      message,
      mediaType,
    } = req.body;
    console.log(req.file);
       if (!user_id) {
      return res.status(400).json({ error: 'Missing user_id' });
    }
    if (!pageId || !req.file) {
      return res.status(400).json({ error: 'Missing required fields or file' });
    }

    const page = await Page.findOne({ pageId });
    if (!page || !page.access_token) {
      return res.status(404).json({ error: 'Page or access token not found in DB' });
    }

    let responseData;
    if (mediaType === 'video') {
      responseData = await uploadVideo({
        pageId,
        pageAccessToken: page.access_token,
        description: caption || message,
        buffer: req.file.buffer,
        filename: req.file.originalname,
      });
    } else {
      responseData = await uploadPhoto({
        pageId,
        pageAccessToken: page.access_token,
        caption: caption || message,
        buffer: req.file.buffer,
        filename: req.file.originalname,
      });
    }

    page.posts = page.posts || [];
    page.posts.push({
      postId: responseData.id || responseData.post_id,
      message: caption || message,
      created_time: new Date().toISOString(),
    });
    await page.save();

    res.status(200).json({ success: true, postId: responseData.id || responseData.post_id || null });
  } catch (error) {
    console.error('Instant Post Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to post instantly' });
  }
};
