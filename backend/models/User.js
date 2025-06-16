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

  // Facebook OAuth fields
  facebookAccessToken: String,
  facebookTokenExpiry: Date,
  lastFacebookLogin: Date,

  // Instagram OAuth fields (optional, for future use)
  instagramAccessToken: String,
  instagramTokenExpiry: Date,
  lastInstagramLogin: Date,

  // YouTube OAuth fields (optional, for future use)
  youtubeAccessToken: String,
  youtubeRefreshToken: String,
  youtubeTokenExpiry: Date,
  lastYouTubeLogin: Date,
});

module.exports = mongoose.model('User', userSchema);