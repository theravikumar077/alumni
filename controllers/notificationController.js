const Notification = require("../models/Notification");

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ success: false, message: "Error retrieving notifications" });
  }
};

// @desc    Mark all user notifications as read
// @route   POST /api/notifications/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({
      success: true,
      message: "All notifications marked as read"
    });
  } catch (error) {
    console.error("Mark read error:", error);
    res.status(500).json({ success: false, message: "Error marking notifications as read" });
  }
};
