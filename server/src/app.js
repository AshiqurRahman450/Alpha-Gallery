const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Trust reverse proxy (e.g. Nginx, Cloudflare) for correct secure protocol and IP
app.set('trust proxy', 1);

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/bdms', require('./routes/bdmRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/media', require('./routes/mediaRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/public', require('./routes/publicRoutes'));

// Basic route
app.get('/', (req, res) => {
  res.send('Hello, backend is running!');
});


// Error handler middleware
app.use((err, req, res, next) => {
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File is too large. Maximum size is 100MB.' });
    }
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  }
  if (err) {
    console.error('Server error:', err);
    return res.status(err.status || 500).json({ message: err.message || 'Server error' });
  }
  next();
});

module.exports = app;
