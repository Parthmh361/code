const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  facebookAppId: String,
  facebookAppSecret: String,
  instagramAppId: String,
  instagramAppSecret: String,
  youtubeAppId: String,
  youtubeAppSecret: String,
});

module.exports = mongoose.model('User', userSchema);