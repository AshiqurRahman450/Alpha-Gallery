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


// Error handler middleware (to be added)

module.exports = app;
