const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load env vars — resolve relative to this file so it works from any cwd
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// CORS — allow frontend dev server and production origin
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:5173',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, curl, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Handle preflight for all routes
app.options('*', cors());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/employees', require('./routes/employeeRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/leaves', require('./routes/leaveRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'AI Employee Productivity API is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`✅ Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = app;
