const { google } = require('googleapis');
const fs = require('fs');

// Helper to create OAuth2 client
function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

// Generate Google OAuth2 URL
exports.getAuthUrl = (req, res) => {
  const oauth2Client = getOAuth2Client();
  const scopes = [
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/youtube.readonly',
  ];
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
    redirect_uri: process.env.GOOGLE_REDIRECT_URI
  });
  res.json({ url });
};

// OAuth2 callback
exports.oauth2Callback = async (req, res) => {
  const code = req.query.code;
  const oauth2Client = getOAuth2Client();
  try {
    const { tokens } = await oauth2Client.getToken(code);
    req.session.accessToken = tokens.access_token;
    res.redirect('https://socail-suit-frontend-buv2.vercel.app/youtube');
  } catch (err) {
    res.status(400).json({ error: 'Failed to get tokens', details: err });
  }
};

// Check authentication
exports.checkAuth = (req, res) => {
  if (req.session && req.session.accessToken) {
    res.json({ authenticated: true });
  } else {
    res.status(401).json({ authenticated: false });
  }
};

// Schedule a YouTube video upload
exports.scheduleVideo = async (req, res) => {
  const accessToken = req.session.accessToken;
  if (!accessToken) {
    return res.status(401).json({ error: 'Access token missing or invalid' });
  }

  const { title, description, scheduledAt } = req.body;
  const videoFilePath = req.file?.path;

  if (!videoFilePath) {
    return res.status(400).json({ error: 'No video file uploaded' });
  }

  try {
    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({ access_token: accessToken });

    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

    const response = await youtube.videos.insert({
      part: 'snippet,status',
      requestBody: {
        snippet: { title, description },
        status: {
          privacyStatus: 'private',
          publishAt: new Date(scheduledAt).toISOString(),
          selfDeclaredMadeForKids: false,
        }
      },
      media: {
        body: fs.createReadStream(videoFilePath),
      }
    });

    fs.unlinkSync(videoFilePath);
    res.status(200).json({ message: 'Video scheduled successfully', videoId: response.data.id });

  } catch (error) {
    console.error('Schedule error:', error);
    res.status(500).json({ error: 'Failed to schedule video' });
  }
};

// Get uploaded videos
exports.getUploads = async (req, res) => {
  const accessToken = req.session.accessToken;
  if (!accessToken) {
    return res.status(401).json({ error: 'Access token missing or invalid' });
  }

  try {
    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({ access_token: accessToken });

    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

    const channelResponse = await youtube.channels.list({
      part: 'contentDetails',
      mine: true,
    });

    const uploadsPlaylistId = channelResponse.data.items[0].contentDetails.relatedPlaylists.uploads;

    const playlistItems = await youtube.playlistItems.list({
      part: 'snippet',
      playlistId: uploadsPlaylistId,
      maxResults: 10,
    });

    const videos = playlistItems.data.items.map((item) => ({
      id: item.snippet.resourceId.videoId,
      snippet: item.snippet,
    }));
    res.json(videos);

  } catch (error) {
    console.error('Fetch uploads error:', error);
    res.status(500).json({ error: 'Failed to fetch uploads' });
  }
};
