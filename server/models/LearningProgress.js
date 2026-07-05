const mongoose = require("mongoose");

const learningProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    careerId: {
      type: String,
      required: true,
      trim: true,
    },

    currentPhase: {
      type: Number,
      default: 1,
      min: 1,
    },

    completedTopics: [
      {
        type: String,
        trim: true,
      },
    ],

    pendingTopics: [
      {
        type: String,
        trim: true,
      },
    ],

    completedProjects: [
      {
        type: String,
        trim: true,
      },
    ],

    currentStreak: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalStudyHours: {
      type: Number,
      default: 0,
      min: 0,
    },

    overallCompletion: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    nextMilestone: {
      type: String,
      default: "",
    },

    lastStudyDate: {
      type: Date,
    },

    status: {
      type: String,
      enum: ["Active", "Completed", "Paused"],
      default: "Active",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// One learning progress per user per career
learningProgressSchema.index({ user: 1, careerId: 1 }, { unique: true });

module.exports = mongoose.model("LearningProgress", learningProgressSchema);
