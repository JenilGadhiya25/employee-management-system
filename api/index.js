const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('../backend/src/config/db');
const errorHandler = require('../backend/src/middleware/errorHandler');

// Load env vars
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// CORS
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://employee-management-system-azure-nine.vercel.app',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
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

app.options('*', cors());

// Routes
app.use('/auth', require('../backend/src/routes/authRoutes'));
app.use('/employees', require('../backend/src/routes/employeeRoutes'));
app.use('/attendance', require('../backend/src/routes/attendanceRoutes'));
app.use('/tasks', require('../backend/src/routes/taskRoutes'));
app.use('/reports', require('../backend/src/routes/reportRoutes'));
app.use('/leaves', require('../backend/src/routes/leaveRoutes'));
app.use('/notifications', require('../backend/src/routes/notificationRoutes'));
app.use('/dashboard', require('../backend/src/routes/dashboardRoutes'));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Error handler
app.use(errorHandler);

module.exports = app;
