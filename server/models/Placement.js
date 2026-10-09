const mongoose = require("mongoose");

const PlacementSchema = new mongoose.Schema(
  {
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
      required: true,
    },

    targetRole: {
      type: String,
      trim: true,
      default: "",
    },

    dreamCompany: {
      type: String,
      trim: true,
      default: "",
    },

    readiness: {
      overall: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },

      technicalSkills: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },

      dsa: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },

      projects: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },

      resume: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },

      interview: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },

      communication: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
    },

    skills: {
      required: [
        {
          type: String,
          trim: true,
        },
      ],

      completed: [
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
    },

    dsa: {
      level: {
        type: String,
        enum: ["not_started", "beginner", "intermediate", "advanced"],
        default: "not_started",
      },

      questionsSolved: {
        type: Number,
        default: 0,
        min: 0,
      },

      topicsCompleted: [
        {
          type: String,
          trim: true,
        },
      ],
    },

    projects: {
      total: {
        type: Number,
        default: 0,
        min: 0,
      },

      completed: {
        type: Number,
        default: 0,
        min: 0,
      },

      featured: [
        {
          type: String,
          trim: true,
        },
      ],
    },

    resume: {
      uploaded: {
        type: Boolean,
        default: false,
      },

      score: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },

      lastAnalyzedAt: {
        type: Date,
        default: null,
      },
    },

    interview: {
      mockInterviews: {
        type: Number,
        default: 0,
        min: 0,
      },

      completed: {
        type: Number,
        default: 0,
        min: 0,
      },

      lastScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
    },

    checklist: [
      {
        title: {
          type: String,
          required: true,
          trim: true,
        },

        category: {
          type: String,
          enum: [
            "skills",
            "dsa",
            "projects",
            "resume",
            "interview",
            "communication",
            "other",
          ],
          default: "other",
        },

        completed: {
          type: Boolean,
          default: false,
        },

        completedAt: {
          type: Date,
          default: null,
        },
      },
    ],

    skillGaps: [
      {
        skill: {
          type: String,
          trim: true,
        },

        priority: {
          type: String,
          enum: ["high", "medium", "low"],
          default: "medium",
        },

        reason: {
          type: String,
          trim: true,
          default: "",
        },

        completed: {
          type: Boolean,
          default: false,
        },
      },
    ],

    nextAction: {
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

      category: {
        type: String,
        enum: [
          "skills",
          "dsa",
          "projects",
          "resume",
          "interview",
          "communication",
          "other",
        ],
        default: "other",
      },

      priority: {
        type: String,
        enum: ["high", "medium", "low"],
        default: "medium",
      },
    },

    status: {
      type: String,
      enum: ["not_started", "in_progress", "ready"],
      default: "not_started",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Placement", PlacementSchema);
