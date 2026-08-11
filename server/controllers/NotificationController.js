const NotificationService = require("../services/NotificationService");

class NotificationController {
  // Get all notifications
  getNotifications = async (req, res) => {
    try {
      const notifications = await NotificationService.getUserNotifications(
        req.user._id,
      );

      return res.status(200).json({
        success: true,
        message: "Notifications fetched successfully.",
        data: notifications,
      });
    } catch (error) {
      console.error("Error in NotificationController.getNotifications:", error);

      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

  // Get unread notifications
  getUnreadNotifications = async (req, res) => {
    try {
      const notifications = await NotificationService.getUnreadNotifications(
        req.user._id,
      );

      return res.status(200).json({
        success: true,
        message: "Unread notifications fetched successfully.",
        data: notifications,
      });
    } catch (error) {
      console.error(
        "Error in NotificationController.getUnreadNotifications:",
        error,
      );

      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

  // Get unread notification count
  getUnreadCount = async (req, res) => {
    try {
      const count = await NotificationService.getUnreadCount(req.user._id);

      return res.status(200).json({
        success: true,
        data: {
          count,
        },
      });
    } catch (error) {
      console.error("Error in NotificationController.getUnreadCount:", error);

      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

  // Mark one notification as read
  markAsRead = async (req, res) => {
    try {
      const { id } = req.params;

      const notification = await NotificationService.markAsRead(
        req.user._id,
        id,
      );

      return res.status(200).json({
        success: true,
        message: "Notification marked as read.",
        data: notification,
      });
    } catch (error) {
      console.error("Error in NotificationController.markAsRead:", error);

      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

  // Mark all notifications as read
  markAllAsRead = async (req, res) => {
    try {
      await NotificationService.markAllAsRead(req.user._id);

      return res.status(200).json({
        success: true,
        message: "All notifications marked as read.",
      });
    } catch (error) {
      console.error("Error in NotificationController.markAllAsRead:", error);

      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

  // Delete notification
  deleteNotification = async (req, res) => {
    try {
      const { id } = req.params;

      await NotificationService.deleteNotification(req.user._id, id);

      return res.status(200).json({
        success: true,
        message: "Notification deleted successfully.",
      });
    } catch (error) {
      console.error(
        "Error in NotificationController.deleteNotification:",
        error,
      );

      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };
}

module.exports = new NotificationController();
