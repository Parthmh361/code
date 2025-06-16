const axios = require('axios');
const User = require('../models/User');
const Page = require('../models/Page');

// Helper to get Facebook App credentials
async function getFacebookCredentials(user_id) {
  const user = await User.findById(user_id);
  if (!user || !user.facebookAppId || !user.facebookAppSecret) {
    throw new Error('Facebook App credentials not found for user');
  }
  return {
    clientId: user.facebookAppId,
    clientSecret: user.facebookAppSecret,
  };
}

// Helper to get Facebook access token from DB
async function getFacebookAccessToken(user_id) {
  const user = await User.findById(user_id);
  if (!user || !user.facebookAccessToken) {
    throw new Error('Facebook access token not found for user');
  }
  if (user.facebookTokenExpiry && new Date() > user.facebookTokenExpiry) {
    throw new Error('Facebook token expired. Please authenticate again.');
  }
  return user.facebookAccessToken;
}

// Facebook Login
exports.facebookLogin = async (req, res) => {
  const { user_id } = req.query;
  try {
    const { clientId } = await getFacebookCredentials(user_id);
    const REDIRECT_URI = `https://socialsuit-backend-h9md.onrender.com/auth/facebook/callback`;
    const authURL = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=read_insights,pages_show_list,pages_read_engagement,pages_manage_posts,pages_read_user_content,pages_manage_metadata&response_type=code&state=${encodeURIComponent(user_id)}`;
    res.redirect(authURL);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Facebook Callback
exports.facebookCallback = async (req, res) => {
  const { code, state } = req.query;
  const user_id = state;
  try {
    const { clientId, clientSecret } = await getFacebookCredentials(user_id);
    const REDIRECT_URI = `https://socialsuit-backend-h9md.onrender.com/auth/facebook/callback`;
    const tokenRes = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
      params: {
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: REDIRECT_URI,
        code,
      }
    });
    const userAccessToken = tokenRes.data.access_token;
    await User.findByIdAndUpdate(user_id, {
      facebookAccessToken: userAccessToken,
      facebookTokenExpiry: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
      lastFacebookLogin: new Date()
    }, { new: true });
    res.redirect(`https://hbg-vercel-yhjj.vercel.app/home?auth=success&user_id=${user_id}`);
  } catch (error) {
    res.status(500).json({ error: 'Token exchange failed' });
  }
};

// Get Facebook Pages
exports.getFacebookPages = async (req, res) => {
  const { user_id } = req.query;
  console.log(user_id);
  if (!user_id) {
    return res.status(400).json({ error: 'Missing user_id' });
  }
  let token;
  try {
    token = await getFacebookAccessToken(user_id);
  } catch (err) {
    return res.status(401).json({ error: err.message });
  }
  try {
    const pageRes = await axios.get(`https://graph.facebook.com/me/accounts?access_token=${token}`);
    const pages = pageRes.data.data;
    console.log(pages);
    console.log(token);
    for (const page of pages) {
      await Page.findOneAndUpdate(
        { pageId: page.id },
        {
          pageId: page.id,
          name: page.name,
          category: page.category,
          category_list: page.category_list,
          access_token: page.access_token,
          tasks: page.tasks,
          userId: user_id
        },
        { upsert: true, new: true }
      );
    }
    const sanitizedPages = pages.map(({ access_token, ...rest }) => rest);
    res.json({ pages: sanitizedPages });
  } catch (err) {
    if (err.response?.data?.error?.code === 190) {
      await User.findByIdAndUpdate(user_id, {
        $unset: { facebookAccessToken: 1, facebookTokenExpiry: 1 }
      });
      return res.status(401).json({ error: 'Invalid Facebook token. Please authenticate again.' });
    }
    res.status(500).json({ error: 'Failed to fetch pages' });
  }
};

// Facebook Status
exports.facebookStatus = async (req, res) => {
  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ error: 'Missing user_id' });
  let isAuthenticated = false;
  let tokenExpiry = null;
  let lastLogin = null;
  try {
    const user = await User.findById(user_id).select('facebookAccessToken facebookTokenExpiry lastFacebookLogin');
    if (user?.facebookAccessToken && (!user.facebookTokenExpiry || new Date() < user.facebookTokenExpiry)) {
      isAuthenticated = true;
      tokenExpiry = user.facebookTokenExpiry;
      lastLogin = user.lastFacebookLogin;
    }
  } catch (err) {}
  res.json({
    authenticated: isAuthenticated,
    tokenExpiry,
    lastLogin,
    userId: user_id
  });
};

// Facebook Logout
exports.facebookLogout = async (req, res) => {
  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ error: 'Missing user_id' });
  try {
    await User.findByIdAndUpdate(user_id, {
      $unset: { facebookAccessToken: 1, facebookTokenExpiry: 1 }
    });
    res.status(200).json({ message: 'Logged out successfully from database' });
  } catch (err) {
    res.status(500).json({ error: 'Logout failed' });
  }
};
