const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

// Load env vars
dotenv.config();

const app = express();

// MongoDB connection (cached for serverless)
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('MongoDB Error:', err.message);
  }
};

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS - allow all Vercel origins
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.options('*', cors());

// Connect DB before each request
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Routes
app.use('/api/auth',          require('../backend/src/routes/authRoutes'));
app.use('/api/employees',     require('../backend/src/routes/employeeRoutes'));
app.use('/api/attendance',    require('../backend/src/routes/attendanceRoutes'));
app.use('/api/tasks',         require('../backend/src/routes/taskRoutes'));
app.use('/api/reports',       require('../backend/src/routes/reportRoutes'));
app.use('/api/leaves',        require('../backend/src/routes/leaveRoutes'));
app.use('/api/notifications', require('../backend/src/routes/notificationRoutes'));
app.use('/api/dashboard',     require('../backend/src/routes/dashboardRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API is running', db: isConnected ? 'connected' : 'disconnected' });
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Server Error' });
});

module.exports = app;
