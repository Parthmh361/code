const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  data: mongoose.Schema.Types.Mixed, // Store analytics/insights data as JSON
  fetchedAt: { type: Date, default: Date.now }
});

const postSchema = new mongoose.Schema({
  postId: String,
  message: String,
  created_time: String,
  full_picture: String,
  attachments: mongoose.Schema.Types.Mixed,
  likes: mongoose.Schema.Types.Mixed,
  comments: mongoose.Schema.Types.Mixed,
  analytics: [analyticsSchema], // Array of analytics snapshots for this post
  // Add more fields as needed
});

const pageSchema = new mongoose.Schema({
  pageId: { type: String, unique: true },
  name: String,
  category: String,
  category_list: mongoose.Schema.Types.Mixed,
  access_token: String,
  tasks: [String],
  posts: [postSchema], // Array of posts for this page
  analytics: [analyticsSchema], // Array of analytics snapshots for this page
});

module.exports = mongoose.model('Page', pageSchema);