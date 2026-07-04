const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

/*
|--------------------------------------------------------------------------
| Enums
|--------------------------------------------------------------------------
*/

const USER_ROLES = ["student", "professional", "admin"];

const ACCOUNT_STATUS = ["active", "inactive", "blocked", "suspended"];

const LEARNING_STYLES = ["visual", "reading", "practical", "mixed"];

const PLACEMENT_TYPES = ["tech", "non-tech", "both"];

/*
|--------------------------------------------------------------------------
| User Schema
|--------------------------------------------------------------------------
*/

const userSchema = new mongoose.Schema(
  {
    /*
    |--------------------------------------------------------------------------
    | Basic Information
    |--------------------------------------------------------------------------
    */

    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: 3,
      maxlength: 100,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
      select: false,
    },

    profileImage: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      default: "",
      maxlength: 500,
      trim: true,
    },

    dateOfBirth: {
      type: Date,
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },

    role: {
      type: String,
      enum: USER_ROLES,
      default: "student",
    },

    accountStatus: {
      type: String,
      enum: ACCOUNT_STATUS,
      default: "active",
    },

    learningStyle: {
      type: String,
      enum: LEARNING_STYLES,
      default: "mixed",
    },

    placementFocus: {
      type: String,
      enum: PLACEMENT_TYPES,
      default: "both",
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLogin: {
      type: Date,
    },

    /*
    |--------------------------------------------------------------------------
    | Academic Information
    |--------------------------------------------------------------------------
    */

    education: {
      collegeName: {
        type: String,
        trim: true,
        default: "",
      },

      university: {
        type: String,
        trim: true,
        default: "",
      },

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

      semester: {
        type: Number,
        default: 1,
        min: 1,
        max: 12,
      },

      graduationYear: {
        type: Number,
      },

      cgpa: {
        type: Number,
        min: 0,
        max: 10,
      },
    },

    /*
    |--------------------------------------------------------------------------
    | Professional Information
    |--------------------------------------------------------------------------
    */

    professional: {
      experienceLevel: {
        type: String,
        enum: ["beginner", "intermediate", "advanced", "professional"],
        default: "beginner",
      },

      skills: [
        {
          type: String,
          trim: true,
        },
      ],

      certifications: [
        {
          type: String,
          trim: true,
        },
      ],

      projects: [
        {
          title: String,
          description: String,
          githubLink: String,
          liveLink: String,
        },
      ],

      resumeUrl: {
        type: String,
        default: "",
      },
    },

    /*
    |--------------------------------------------------------------------------
    | AI Profile
    |--------------------------------------------------------------------------
    */

    aiProfile: {
      interests: [
        {
          type: String,
          trim: true,
        },
      ],

      careerGoal: {
        type: String,
        default: "",
      },

      preferredLanguage: {
        type: String,
        default: "English",
      },

      dailyStudyHours: {
        type: Number,
        default: 2,
      },
    },

    /*
    |--------------------------------------------------------------------------
    | Placement Profile
    |--------------------------------------------------------------------------
    */

    placement: {
      targetRole: {
        type: String,
        default: "",
      },

      dreamCompany: {
        type: String,
        default: "",
      },

      dsaLevel: {
        type: String,
        enum: ["beginner", "intermediate", "advanced"],
        default: "beginner",
      },

      interviewReadiness: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
    },

    /*
    |--------------------------------------------------------------------------
    | Social Profiles
    |--------------------------------------------------------------------------
    */

    socialLinks: {
      github: {
        type: String,
        default: "",
      },

      linkedin: {
        type: String,
        default: "",
      },

      portfolio: {
        type: String,
        default: "",
      },
    },

    /*
|--------------------------------------------------------------------------
| Progress Summary
|--------------------------------------------------------------------------
*/

    progress: {
      overallProgress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },

      careerReadiness: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },

      portfolioScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },

      completedRoadmaps: {
        type: Number,
        default: 0,
      },

      completedAssessments: {
        type: Number,
        default: 0,
      },
    },

    /*
|--------------------------------------------------------------------------
| AI Summary
|--------------------------------------------------------------------------
*/

    aiSummary: {
      recommendedCareer: {
        type: String,
        default: "",
      },

      confidenceScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },

      lastRecommendationDate: {
        type: Date,
      },
    },

    /*
|--------------------------------------------------------------------------
| Achievement Summary
|--------------------------------------------------------------------------
*/

    achievements: [
      {
        title: String,
        description: String,
        earnedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },

  {
    timestamps: true,
    versionKey: false,
  },
);

// userSchema.index({ email: 1 });
// userSchema.index({ phone: 1 });
userSchema.index({ role: 1 });

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.set("toJSON", {
  transform: function (doc, ret) {
    delete ret.password;
    delete ret.__v;

    return ret;
  },
});

module.exports = mongoose.model("User", userSchema);
