function requireFacebookAuth(req, res, next) {
  if (req.session && req.session.userAccessToken) {
    // User is authenticated with Facebook
    return next();
  }
  // Not authenticated
  return res.status(401).json({ error: 'User not authenticated with Facebook' });
}

module.exports = requireFacebookAuth;