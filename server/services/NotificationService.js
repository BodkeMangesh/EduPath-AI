const Notification = require("../models/Notification");

class NotificationService {
  // Create notification
  async createNotification({
    userId,
    type = "system",
    title,
    message,
    relatedCareer = null,
    relatedTopic = "",
  }) {
    if (!userId) {
      throw new Error("User ID is required.");
    }

    if (!title || !message) {
      throw new Error("Notification title and message are required.");
    }

    const notification = await Notification.create({
      user: userId,
      type,
      title,
      message,
      relatedCareer,
      relatedTopic,
    });

    return notification;
  }

  // Get user's notifications
  async getUserNotifications(userId) {
    if (!userId) {
      throw new Error("User ID is required.");
    }

    return await Notification.find({
      user: userId,
    })
      .populate("relatedCareer", "name slug")
      .sort({ createdAt: -1 });
  }

  // Get unread notifications
  async getUnreadNotifications(userId) {
    if (!userId) {
      throw new Error("User ID is required.");
    }

    return await Notification.find({
      user: userId,
      isRead: false,
    })
      .populate("relatedCareer", "name slug")
      .sort({ createdAt: -1 });
  }

  // Get unread notification count
  async getUnreadCount(userId) {
    if (!userId) {
      throw new Error("User ID is required.");
    }

    return await Notification.countDocuments({
      user: userId,
      isRead: false,
    });
  }

  // Mark one notification as read
  async markAsRead(userId, notificationId) {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: notificationId,
        user: userId,
      },
      {
        isRead: true,
      },
      {
        new: true,
      },
    );

    if (!notification) {
      throw new Error("Notification not found.");
    }

    return notification;
  }

  // Mark all notifications as read
  async markAllAsRead(userId) {
    await Notification.updateMany(
      {
        user: userId,
        isRead: false,
      },
      {
        isRead: true,
      },
    );

    return true;
  }

  // Delete notification
  async deleteNotification(userId, notificationId) {
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      user: userId,
    });

    if (!notification) {
      throw new Error("Notification not found.");
    }

    return true;
  }
}

module.exports = new NotificationService();
