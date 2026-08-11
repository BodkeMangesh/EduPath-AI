const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: [
        "assessment_completed",
        "learning_path_ready",
        "topic_completed",
        "milestone",
        "streak",
        "reminder",
        "system",
      ],
      default: "system",
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    relatedCareer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Career",
      default: null,
    },

    relatedTopic: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Fast notification queries for a user
notificationSchema.index({
  user: 1,
  createdAt: -1,
});

notificationSchema.index({
  user: 1,
  isRead: 1,
});

module.exports = mongoose.model("Notification", notificationSchema);
