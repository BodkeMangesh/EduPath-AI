const mongoose = require("mongoose");

const CareerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    careerId: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CareerCategory",
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    skills: [
      {
        type: String,
      },
    ],

    eligibility: [
      {
        type: String,
      },
    ],

    averageSalary: {
      type: String,
      default: "",
    },

    growthRate: {
      type: String,
      default: "",
    },

    demand: {
      type: String,
      default: "",
    },

    roadmapTemplate: {
      type: String,
      default: "",
    },

    assessmentTemplate: {
      type: String,
      default: "",
    },

    aiPrompt: {
      type: String,
      default: "",
    },

    tags: [
      {
        type: String,
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Career", CareerSchema);
