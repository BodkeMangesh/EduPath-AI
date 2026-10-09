const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    /* =========================================
       User
       ========================================= */

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      unique: true,
    },

    /* =========================================
       Notification Preferences
       ========================================= */

    notifications: {
      type: Boolean,
      default: true,
    },

    emailUpdates: {
      type: Boolean,
      default: true,
    },

    streakReminders: {
      type: Boolean,
      default: true,
    },

    placementAlerts: {
      type: Boolean,
      default: true,
    },

    interviewReminders: {
      type: Boolean,
      default: true,
    },

    jobAlerts: {
      type: Boolean,
      default: true,
    },

    /* =========================================
       Appearance
       ========================================= */

    darkMode: {
      type: Boolean,
      default: false,
    },

    /* =========================================
       Learning Preferences
       ========================================= */

    dailyStudyHours: {
      type: Number,
      enum: [1, 2, 3, 4, 5],
      default: 2,
    },

    learningStyle: {
      type: String,
      enum: ["Practical", "Visual", "Theoretical", "Mixed"],
      default: "Mixed",
      trim: true,
    },

    difficultyPreference: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Intermediate",
      trim: true,
    },

    revisionReminders: {
      type: Boolean,
      default: true,
    },

    /* =========================================
       AI Mentor Preferences
       ========================================= */

    mentorLanguage: {
      type: String,
      enum: ["English", "Hindi", "Marathi"],
      default: "English",
      trim: true,
    },

    mentorResponseStyle: {
      type: String,
      enum: ["Simple", "Balanced", "Detailed"],
      default: "Simple",
      trim: true,
    },

    stepByStepGuidance: {
      type: Boolean,
      default: true,
    },

    /* =========================================
       Placement Preferences
       ========================================= */

    targetRole: {
      type: String,
      default: "Software Developer",
      trim: true,
      maxlength: 150,
    },

    placementPreparation: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

/* =========================================
   Index
   ========================================= */

settingsSchema.index({ user: 1 }, { unique: true });

module.exports = mongoose.model("Settings", settingsSchema);
