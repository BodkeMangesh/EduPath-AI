const mongoose = require("mongoose");

const ResumeAnalysisSchema = new mongoose.Schema(
  {
    // =========================
    // USER & CAREER
    // =========================

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    targetCareer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Career",
      default: null,
      index: true,
    },

    targetRole: {
      type: String,
      trim: true,
      default: "",
    },

    // =========================
    // RESUME FILE
    // =========================

    resume: {
      fileName: {
        type: String,
        trim: true,
        default: "",
      },

      fileUrl: {
        type: String,
        trim: true,
        default: "",
      },

      fileType: {
        type: String,
        trim: true,
        default: "",
      },

      fileSize: {
        type: Number,
        default: 0,
      },

      uploaded: {
        type: Boolean,
        default: false,
      },

      uploadedAt: {
        type: Date,
        default: null,
      },

      // =========================
      // EXTRACTED RESUME TEXT
      // =========================

      extractedText: {
        type: String,
        default: "",
      },

      pageCount: {
        type: Number,
        min: 0,
        default: 0,
      },

      characterCount: {
        type: Number,
        min: 0,
        default: 0,
      },

      wordCount: {
        type: Number,
        min: 0,
        default: 0,
      },
    },

    // =========================
    // OVERALL SCORE
    // =========================

    score: {
      overall: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },

      ats: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },

      skills: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },

      experience: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },

      projects: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },

      education: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },

      formatting: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },

      keywords: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
    },

    // =========================
    // SKILLS
    // =========================

    skills: {
      detected: [
        {
          type: String,
          trim: true,
        },
      ],

      matched: [
        {
          type: String,
          trim: true,
        },
      ],

      missing: [
        {
          type: String,
          trim: true,
        },
      ],

      extra: [
        {
          type: String,
          trim: true,
        },
      ],
    },

    // =========================
    // KEYWORD ANALYSIS
    // =========================

    keywords: {
      matched: [
        {
          type: String,
          trim: true,
        },
      ],

      missing: [
        {
          type: String,
          trim: true,
        },
      ],

      important: [
        {
          type: String,
          trim: true,
        },
      ],
    },

    // =========================
    // EXPERIENCE ANALYSIS
    // =========================

    experience: {
      years: {
        type: Number,
        min: 0,
        default: 0,
      },

      level: {
        type: String,
        trim: true,
        default: "",
      },

      strengths: [
        {
          type: String,
          trim: true,
        },
      ],

      gaps: [
        {
          type: String,
          trim: true,
        },
      ],
    },

    // =========================
    // PROJECT ANALYSIS
    // =========================

    projects: {
      total: {
        type: Number,
        min: 0,
        default: 0,
      },

      relevant: {
        type: Number,
        min: 0,
        default: 0,
      },

      strengths: [
        {
          type: String,
          trim: true,
        },
      ],

      suggestions: [
        {
          type: String,
          trim: true,
        },
      ],
    },

    // =========================
    // EDUCATION ANALYSIS
    // =========================

    education: {
      degree: {
        type: String,
        trim: true,
        default: "",
      },

      branch: {
        type: String,
        trim: true,
        default: "",
      },

      cgpa: {
        type: Number,
        min: 0,
        max: 10,
        default: null,
      },

      relevant: {
        type: Boolean,
        default: true,
      },
    },

    // =========================
    // ATS ANALYSIS
    // =========================

    atsAnalysis: {
      compatible: {
        type: Boolean,
        default: false,
      },

      score: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },

      issues: [
        {
          type: String,
          trim: true,
        },
      ],

      suggestions: [
        {
          type: String,
          trim: true,
        },
      ],
    },

    // =========================
    // RESUME STRENGTHS
    // =========================

    strengths: [
      {
        type: String,
        trim: true,
      },
    ],

    // =========================
    // RESUME WEAKNESSES
    // =========================

    weaknesses: [
      {
        type: String,
        trim: true,
      },
    ],

    // =========================
    // IMPROVEMENT SUGGESTIONS
    // =========================

    suggestions: [
      {
        category: {
          type: String,
          enum: [
            "skills",
            "projects",
            "experience",
            "education",
            "formatting",
            "keywords",
            "ats",
            "general",
          ],
          default: "general",
        },

        title: {
          type: String,
          trim: true,
          default: "",
        },

        description: {
          type: String,
          trim: true,
          default: "",
        },

        priority: {
          type: String,
          enum: ["high", "medium", "low"],
          default: "medium",
        },

        completed: {
          type: Boolean,
          default: false,
        },
      },
    ],

    // =========================
    // CAREER ALIGNMENT
    // =========================

    careerAlignment: {
      score: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },

      matchedSkills: [
        {
          type: String,
          trim: true,
        },
      ],

      missingSkills: [
        {
          type: String,
          trim: true,
        },
      ],

      relevantProjects: [
        {
          type: String,
          trim: true,
        },
      ],

      recommendation: {
        type: String,
        trim: true,
        default: "",
      },
    },

    // =========================
    // ANALYSIS STATUS
    // =========================

    status: {
      type: String,
      enum: ["not_analyzed", "analyzing", "completed", "failed"],
      default: "not_analyzed",
    },

    analysisError: {
      type: String,
      trim: true,
      default: "",
    },

    lastAnalyzedAt: {
      type: Date,
      default: null,
    },

    // =========================
    // AI ANALYSIS METADATA
    // =========================

    aiAnalysis: {
      enabled: {
        type: Boolean,
        default: true,
      },

      model: {
        type: String,
        trim: true,
        default: "",
      },

      analyzedBy: {
        type: String,
        trim: true,
        default: "AI Resume Analyzer",
      },
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("ResumeAnalysis", ResumeAnalysisSchema);
