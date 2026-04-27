const Notification = require('../models/Notification');

const createNotification = async (userId, message, type, relatedId = null) => {
  try {
    const notification = await Notification.create({
      userId,
      message,
      type,
      relatedId,
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

module.exports = createNotification;
