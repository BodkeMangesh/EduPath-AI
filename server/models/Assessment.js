const mongoose = require("mongoose");

/*
|--------------------------------------------------------------------------
| Enums
|--------------------------------------------------------------------------
*/

const ASSESSMENT_STATUS = ["draft", "in_progress", "completed"];

const EXPERIENCE_LEVEL = [
  "beginner",
  "intermediate",
  "advanced",
  "professional",
];

/*
|--------------------------------------------------------------------------
| Assessment Schema
|--------------------------------------------------------------------------
*/

const assessmentSchema = new mongoose.Schema(
  {
    /*
    |--------------------------------------------------------------------------
    | User Information
    |--------------------------------------------------------------------------
    */

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | Assessment Details
    |--------------------------------------------------------------------------
    */

    title: {
      type: String,
      default: "Career Assessment",
    },

    status: {
      type: String,
      enum: ASSESSMENT_STATUS,
      default: "draft",
    },

    experienceLevel: {
      type: String,
      enum: EXPERIENCE_LEVEL,
      default: "beginner",
    },

    careerGoal: {
      type: String,
      default: "",
    },

    /*
    |--------------------------------------------------------------------------
    | Technical Skills
    |--------------------------------------------------------------------------
    */

    technicalSkills: [
      {
        skill: String,
        level: Number,
        confidence: Number,
      },
    ],

    /*
    |--------------------------------------------------------------------------
    | Soft Skills
    |--------------------------------------------------------------------------
    */

    softSkills: [
      {
        skill: String,
        score: Number,
      },
    ],

    /*
    |--------------------------------------------------------------------------
    | Learning Preferences
    |--------------------------------------------------------------------------
    */

    learningStyle: String,

    dailyStudyHours: Number,

    /*
    |--------------------------------------------------------------------------
    | AI Analysis
    |--------------------------------------------------------------------------
    */

    aiAnalysis: {
      overallScore: {
        type: Number,
        default: 0,
      },

      strengths: [String],

      weaknesses: [String],

      recommendedCareer: String,

      confidenceScore: Number,

      skillGap: [String],
    },

    /*
    |--------------------------------------------------------------------------
    | Recommendation Summary
    |--------------------------------------------------------------------------
    */

    recommendations: [
      {
        title: String,
        description: String,
        priority: Number,
      },
    ],

    /*
    |--------------------------------------------------------------------------
    | Progress Snapshot
    |--------------------------------------------------------------------------
    */

    progressSnapshot: {
      careerReadiness: {
        type: Number,
        default: 0,
      },

      placementReadiness: {
        type: Number,
        default: 0,
      },

      overallProgress: {
        type: Number,
        default: 0,
      },
    },

    completedAt: Date,
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

module.exports = mongoose.model("Assessment", assessmentSchema);
