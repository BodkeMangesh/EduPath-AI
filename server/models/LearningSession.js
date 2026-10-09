const mongoose = require("mongoose");

/*
|--------------------------------------------------------------------------
| Learning Session Schema
|--------------------------------------------------------------------------
|
| One document = one actual learning activity.
|
| Time tracking:
|
| durationSeconds
|   ↓
| Total ACTIVE time accumulated across all active segments.
|
| startedAt
|   ↓
| Start time of the CURRENT active segment only.
|
| Example:
|
| Start  → 10 min → Pause
| Resume → 15 min → Complete
|
| durationSeconds = 25 * 60
|
|--------------------------------------------------------------------------
*/

const learningSessionSchema = new mongoose.Schema(
  {
    /*
    |--------------------------------------------------------------------------
    | User
    |--------------------------------------------------------------------------
    */

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | Career
    |--------------------------------------------------------------------------
    */

    careerId: {
      type: String,
      required: [true, "Career ID is required"],
      trim: true,
      lowercase: true,
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | Phase
    |--------------------------------------------------------------------------
    */

    phase: {
      type: Number,
      required: [true, "Phase is required"],
      min: 1,
    },

    phaseTitle: {
      type: String,
      default: "",
      trim: true,
    },

    /*
    |--------------------------------------------------------------------------
    | Topic
    |--------------------------------------------------------------------------
    */

    topic: {
      type: String,
      required: [true, "Topic is required"],
      trim: true,
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | Learning Activity Type
    |--------------------------------------------------------------------------
    */

    type: {
      type: String,
      enum: ["learn", "practice", "revision"],
      required: [true, "Learning activity type is required"],
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | Session Status
    |--------------------------------------------------------------------------
    */

    status: {
      type: String,
      enum: ["started", "paused", "completed", "abandoned"],
      default: "started",
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | Time Tracking
    |--------------------------------------------------------------------------
    */

    /*
     * Start time of CURRENT active segment.
     *
     * When paused:
     * startedAt becomes null.
     *
     * When resumed:
     * startedAt = new Date()
     */

    startedAt: {
      type: Date,
      default: Date.now,
    },

    /*
     * Total active learning time in seconds.
     *
     * This is the authoritative value.
     */

    durationSeconds: {
      type: Number,
      default: 0,
      min: 0,
    },

    /*
     * Kept for compatibility / easier frontend display.
     *
     * This value is derived from durationSeconds.
     */

    durationMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },

    /*
     * Planned duration from Today's Plan.
     */

    plannedDurationMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },

    /*
    |--------------------------------------------------------------------------
    | Completion
    |--------------------------------------------------------------------------
    */

    completedAt: {
      type: Date,
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | Session Progress
    |--------------------------------------------------------------------------
    */

    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    /*
    |--------------------------------------------------------------------------
    | Learning Metadata
    |--------------------------------------------------------------------------
    */

    learningStyle: {
      type: String,
      enum: ["visual", "reading", "practical", "mixed"],
      default: "mixed",
    },

    /*
    |--------------------------------------------------------------------------
    | Resource
    |--------------------------------------------------------------------------
    */

    resourceTitle: {
      type: String,
      default: "",
      trim: true,
    },

    resourceProvider: {
      type: String,
      default: "",
      trim: true,
    },

    resourceUrl: {
      type: String,
      default: "",
      trim: true,
    },

    /*
    |--------------------------------------------------------------------------
    | Notes
    |--------------------------------------------------------------------------
    */

    notes: {
      type: String,
      default: "",
      maxlength: 2000,
      trim: true,
    },

    /*
    |--------------------------------------------------------------------------
    | Topic Completion
    |--------------------------------------------------------------------------
    */

    topicCompleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | Source
    |--------------------------------------------------------------------------
    */

    source: {
      type: String,
      enum: ["roadmap", "resources", "today-plan", "dashboard"],
      default: "resources",
    },

    /*
    |--------------------------------------------------------------------------
    | LEARNING INTELLIGENCE
    |--------------------------------------------------------------------------
    |
    | These fields store the learning signals generated during a session.
    |
    */

    /*
     * AI/user understanding score.
     *
     * 0 - 100
     */

    understandingScore: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },

    /*
     * Learner confidence after the session/check.
     *
     * 0 - 100
     */

    confidenceScore: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },

    /*
     * Focus score calculated from session behaviour.
     *
     * 0 - 100
     */

    focusScore: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },

    /*
     * Human-readable focus classification.
     */

    focusLevel: {
      type: String,
      enum: ["low", "moderate", "high", null],
      default: null,
    },

    /*
     * Estimated topic difficulty.
     */

    difficultyLevel: {
      type: String,
      enum: ["easy", "medium", "hard", null],
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | AI LEARNING COACH
    |--------------------------------------------------------------------------
    */

    /*
     * Short AI-generated coaching insights.
     */

    aiCoachInsights: {
      type: [String],
      default: [],
    },

    /*
     * Main AI recommendation generated from this session.
     */

    aiRecommendation: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },

    /*
     * Whether AI recommends revision.
     */

    aiRevisionRequired: {
      type: Boolean,
      default: false,
    },

    /*
    |--------------------------------------------------------------------------
    | UNDERSTANDING CHECK
    |--------------------------------------------------------------------------
    |
    | Stores the result of the quick AI-generated understanding check.
    |
    */

    understandingCheck: {
      type: {
        question: {
          type: String,
          default: "",
          trim: true,
        },

        options: {
          type: [String],
          default: [],
        },

        correctAnswer: {
          type: String,
          default: "",
          trim: true,
        },

        userAnswer: {
          type: String,
          default: "",
          trim: true,
        },

        isCorrect: {
          type: Boolean,
          default: null,
        },

        feedback: {
          type: String,
          default: "",
          trim: true,
          maxlength: 1000,
        },
      },
      default: null,
    },

    /*
     * Number of questions attempted during this session.
     */

    questionsAttempted: {
      type: Number,
      default: 0,
      min: 0,
    },

    /*
     * Number of questions answered correctly.
     */

    questionsCorrect: {
      type: Number,
      default: 0,
      min: 0,
    },

    /*
     * Overall assessment score.
     *
     * 0 - 100
     */

    assessmentScore: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },

    /*
    |--------------------------------------------------------------------------
    | NEXT TOPIC INTELLIGENCE
    |--------------------------------------------------------------------------
    */

    /*
     * AI-recommended next topic.
     */

    nextTopic: {
      type: String,
      default: "",
      trim: true,
    },

    /*
     * Whether revision should happen before moving ahead.
     */

    revisionRecommended: {
      type: Boolean,
      default: false,
    },

    /*
     * Explanation for revision recommendation.
     */

    revisionReason: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },

    /*
    |--------------------------------------------------------------------------
    | GAMIFICATION
    |--------------------------------------------------------------------------
    */

    /*
     * XP earned from this session.
     */

    xpEarned: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

/*
|--------------------------------------------------------------------------
| INDEXES
|--------------------------------------------------------------------------
*/

learningSessionSchema.index({
  user: 1,
  createdAt: -1,
});

learningSessionSchema.index({
  user: 1,
  careerId: 1,
});

learningSessionSchema.index({
  user: 1,
  topic: 1,
});

learningSessionSchema.index({
  user: 1,
  status: 1,
});

/*
 * Useful for active-session lookup.
 */

learningSessionSchema.index({
  user: 1,
  careerId: 1,
  topic: 1,
  status: 1,
});

/*
|--------------------------------------------------------------------------
| EXPORT
|--------------------------------------------------------------------------
*/

module.exports = mongoose.model("LearningSession", learningSessionSchema);
