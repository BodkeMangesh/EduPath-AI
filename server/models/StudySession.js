const mongoose = require("mongoose");

const studySessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    duration: {
      type: Number,
      required: true,
    },

    topic: {
      type: String,
      default: "General Study",
    },

    careerId: {
      type: String,
      default: "full-stack",
    },

    sessionType: {
      type: String,
      enum: ["Pomodoro", "Manual"],
      default: "Pomodoro",
    },

    completed: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("StudySession", studySessionSchema);
