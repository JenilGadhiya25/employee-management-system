const express = require('express');
const router  = express.Router();
const {
  punchIn,
  lunchBreak,
  punchOut,
  endDay,
  getToday,
  getActiveNow,
  getAllAttendance,
  getAttendanceByEmployee,
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/punchin',    punchIn);
router.put('/lunch',       lunchBreak);
router.put('/punchout',    punchOut);
router.put('/endday',      endDay);
router.get('/today',       getToday);
router.get('/active-now',  authorize('admin', 'manager'), getActiveNow);
router.get('/',            authorize('admin', 'manager'), getAllAttendance);
router.get('/:employeeId', getAttendanceByEmployee);

module.exports = router;
