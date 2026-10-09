const Settings = require("../models/Settings");

class SettingsService {
  /* =========================================
     Default Settings
     ========================================= */

  getDefaultSettings() {
    return {
      notifications: true,
      emailUpdates: true,
      streakReminders: true,
      placementAlerts: true,
      interviewReminders: true,
      jobAlerts: true,

      darkMode: false,

      dailyStudyHours: 2,
      learningStyle: "Mixed",
      difficultyPreference: "Intermediate",
      revisionReminders: true,

      mentorLanguage: "English",
      mentorResponseStyle: "Simple",
      stepByStepGuidance: true,

      targetRole: "Software Developer",
      placementPreparation: true,
    };
  }

  /* =========================================
     Normalize User ID
     ========================================= */

  normalizeUserId(userId) {
    if (!userId) {
      throw new Error("User ID is required.");
    }

    return userId;
  }

  /* =========================================
     Get Settings
     ========================================= */

  async getSettings(userId) {
    const normalizedUserId = this.normalizeUserId(userId);

    let settings = await Settings.findOne({
      user: normalizedUserId,
    }).lean();

    /*
      If settings do not exist, create them automatically.
      This keeps the Settings page usable for existing users.
    */

    if (!settings) {
      settings = await Settings.create({
        user: normalizedUserId,
        ...this.getDefaultSettings(),
      });

      settings = settings.toObject();
    }

    return settings;
  }

  /* =========================================
     Create Settings
     ========================================= */

  async createSettings(userId, data = {}) {
    const normalizedUserId = this.normalizeUserId(userId);

    const existingSettings = await Settings.findOne({
      user: normalizedUserId,
    });

    if (existingSettings) {
      return existingSettings;
    }

    const settings = await Settings.create({
      user: normalizedUserId,
      ...this.getDefaultSettings(),
      ...this.sanitizeSettings(data),
    });

    return settings;
  }

  /* =========================================
     Update Settings
     ========================================= */

  async updateSettings(userId, data = {}) {
    const normalizedUserId = this.normalizeUserId(userId);

    const sanitizedData = this.sanitizeSettings(data);

    const settings = await Settings.findOneAndUpdate(
      {
        user: normalizedUserId,
      },
      {
        $set: sanitizedData,
        $setOnInsert: {
          user: normalizedUserId,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    ).lean();

    return settings;
  }

  /* =========================================
     Update One Setting
     ========================================= */

  async updateSetting(userId, settingName, value) {
    const normalizedUserId = this.normalizeUserId(userId);

    if (!settingName) {
      throw new Error("Setting name is required.");
    }

    const allowedSettings = this.getAllowedSettingNames();

    if (!allowedSettings.includes(settingName)) {
      throw new Error(`Invalid setting: ${settingName}`);
    }

    const sanitizedValue = this.sanitizeSingleSetting(settingName, value);

    const settings = await Settings.findOneAndUpdate(
      {
        user: normalizedUserId,
      },
      {
        $set: {
          [settingName]: sanitizedValue,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    ).lean();

    return settings;
  }

  /* =========================================
     Reset Settings
     ========================================= */

  async resetSettings(userId) {
    const normalizedUserId = this.normalizeUserId(userId);

    const defaults = this.getDefaultSettings();

    const settings = await Settings.findOneAndUpdate(
      {
        user: normalizedUserId,
      },
      {
        $set: defaults,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    ).lean();

    return settings;
  }

  /* =========================================
     Delete Settings
     ========================================= */

  async deleteSettings(userId) {
    const normalizedUserId = this.normalizeUserId(userId);

    const result = await Settings.deleteOne({
      user: normalizedUserId,
    });

    return {
      deleted: result.deletedCount > 0,
    };
  }

  /* =========================================
     Allowed Settings
     ========================================= */

  getAllowedSettingNames() {
    return [
      "notifications",
      "emailUpdates",
      "streakReminders",
      "placementAlerts",
      "interviewReminders",
      "jobAlerts",

      "darkMode",

      "dailyStudyHours",
      "learningStyle",
      "difficultyPreference",
      "revisionReminders",

      "mentorLanguage",
      "mentorResponseStyle",
      "stepByStepGuidance",

      "targetRole",
      "placementPreparation",
    ];
  }

  /* =========================================
     Sanitize Complete Settings
     ========================================= */

  sanitizeSettings(data = {}) {
    const allowedSettings = this.getAllowedSettingNames();

    const sanitized = {};

    for (const key of allowedSettings) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        sanitized[key] = this.sanitizeSingleSetting(key, data[key]);
      }
    }

    return sanitized;
  }

  /* =========================================
     Sanitize Individual Setting
     ========================================= */

  sanitizeSingleSetting(settingName, value) {
    const booleanSettings = [
      "notifications",
      "emailUpdates",
      "streakReminders",
      "placementAlerts",
      "interviewReminders",
      "jobAlerts",
      "darkMode",
      "revisionReminders",
      "stepByStepGuidance",
      "placementPreparation",
    ];

    if (booleanSettings.includes(settingName)) {
      return this.toBoolean(value);
    }

    if (settingName === "dailyStudyHours") {
      const hours = Number(value);

      if (![1, 2, 3, 4, 5].includes(hours)) {
        throw new Error("Daily study hours must be between 1 and 5.");
      }

      return hours;
    }

    if (settingName === "learningStyle") {
      const allowedValues = ["Practical", "Visual", "Theoretical", "Mixed"];

      if (!allowedValues.includes(value)) {
        throw new Error("Invalid learning style.");
      }

      return value;
    }

    if (settingName === "difficultyPreference") {
      const allowedValues = ["Beginner", "Intermediate", "Advanced"];

      if (!allowedValues.includes(value)) {
        throw new Error("Invalid difficulty preference.");
      }

      return value;
    }

    if (settingName === "mentorLanguage") {
      const allowedValues = ["English", "Hindi", "Marathi"];

      if (!allowedValues.includes(value)) {
        throw new Error("Invalid mentor language.");
      }

      return value;
    }

    if (settingName === "mentorResponseStyle") {
      const allowedValues = ["Simple", "Balanced", "Detailed"];

      if (!allowedValues.includes(value)) {
        throw new Error("Invalid mentor response style.");
      }

      return value;
    }

    if (settingName === "targetRole") {
      if (typeof value !== "string") {
        throw new Error("Target role must be a string.");
      }

      const role = value.trim();

      if (!role) {
        throw new Error("Target role cannot be empty.");
      }

      if (role.length > 150) {
        throw new Error("Target role cannot exceed 150 characters.");
      }

      return role;
    }

    return value;
  }

  /* =========================================
     Boolean Helper
     ========================================= */

  toBoolean(value) {
    if (typeof value === "boolean") {
      return value;
    }

    if (value === "true" || value === 1 || value === "1") {
      return true;
    }

    if (value === "false" || value === 0 || value === "0") {
      return false;
    }

    throw new Error("Invalid boolean value.");
  }

  /* =========================================
     Get Learning Preferences
     ========================================= */

  async getLearningPreferences(userId) {
    const settings = await this.getSettings(userId);

    return {
      dailyStudyHours: settings.dailyStudyHours,
      learningStyle: settings.learningStyle,
      difficultyPreference: settings.difficultyPreference,
      revisionReminders: settings.revisionReminders,
    };
  }

  /* =========================================
     Get AI Mentor Preferences
     ========================================= */

  async getMentorPreferences(userId) {
    const settings = await this.getSettings(userId);

    return {
      mentorLanguage: settings.mentorLanguage,
      mentorResponseStyle: settings.mentorResponseStyle,
      stepByStepGuidance: settings.stepByStepGuidance,
    };
  }

  /* =========================================
     Get Placement Preferences
     ========================================= */

  async getPlacementPreferences(userId) {
    const settings = await this.getSettings(userId);

    return {
      targetRole: settings.targetRole,
      placementPreparation: settings.placementPreparation,
      placementAlerts: settings.placementAlerts,
      interviewReminders: settings.interviewReminders,
      jobAlerts: settings.jobAlerts,
    };
  }

  /* =========================================
     Get Notification Preferences
     ========================================= */

  async getNotificationPreferences(userId) {
    const settings = await this.getSettings(userId);

    return {
      notifications: settings.notifications,
      emailUpdates: settings.emailUpdates,
      streakReminders: settings.streakReminders,
      placementAlerts: settings.placementAlerts,
      interviewReminders: settings.interviewReminders,
      jobAlerts: settings.jobAlerts,
      revisionReminders: settings.revisionReminders,
    };
  }
}

module.exports = new SettingsService();
