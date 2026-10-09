const express = require("express");

const SettingsController = require("../controllers/SettingsController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

/* =========================================
   Main Settings
   ========================================= */

// Get all settings
router.get("/", protect, SettingsController.getSettings);

// Create settings
router.post("/", protect, SettingsController.createSettings);

// Update all settings
router.patch("/", protect, SettingsController.updateSettings);

// Delete settings
router.delete("/", protect, SettingsController.deleteSettings);

/* =========================================
   Preference Groups
   ========================================= */

// Learning preferences
router.get(
  "/learning-preferences",
  protect,
  SettingsController.getLearningPreferences,
);

// AI Mentor preferences
router.get(
  "/mentor-preferences",
  protect,
  SettingsController.getMentorPreferences,
);

// Placement preferences
router.get(
  "/placement-preferences",
  protect,
  SettingsController.getPlacementPreferences,
);

// Notification preferences
router.get(
  "/notification-preferences",
  protect,
  SettingsController.getNotificationPreferences,
);

/* =========================================
   Settings Actions
   ========================================= */

// Reset all settings
router.post("/reset", protect, SettingsController.resetSettings);

/* =========================================
   Individual Setting
   ========================================= */

// Update one specific setting
router.patch("/:settingName", protect, SettingsController.updateSetting);

module.exports = router;
