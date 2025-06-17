const User = require('../models/User');

// Middleware to require Facebook authentication using user_id in query
async function requireFacebookAuth(req, res, next) {
  console.log("INside the middleware");
  const user_id = req.query.user_id;
  console.log(user_id);
  if (!user_id) {
    return res.status(400).json({ error: 'Missing user_id' });
  }
  try {
    const user = await User.findById(user_id);
    if (
      user &&
      user.facebookAccessToken &&
      (!user.facebookTokenExpiry || new Date() < user.facebookTokenExpiry)
    ) {
      // User is authenticated with Facebook
      return next();
    }
    return res.status(401).json({ error: 'User not authenticated with Facebook' });
  } catch (err) {
    return res.status(500).json({ error: 'Authentication check failed' });
  }
}

module.exports = requireFacebookAuth;
