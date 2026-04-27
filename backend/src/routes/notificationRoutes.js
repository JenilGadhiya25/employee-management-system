const express = require('express');
const router = express.Router();
const {
  getNotifications,
  createNotification,
} = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/:userId', getNotifications);
router.post('/', authorize('admin', 'manager'), createNotification);

module.exports = router;
