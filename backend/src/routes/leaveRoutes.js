const express = require('express');
const router = express.Router();
const {
  applyLeave,
  getAllLeaves,
  getMyLeaves,
  approveLeave,
  rejectLeave,
} = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// Specific routes BEFORE param routes
router.post('/', applyLeave);
router.get('/employee/:employeeId', getMyLeaves);         // must be before /:id
router.get('/', authorize('admin', 'manager'), getAllLeaves);

router.put('/:id/approve', authorize('admin', 'manager'), approveLeave);
router.put('/:id/reject', authorize('admin', 'manager'), rejectLeave);

module.exports = router;
