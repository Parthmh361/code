app.use((req, res, next) => {
  console.log('🆔 Request Details:');
  console.log('  Path:', req.path);
  console.log('  Method:', req.method);
  console.log('  Session ID:', req.sessionID);
  console.log('  Has userAccessToken:', !!req.session.userAccessToken);
  console.log('  Cookie header:', req.headers.cookie);
  console.log('  User-Agent:', req.headers['user-agent']?.substring(0, 50));
  console.log('  Referer:', req.headers.referer);
  console.log('---');
  next();
});
