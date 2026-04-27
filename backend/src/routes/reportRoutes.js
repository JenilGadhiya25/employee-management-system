const express = require('express');
const router = express.Router();
const {
  submitDailyReport,
  getAllReports,
  getReportsByEmployee,
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/daily', submitDailyReport);
router.get('/', authorize('admin', 'manager'), getAllReports);
router.get('/:employeeId', getReportsByEmployee);

module.exports = router;
