import api from "../api/axios";

/* =========================================
   Get All Settings
   GET /api/settings
   ========================================= */

export const getSettings = async () => {
  return await api.get("/settings");
};

/* =========================================
   Create Settings
   POST /api/settings
   ========================================= */

export const createSettings = async (settingsData = {}) => {
  return await api.post("/settings", settingsData);
};

/* =========================================
   Update All Settings
   PATCH /api/settings
   ========================================= */

export const updateSettings = async (settingsData = {}) => {
  return await api.patch("/settings", settingsData);
};

/* =========================================
   Update Single Setting
   PATCH /api/settings/:settingName
   ========================================= */

export const updateSetting = async (settingName, value) => {
  return await api.patch(`/settings/${settingName}`, {
    value,
  });
};

/* =========================================
   Reset Settings
   POST /api/settings/reset
   ========================================= */

export const resetSettings = async () => {
  return await api.post("/settings/reset");
};

/* =========================================
   Delete Settings
   DELETE /api/settings
   ========================================= */

export const deleteSettings = async () => {
  return await api.delete("/settings");
};

/* =========================================
   Learning Preferences
   GET /api/settings/learning-preferences
   ========================================= */

export const getLearningPreferences = async () => {
  return await api.get("/settings/learning-preferences");
};

/* =========================================
   AI Mentor Preferences
   GET /api/settings/mentor-preferences
   ========================================= */

export const getMentorPreferences = async () => {
  return await api.get("/settings/mentor-preferences");
};

/* =========================================
   Placement Preferences
   GET /api/settings/placement-preferences
   ========================================= */

export const getPlacementPreferences = async () => {
  return await api.get("/settings/placement-preferences");
};

/* =========================================
   Notification Preferences
   GET /api/settings/notification-preferences
   ========================================= */

export const getNotificationPreferences = async () => {
  return await api.get("/settings/notification-preferences");
};

export const changePassword = async (passwordData) => {
  return await api.patch("/auth/change-password", passwordData);
};
