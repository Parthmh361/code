async function requireFacebookAuth(req, res, next) {
  console.log("Inside the middleware");

  const { user_id } = req.body || {};  // ← safe fallback
  console.log("user_id:", user_id);

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
      return next();
    }
    return res.status(401).json({ error: 'User not authenticated with Facebook' });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err });
  }
}
module.exports = requireFacebookAuth;
