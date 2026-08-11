const express = require("express");

const NotificationController = require("../controllers/NotificationController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Get all notifications
router.get("/", protect, NotificationController.getNotifications);

// Get unread notifications
router.get("/unread", protect, NotificationController.getUnreadNotifications);

// Get unread notification count
router.get("/count", protect, NotificationController.getUnreadCount);

// Mark one notification as read
router.put("/:id/read", protect, NotificationController.markAsRead);

// Mark all notifications as read
router.put("/read-all", protect, NotificationController.markAllAsRead);

// Delete notification
router.delete("/:id", protect, NotificationController.deleteNotification);

module.exports = router;
