require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const cors = require('cors');
const MongoStore = require('connect-mongo');

const app = express();

// CORS
const allowedOrigins = [
  'http://localhost:5173',
  'https://hbg-vercel-yhjj.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Preflight requests
// app.options('*', cors());

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sessions
app.use(session({
  secret: process.env.SESSION_SECRET || 'secure-facebook-login',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ 
    mongoUrl: process.env.MONGO_URI,
    touchAfter: 24 * 3600, // lazy session update
    ttl: 14 * 24 * 60 * 60 // = 14 days. Default
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Only secure in production
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// MongoDB Connection
console.log('Trying to connect to MongoDB:', process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 60000, // 60 seconds
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/userauth', require('./routes/Auth'));
app.use('/auth', require('./routes/AuthRoutes'));
app.use('/schedulePost', require('./middlewares/userAuthMiddleware'), require('./routes/SchedulePostRoutes'));
app.use('/posts', require('./middlewares/userAuthMiddleware'), require('./routes/getPostRoutes'));
app.use('/editPost', require('./middlewares/userAuthMiddleware'), require('./routes/EditPostsRoutes'));
app.use('/insights', require('./middlewares/userAuthMiddleware'), require('./routes/InsightsRoutes'));
app.use('/api/youtube', require('./routes/youtube'));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log('     ==> Your service is live 🎉');
});
