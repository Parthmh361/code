const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register Controller
exports.register = async (req, res) => {
  const { username, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  try {
    const user = await User.create({ username, password: hashed });
    res.status(201).json({ message: 'User created' });
  } catch (err) {
    res.status(400).json({ error: 'User already exists' });
  }
};

// Login Controller
exports.login = async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token, user: { username: user.username, _id: user._id } });
};

// Update App Credentials Controller
exports.updateAppCredentials = async (req, res) => {
  const { user_id, facebookAppId, facebookAppSecret, instagramAppId, instagramAppSecret, youtubeAppId, youtubeAppSecret } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      user_id,
      {
        facebookAppId,
        facebookAppSecret,
        instagramAppId,
        instagramAppSecret,
        youtubeAppId,
        youtubeAppSecret,
      },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'App credentials updated', user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update credentials' });
  }
};