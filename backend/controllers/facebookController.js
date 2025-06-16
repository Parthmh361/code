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
    req.session.userAccessToken = userAccessToken;
    req.session.user_id = user_id;
    await new Promise((resolve, reject) => {
      req.session.save((err) => (err ? reject(err) : resolve()));
    });
    res.redirect(`https://hbg-vercel-yhjj.vercel.app/home?auth=success&user_id=${user_id}`);
  } catch (error) {
    res.status(500).json({ error: 'Token exchange failed' });
  }
};

exports.getFacebookPages = async (req, res) => {
  const { user_id } = req.query;
  const sessionToken = req.session.userAccessToken;
  let token = sessionToken;
  let userId = req.session.user_id || user_id;
  if (!token && user_id) {
    try {
      const user = await User.findById(user_id);
      if (user && user.facebookAccessToken) {
        if (!user.facebookTokenExpiry || new Date() < user.facebookTokenExpiry) {
          token = user.facebookAccessToken;
          userId = user_id;
        } else {
          return res.status(401).json({ error: 'Facebook token expired. Please authenticate again.' });
        }
      }
    } catch (dbError) {}
  }
  if (!token) {
    return res.status(401).json({ 
      error: 'User not authenticated. Please provide user_id parameter or authenticate again.',
      suggestion: 'Call /auth/facebook?user_id=YOUR_USER_ID to authenticate'
    });
  }
  try {
    const pageRes = await axios.get(`https://graph.facebook.com/me/accounts?access_token=${token}`);
    const pages = pageRes.data.data;
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
          userId: userId
        },
        { upsert: true, new: true }
      );
    }
    const sanitizedPages = pages.map(({ access_token, ...rest }) => rest);
    res.json({ pages: sanitizedPages });
  } catch (err) {
    if (err.response?.data?.error?.code === 190) {
      if (userId) {
        await User.findByIdAndUpdate(userId, {
          $unset: { facebookAccessToken: 1, facebookTokenExpiry: 1 }
        });
      }
      req.session.userAccessToken = null;
      return res.status(401).json({ error: 'Invalid Facebook token. Please authenticate again.' });
    }
    res.status(500).json({ error: 'Failed to fetch pages' });
  }
};

exports.facebookStatus = async (req, res) => {
  const { user_id } = req.query;
  const sessionToken = req.session.userAccessToken;
  const sessionUserId = req.session.user_id;
  let isAuthenticated = false;
  let tokenSource = null;
  let tokenExpiry = null;
  let lastLogin = null;
  if (sessionToken && sessionUserId) {
    isAuthenticated = true;
    tokenSource = 'session';
  }
  if (user_id) {
    try {
      const user = await User.findById(user_id).select('facebookAccessToken facebookTokenExpiry lastFacebookLogin');
      if (user?.facebookAccessToken && (!user.facebookTokenExpiry || new Date() < user.facebookTokenExpiry)) {
        isAuthenticated = true;
        tokenSource = tokenSource === 'session' ? 'both' : 'database';
        tokenExpiry = user.facebookTokenExpiry;
        lastLogin = user.lastFacebookLogin;
      }
    } catch (err) {}
  }
  res.json({
    authenticated: isAuthenticated,
    tokenSource,
    lastLogin,
    tokenExpiry,
    sessionId: req.sessionID,
    userId: sessionUserId || user_id
  });
};

exports.facebookLogout = async (req, res) => {
  const { user_id } = req.query;
  const sessionUserId = req.session.user_id;
  try {
    if (user_id || sessionUserId) {
      const targetUserId = user_id || sessionUserId;
      await User.findByIdAndUpdate(targetUserId, {
        $unset: { facebookAccessToken: 1, facebookTokenExpiry: 1 }
      });
    }
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: 'Session logout failed' });
      }
      res.clearCookie('connect.sid');
      res.status(200).json({ message: 'Logged out successfully from both session and database' });
    });
  } catch (err) {
    res.status(500).json({ error: 'Logout failed' });
  }
};

exports.debugSession = (req, res) => {
  res.json({
    sessionID: req.sessionID,
    session: req.session,
    cookies: req.headers.cookie,
    userAgent: req.headers['user-agent'],
    origin: req.headers.origin,
    referer: req.headers.referer
  });
};