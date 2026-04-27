const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getProductivity,
  getMonthlyAttendance,
  getTaskSummary,
  getCalendarData,
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/stats', getDashboardStats);
router.get('/productivity', getProductivity);
router.get('/monthly-attendance', getMonthlyAttendance);
router.get('/task-summary', getTaskSummary);
router.get('/calendar', getCalendarData);

module.exports = router;
