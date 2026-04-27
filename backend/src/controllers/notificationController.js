const Notification = require('../models/Notification');

// @desc    Get notifications for a user
// @route   GET /api/notifications/:userId
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    // Count unread BEFORE marking as seen
    const unreadCount = await Notification.countDocuments({
      userId: req.params.userId,
      seen: false,
    });

    const notifications = await Notification.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(50);

    // Mark all as seen after fetching
    await Notification.updateMany(
      { userId: req.params.userId, seen: false },
      { seen: true }
    );

    res.status(200).json({
      success: true,
      unreadCount,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a notification (admin/manager use)
// @route   POST /api/notifications
// @access  Private/Admin/Manager
exports.createNotification = async (req, res) => {
  try {
    const { userId, message, type } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ success: false, message: 'userId and message are required' });
    }

    const notification = await Notification.create({ userId, message, type: type || 'general' });
    res.status(201).json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
