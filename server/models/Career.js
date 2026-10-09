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
        trim: true,
      },
    ],

    eligibility: [
      {
        type: String,
        trim: true,
      },
    ],

    averageSalary: {
      type: String,
      default: "",
      trim: true,
    },

    growthRate: {
      type: String,
      default: "",
      trim: true,
    },

    demand: {
      type: String,
      default: "",
      trim: true,
    },

    roadmap: [
      {
        phase: {
          type: Number,
          required: true,
          min: 1,
        },

        title: {
          type: String,
          required: true,
          trim: true,
        },

        duration: {
          type: String,
          default: "",
          trim: true,
        },

        topics: [
          {
            type: String,
            trim: true,
          },
        ],

        projects: [
          {
            type: String,
            trim: true,
          },
        ],

        interviewTopics: [
          {
            type: String,
            trim: true,
          },
        ],
      },
    ],

    assessmentTemplate: {
      type: String,
      default: "",
      trim: true,
    },

    aiPrompt: {
      type: String,
      default: "",
      trim: true,
    },

    tags: [
      {
        type: String,
        trim: true,
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
