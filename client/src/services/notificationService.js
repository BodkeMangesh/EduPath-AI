import api from "../api/axios";

// Get all notifications
export const getNotifications = () => {
  return api.get("/notifications");
};

// Get unread notifications
export const getUnreadNotifications = () => {
  return api.get("/notifications/unread");
};

// Get unread notification count
export const getUnreadNotificationCount = () => {
  return api.get("/notifications/count");
};

// Mark one notification as read
export const markNotificationAsRead = (notificationId) => {
  return api.put(`/notifications/${notificationId}/read`);
};

// Mark all notifications as read
export const markAllNotificationsAsRead = () => {
  return api.put("/notifications/read-all");
};

// Delete notification
export const deleteNotification = (notificationId) => {
  return api.delete(`/notifications/${notificationId}`);
};