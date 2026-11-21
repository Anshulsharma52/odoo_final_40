const { Notification } = require('../models');

// @desc    Get notifications for user or role
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user._id || req.user.id;

    const notifications = await Notification.find({
      $or: [
        { userId },
        { role: userRole },
        { role: 'All' }
      ]
    });

    const unreadCount = notifications.filter(n => !n.read).length;

    res.json({
      success: true,
      unreadCount,
      notifications
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    res.json({ success: true, notification });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Mark all as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user._id;

    await Notification.updateMany(
      {
        $or: [
          { userId },
          { role: userRole }
        ]
      },
      { read: true }
    );

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead
};
