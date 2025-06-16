const axios = require('axios');
const Page = require('../models/Page');

// Get all posts for a page
exports.getAllPosts = async (req, res) => {
  const { pageId } = req.query;
  if (!pageId) {
    return res.status(400).json({ error: 'Missing pageId' });
  }

  try {
    const page = await Page.findOne({ pageId });
    if (page && page.posts && page.posts.length > 0) {
      return res.json({ posts: page.posts });
    }

    if (!page || !page.access_token) {
      return res.status(404).json({ error: 'Page or access token not found in DB' });
    }

    const { data } = await axios.get(`https://graph.facebook.com/${pageId}/posts`, {
      params: {
        access_token: page.access_token,
        fields: [
          'id',
          'message',
          'created_time',
          'full_picture',
          'attachments{media_type,media,url}',
          'likes.summary(true)',
          'comments.summary(true){message,from,created_time}'
        ].join(',')
      }
    });

    page.posts = data.data.map(post => ({
      postId: post.id,
      message: post.message,
      created_time: post.created_time,
      full_picture: post.full_picture,
      attachments: post.attachments,
      likes: post.likes,
      comments: post.comments,
    }));
    await page.save();

    res.json({ posts: page.posts });
  } catch (error) {
    console.error('Facebook API error:', error?.response?.data || error.message);
    return res.status(500).json({
      error: error?.response?.data?.error?.message || 'Failed to fetch posts from Facebook'
    });
  }
};

// Get all posts with filter/sort
exports.getAllPostsFilter = async (req, res) => {
  const { pageId, sortBy, order = 'desc' } = req.query;

  if (!pageId) {
    return res.status(400).json({ error: 'Missing pageId' });
  }

  try {
    const page = await Page.findOne({ pageId });
    let posts = [];
    if (page && page.posts && page.posts.length > 0) {
      posts = [...page.posts];
    } else {
      if (!page || !page.access_token) {
        return res.status(404).json({ error: 'Page or access token not found in DB' });
      }

      const fbRes = await axios.get(`https://graph.facebook.com/${pageId}/posts`, {
        params: {
          access_token: page.access_token,
          fields: [
            'id',
            'message',
            'created_time',
            'full_picture',
            'attachments{media_type,media,url}',
            'likes.summary(true)',
            'comments.summary(true){message,from,created_time}'
          ].join(',')
        }
      });

      posts = fbRes.data.data.map(post => ({
        postId: post.id,
        message: post.message,
        created_time: post.created_time,
        full_picture: post.full_picture,
        attachments: post.attachments,
        likes: post.likes,
        comments: post.comments,
      }));

      page.posts = posts;
      await page.save();
    }

    // Sorting
    if (sortBy === 'likes') {
      posts.sort((a, b) =>
        (order === 'asc' ? 1 : -1) *
        ((a.likes?.summary?.total_count || 0) - (b.likes?.summary?.total_count || 0))
      );
    } else if (sortBy === 'comments') {
      posts.sort((a, b) =>
        (order === 'asc' ? 1 : -1) *
        ((a.comments?.summary?.total_count || 0) - (b.comments?.summary?.total_count || 0))
      );
    } else if (sortBy === 'date') {
      posts.sort((a, b) =>
        (order === 'asc' ? 1 : -1) *
        (new Date(a.created_time) - new Date(b.created_time))
      );
    }

    res.json(posts);
  } catch (error) {
    console.error('Facebook API error:', error?.response?.data || error.message);
    return res.status(500).json({
      error: error?.response?.data?.error?.message || 'Failed to fetch posts from Facebook'
    });
  }
};