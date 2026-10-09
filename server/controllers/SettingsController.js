const SettingsService = require("../services/SettingsService");

class SettingsController {
  /* =========================================
     GET /settings
     Get all user settings
     ========================================= */

  async getSettings(req, res) {
    try {
      const settings = await SettingsService.getSettings(req.user._id);

      return res.status(200).json({
        success: true,
        message: "Settings fetched successfully.",
        data: settings,
      });
    } catch (error) {
      console.error("Get Settings Error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to fetch settings.",
        error: error.message,
      });
    }
  }

  /* =========================================
     POST /settings
     Create settings
     ========================================= */

  async createSettings(req, res) {
    try {
      const settings = await SettingsService.createSettings(
        req.user._id,
        req.body,
      );

      return res.status(201).json({
        success: true,
        message: "Settings created successfully.",
        data: settings,
      });
    } catch (error) {
      console.error("Create Settings Error:", error);

      return res.status(400).json({
        success: false,
        message: error.message || "Unable to create settings.",
      });
    }
  }

  /* =========================================
     PATCH /settings
     Update complete settings
     ========================================= */

  async updateSettings(req, res) {
    try {
      const settings = await SettingsService.updateSettings(
        req.user._id,
        req.body,
      );

      return res.status(200).json({
        success: true,
        message: "Settings updated successfully.",
        data: settings,
      });
    } catch (error) {
      console.error("Update Settings Error:", error);

      return res.status(400).json({
        success: false,
        message: error.message || "Unable to update settings.",
      });
    }
  }

  /* =========================================
     PATCH /settings/:settingName
     Update one setting
     ========================================= */

  async updateSetting(req, res) {
    try {
      const { settingName } = req.params;
      const { value } = req.body;

      if (value === undefined) {
        return res.status(400).json({
          success: false,
          message: "Setting value is required.",
        });
      }

      const settings = await SettingsService.updateSetting(
        req.user._id,
        settingName,
        value,
      );

      return res.status(200).json({
        success: true,
        message: "Setting updated successfully.",
        data: settings,
      });
    } catch (error) {
      console.error("Update Setting Error:", error);

      return res.status(400).json({
        success: false,
        message: error.message || "Unable to update setting.",
      });
    }
  }

  /* =========================================
     POST /settings/reset
     Reset all settings to defaults
     ========================================= */

  async resetSettings(req, res) {
    try {
      const settings = await SettingsService.resetSettings(req.user._id);

      return res.status(200).json({
        success: true,
        message: "Settings reset to default successfully.",
        data: settings,
      });
    } catch (error) {
      console.error("Reset Settings Error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to reset settings.",
        error: error.message,
      });
    }
  }

  /* =========================================
     DELETE /settings
     Delete user's settings
     ========================================= */

  async deleteSettings(req, res) {
    try {
      const result = await SettingsService.deleteSettings(req.user._id);

      return res.status(200).json({
        success: true,
        message: result.deleted
          ? "Settings deleted successfully."
          : "No settings found to delete.",
        data: result,
      });
    } catch (error) {
      console.error("Delete Settings Error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to delete settings.",
        error: error.message,
      });
    }
  }

  /* =========================================
     GET /settings/learning-preferences
     ========================================= */

  async getLearningPreferences(req, res) {
    try {
      const preferences = await SettingsService.getLearningPreferences(
        req.user._id,
      );

      return res.status(200).json({
        success: true,
        message: "Learning preferences fetched successfully.",
        data: preferences,
      });
    } catch (error) {
      console.error("Get Learning Preferences Error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to fetch learning preferences.",
        error: error.message,
      });
    }
  }

  /* =========================================
     GET /settings/mentor-preferences
     ========================================= */

  async getMentorPreferences(req, res) {
    try {
      const preferences = await SettingsService.getMentorPreferences(
        req.user._id,
      );

      return res.status(200).json({
        success: true,
        message: "AI Mentor preferences fetched successfully.",
        data: preferences,
      });
    } catch (error) {
      console.error("Get Mentor Preferences Error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to fetch AI Mentor preferences.",
        error: error.message,
      });
    }
  }

  /* =========================================
     GET /settings/placement-preferences
     ========================================= */

  async getPlacementPreferences(req, res) {
    try {
      const preferences = await SettingsService.getPlacementPreferences(
        req.user._id,
      );

      return res.status(200).json({
        success: true,
        message: "Placement preferences fetched successfully.",
        data: preferences,
      });
    } catch (error) {
      console.error("Get Placement Preferences Error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to fetch placement preferences.",
        error: error.message,
      });
    }
  }

  /* =========================================
     GET /settings/notification-preferences
     ========================================= */

  async getNotificationPreferences(req, res) {
    try {
      const preferences = await SettingsService.getNotificationPreferences(
        req.user._id,
      );

      return res.status(200).json({
        success: true,
        message: "Notification preferences fetched successfully.",
        data: preferences,
      });
    } catch (error) {
      console.error("Get Notification Preferences Error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to fetch notification preferences.",
        error: error.message,
      });
    }
  }
}

module.exports = new SettingsController();
