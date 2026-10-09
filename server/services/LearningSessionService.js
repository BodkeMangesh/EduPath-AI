const LearningSession = require("../models/LearningSession");

class LearningSessionService {
  /*
  |--------------------------------------------------------------------------
  | NORMALIZATION HELPERS
  |--------------------------------------------------------------------------
  */

  normalizeCareerId(careerId) {
    if (!careerId) {
      throw new Error("Career ID is required.");
    }

    return String(careerId).trim().toLowerCase();
  }

  normalizeTopic(topic) {
    if (!topic) {
      throw new Error("Topic is required.");
    }

    return String(topic).trim();
  }

  normalizePhase(phase) {
    const normalizedPhase = Number(phase);

    if (!Number.isFinite(normalizedPhase) || normalizedPhase < 1) {
      throw new Error("Invalid phase.");
    }

    return normalizedPhase;
  }

  /*
  |--------------------------------------------------------------------------
  | START LEARNING SESSION
  |--------------------------------------------------------------------------
  */

  async startSession({
    userId,
    careerId,
    phase,
    phaseTitle = "",
    topic,
    type = "learn",
    plannedDurationMinutes = 0,
    learningStyle = "mixed",
    resourceTitle = "",
    resourceProvider = "",
    resourceUrl = "",
    source = "resources",
  }) {
    if (!userId) {
      throw new Error("User ID is required.");
    }

    const normalizedCareerId = this.normalizeCareerId(careerId);
    const normalizedTopic = this.normalizeTopic(topic);
    const normalizedPhase = this.normalizePhase(phase);

    if (!["learn", "practice", "revision"].includes(type)) {
      throw new Error("Invalid learning session type.");
    }

    const normalizedPlannedDuration =
      Number(plannedDurationMinutes) > 0 ? Number(plannedDurationMinutes) : 0;

    /*
    |--------------------------------------------------------------------------
    | CHECK EXISTING ACTIVE / PAUSED SESSION
    |--------------------------------------------------------------------------
    */

    const existingSession = await LearningSession.findOne({
      user: userId,
      careerId: normalizedCareerId,
      topic: normalizedTopic,
      status: {
        $in: ["started", "paused"],
      },
    }).sort({
      createdAt: -1,
    });

    /*
     * Prevent duplicate sessions for the same topic.
     */

    if (existingSession) {
      return this.decorateSession(existingSession);
    }

    /*
    |--------------------------------------------------------------------------
    | CREATE SESSION
    |--------------------------------------------------------------------------
    */

    const session = await LearningSession.create({
      user: userId,
      careerId: normalizedCareerId,
      phase: normalizedPhase,
      phaseTitle: String(phaseTitle || "").trim(),
      topic: normalizedTopic,
      type,
      status: "started",

      startedAt: new Date(),

      durationSeconds: 0,
      durationMinutes: 0,

      plannedDurationMinutes: normalizedPlannedDuration,

      progress: 0,

      learningStyle,

      resourceTitle: String(resourceTitle || "").trim(),
      resourceProvider: String(resourceProvider || "").trim(),
      resourceUrl: String(resourceUrl || "").trim(),

      notes: "",

      completedAt: null,

      topicCompleted: false,

      source,
    });

    return this.decorateSession(session);
  }

  /*
  |--------------------------------------------------------------------------
  | GET SESSION BY ID
  |--------------------------------------------------------------------------
  */

  async getSession(sessionId, userId) {
    if (!sessionId) {
      throw new Error("Session ID is required.");
    }

    if (!userId) {
      throw new Error("User ID is required.");
    }

    const session = await LearningSession.findOne({
      _id: sessionId,
      user: userId,
    });

    if (!session) {
      throw new Error("Learning session not found.");
    }

    return this.decorateSession(session);
  }

  /*
  |--------------------------------------------------------------------------
  | GET RAW SESSION
  |--------------------------------------------------------------------------
  |
  | Used internally when we need to modify the mongoose document.
  |
  */

  async getSessionDocument(sessionId, userId) {
    if (!sessionId) {
      throw new Error("Session ID is required.");
    }

    if (!userId) {
      throw new Error("User ID is required.");
    }

    const session = await LearningSession.findOne({
      _id: sessionId,
      user: userId,
    });

    if (!session) {
      throw new Error("Learning session not found.");
    }

    return session;
  }

  /*
  |--------------------------------------------------------------------------
  | PAUSE SESSION
  |--------------------------------------------------------------------------
  */

  async pauseSession(sessionId, userId) {
    const session = await this.getSessionDocument(sessionId, userId);

    if (session.status === "completed") {
      throw new Error("Completed session cannot be paused.");
    }

    if (session.status === "abandoned") {
      throw new Error("Abandoned session cannot be paused.");
    }

    /*
     * Already paused.
     */

    if (session.status === "paused") {
      return this.decorateSession(session);
    }

    /*
     * Save currently active time before pausing.
     */

    this.accumulateActiveDuration(session);

    session.status = "paused";

    /*
     * No active segment while paused.
     */

    session.startedAt = null;

    await session.save();

    return this.decorateSession(session);
  }

  /*
  |--------------------------------------------------------------------------
  | RESUME SESSION
  |--------------------------------------------------------------------------
  */

  async resumeSession(sessionId, userId) {
    const session = await this.getSessionDocument(sessionId, userId);

    if (session.status === "completed") {
      throw new Error("Completed session cannot be resumed.");
    }

    if (session.status === "abandoned") {
      throw new Error("Abandoned session cannot be resumed.");
    }

    /*
     * Already running.
     */

    if (session.status === "started") {
      return this.decorateSession(session);
    }

    /*
     * Start a new active segment.
     */

    session.status = "started";
    session.startedAt = new Date();

    await session.save();

    return this.decorateSession(session);
  }

  /*
  |--------------------------------------------------------------------------
  | COMPLETE SESSION
  |--------------------------------------------------------------------------
  */

  async completeSession(sessionId, userId, options = {}) {
    const session = await this.getSessionDocument(sessionId, userId);

    /*
    |--------------------------------------------------------------------------
    | IDEMPOTENCY
    |--------------------------------------------------------------------------
    |
    | If frontend accidentally sends complete twice,
    | do not add duration twice.
    |
    */

    if (session.status === "completed") {
      return this.decorateSession(session);
    }

    if (session.status === "abandoned") {
      throw new Error("Abandoned session cannot be completed.");
    }

    /*
    |--------------------------------------------------------------------------
    | FINAL ACTIVE DURATION
    |--------------------------------------------------------------------------
    */

    this.accumulateActiveDuration(session);

    /*
    |--------------------------------------------------------------------------
    | COMPLETE
    |--------------------------------------------------------------------------
    */

    session.status = "completed";
    session.completedAt = new Date();
    session.startedAt = null;
    session.progress = 100;

    /*
    |--------------------------------------------------------------------------
    | TOPIC COMPLETION
    |--------------------------------------------------------------------------
    */

    if (options.topicCompleted === true) {
      session.topicCompleted = true;
    }

    await session.save();

    return this.decorateSession(session);
  }

  /*
  |--------------------------------------------------------------------------
  | ABANDON SESSION
  |--------------------------------------------------------------------------
  */

  async abandonSession(sessionId, userId) {
    const session = await this.getSessionDocument(sessionId, userId);

    if (session.status === "completed") {
      throw new Error("Completed session cannot be abandoned.");
    }

    /*
     * Already abandoned.
     */

    if (session.status === "abandoned") {
      return this.decorateSession(session);
    }

    /*
     * Save final active duration.
     */

    this.accumulateActiveDuration(session);

    session.status = "abandoned";
    session.completedAt = new Date();
    session.startedAt = null;

    await session.save();

    return this.decorateSession(session);
  }

  /*
  |--------------------------------------------------------------------------
  | UPDATE SESSION PROGRESS
  |--------------------------------------------------------------------------
  */

  async updateProgress(sessionId, userId, progress) {
    const session = await this.getSessionDocument(sessionId, userId);

    if (session.status === "completed") {
      return this.decorateSession(session);
    }

    if (session.status === "abandoned") {
      throw new Error("Abandoned session cannot be updated.");
    }

    let normalizedProgress = Number(progress);

    if (!Number.isFinite(normalizedProgress)) {
      normalizedProgress = 0;
    }

    normalizedProgress = Math.min(100, Math.max(0, normalizedProgress));

    session.progress = normalizedProgress;

    await session.save();

    return this.decorateSession(session);
  }

  /*
  |--------------------------------------------------------------------------
  | UPDATE SESSION NOTES
  |--------------------------------------------------------------------------
  */

  async updateNotes(sessionId, userId, notes) {
    const session = await this.getSessionDocument(sessionId, userId);

    if (session.status === "abandoned") {
      throw new Error("Abandoned session cannot be updated.");
    }

    const normalizedNotes = String(notes || "").trim();

    if (normalizedNotes.length > 2000) {
      throw new Error("Notes cannot exceed 2000 characters.");
    }

    session.notes = normalizedNotes;

    await session.save();

    return this.decorateSession(session);
  }

  /*
  |--------------------------------------------------------------------------
  | UPDATE LEARNING INTELLIGENCE
  |--------------------------------------------------------------------------
  |
  | Used later by AI Learning Intelligence Service.
  |
  */

  async updateLearningIntelligence(sessionId, userId, data = {}) {
    const session = await this.getSessionDocument(sessionId, userId);

    if (session.status === "abandoned") {
      throw new Error("Abandoned session cannot update learning intelligence.");
    }

    /*
    |--------------------------------------------------------------------------
    | UNDERSTANDING SCORE
    |--------------------------------------------------------------------------
    */

    if (data.understandingScore !== undefined) {
      session.understandingScore = this.normalizeScore(data.understandingScore);
    }

    /*
    |--------------------------------------------------------------------------
    | CONFIDENCE SCORE
    |--------------------------------------------------------------------------
    */

    if (data.confidenceScore !== undefined) {
      session.confidenceScore = this.normalizeScore(data.confidenceScore);
    }

    /*
    |--------------------------------------------------------------------------
    | FOCUS SCORE
    |--------------------------------------------------------------------------
    */

    if (data.focusScore !== undefined) {
      session.focusScore = this.normalizeScore(data.focusScore);
    }

    /*
    |--------------------------------------------------------------------------
    | FOCUS LEVEL
    |--------------------------------------------------------------------------
    */

    if (data.focusLevel !== undefined) {
      session.focusLevel = this.normalizeEnumValue(
        data.focusLevel,
        ["low", "moderate", "high"],
        "focus level",
      );
    }

    /*
    |--------------------------------------------------------------------------
    | DIFFICULTY
    |--------------------------------------------------------------------------
    */

    if (data.difficultyLevel !== undefined) {
      session.difficultyLevel = this.normalizeEnumValue(
        data.difficultyLevel,
        ["easy", "medium", "hard"],
        "difficulty level",
      );
    }

    /*
    |--------------------------------------------------------------------------
    | AI COACH INSIGHTS
    |--------------------------------------------------------------------------
    */

    if (data.aiCoachInsights !== undefined) {
      if (!Array.isArray(data.aiCoachInsights)) {
        throw new Error("AI coach insights must be an array.");
      }

      session.aiCoachInsights = data.aiCoachInsights
        .map((item) => String(item).trim())
        .filter(Boolean)
        .slice(0, 10);
    }

    /*
    |--------------------------------------------------------------------------
    | AI RECOMMENDATION
    |--------------------------------------------------------------------------
    */

    if (data.aiRecommendation !== undefined) {
      session.aiRecommendation = String(data.aiRecommendation || "")
        .trim()
        .slice(0, 1000);
    }

    /*
    |--------------------------------------------------------------------------
    | AI REVISION
    |--------------------------------------------------------------------------
    */

    if (data.aiRevisionRequired !== undefined) {
      session.aiRevisionRequired = Boolean(data.aiRevisionRequired);
    }

    /*
    |--------------------------------------------------------------------------
    | REVISION RECOMMENDATION
    |--------------------------------------------------------------------------
    */

    if (data.revisionRecommended !== undefined) {
      session.revisionRecommended = Boolean(data.revisionRecommended);
    }

    if (data.revisionReason !== undefined) {
      session.revisionReason = String(data.revisionReason || "")
        .trim()
        .slice(0, 1000);
    }

    /*
    |--------------------------------------------------------------------------
    | NEXT TOPIC
    |--------------------------------------------------------------------------
    */

    if (data.nextTopic !== undefined) {
      session.nextTopic = String(data.nextTopic || "").trim();
    }

    /*
    |--------------------------------------------------------------------------
    | XP
    |--------------------------------------------------------------------------
    */

    if (data.xpEarned !== undefined) {
      const xp = Number(data.xpEarned);

      if (!Number.isFinite(xp) || xp < 0) {
        throw new Error("Invalid XP value.");
      }

      session.xpEarned = Math.floor(xp);
    }

    await session.save();

    return this.decorateSession(session);
  }

  /*
  |--------------------------------------------------------------------------
  | UPDATE UNDERSTANDING CHECK
  |--------------------------------------------------------------------------
  */

  async updateUnderstandingCheck(sessionId, userId, checkData = {}) {
    const session = await this.getSessionDocument(sessionId, userId);

    if (session.status === "abandoned") {
      throw new Error("Abandoned session cannot update understanding check.");
    }

    const question = String(checkData.question || "").trim();

    const options = Array.isArray(checkData.options)
      ? checkData.options
          .map((option) => String(option).trim())
          .filter(Boolean)
          .slice(0, 10)
      : [];

    const correctAnswer = String(checkData.correctAnswer || "").trim();

    const userAnswer = String(checkData.userAnswer || "").trim();

    const feedback = String(checkData.feedback || "")
      .trim()
      .slice(0, 1000);

    let isCorrect = null;

    if (userAnswer && correctAnswer) {
      isCorrect = userAnswer.toLowerCase() === correctAnswer.toLowerCase();
    }

    session.understandingCheck = {
      question,
      options,
      correctAnswer,
      userAnswer,
      isCorrect,
      feedback,
    };

    session.questionsAttempted =
      Math.max(0, Number(session.questionsAttempted) || 0) + 1;

    if (isCorrect === true) {
      session.questionsCorrect =
        Math.max(0, Number(session.questionsCorrect) || 0) + 1;
    }

    /*
     * Calculate assessment score from attempts.
     */

    if (session.questionsAttempted > 0) {
      session.assessmentScore = Math.round(
        (session.questionsCorrect / session.questionsAttempted) * 100,
      );
    }

    /*
     * Understanding score follows assessment score
     * when assessment data is available.
     */

    if (session.assessmentScore !== null) {
      session.understandingScore = session.assessmentScore;
    }

    await session.save();

    return this.decorateSession(session);
  }

  /*
  |--------------------------------------------------------------------------
  | UPDATE NEXT TOPIC RECOMMENDATION
  |--------------------------------------------------------------------------
  */

  async updateNextTopicRecommendation(
    sessionId,
    userId,
    { nextTopic = "", revisionRecommended = false, revisionReason = "" } = {},
  ) {
    const session = await this.getSessionDocument(sessionId, userId);

    if (session.status === "abandoned") {
      throw new Error("Abandoned session cannot update recommendation.");
    }

    session.nextTopic = String(nextTopic || "").trim();

    session.revisionRecommended = Boolean(revisionRecommended);

    session.revisionReason = String(revisionReason || "")
      .trim()
      .slice(0, 1000);

    await session.save();

    return this.decorateSession(session);
  }

  /*
  |--------------------------------------------------------------------------
  | UPDATE DURATION
  |--------------------------------------------------------------------------
  */

  async updateDuration(sessionId, userId) {
    const session = await this.getSessionDocument(sessionId, userId);

    if (session.status === "completed" || session.status === "abandoned") {
      return this.decorateSession(session);
    }

    this.accumulateActiveDuration(session);

    await session.save();

    return this.decorateSession(session);
  }

  /*
  |--------------------------------------------------------------------------
  | ACCUMULATE ACTIVE DURATION
  |--------------------------------------------------------------------------
  |
  | durationSeconds = TOTAL ACTIVE TIME
  |
  | startedAt = START OF CURRENT ACTIVE SEGMENT
  |
  */

  accumulateActiveDuration(session) {
    if (!session) {
      return null;
    }

    /*
     * No active segment.
     */

    if (!session.startedAt) {
      this.syncDurationMinutes(session);
      return session;
    }

    /*
     * Only started sessions accumulate time.
     */

    if (session.status !== "started") {
      this.syncDurationMinutes(session);
      return session;
    }

    const now = new Date();
    const startedAt = new Date(session.startedAt);

    const elapsedMilliseconds = now.getTime() - startedAt.getTime();

    if (!Number.isFinite(elapsedMilliseconds)) {
      this.syncDurationMinutes(session);
      return session;
    }

    const elapsedSeconds = Math.max(0, Math.floor(elapsedMilliseconds / 1000));

    if (elapsedSeconds > 0) {
      session.durationSeconds =
        Math.max(0, Number(session.durationSeconds) || 0) + elapsedSeconds;

      /*
       * Reset active segment start.
       *
       * Prevents double counting.
       */

      session.startedAt = now;
    }

    this.syncDurationMinutes(session);

    return session;
  }

  /*
  |--------------------------------------------------------------------------
  | SYNC DURATION MINUTES
  |--------------------------------------------------------------------------
  */

  syncDurationMinutes(session) {
    const seconds = Math.max(0, Number(session.durationSeconds) || 0);

    session.durationMinutes = Math.floor(seconds / 60);

    return session;
  }

  /*
  |--------------------------------------------------------------------------
  | GET USER LEARNING HISTORY
  |--------------------------------------------------------------------------
  */

  async getHistory(userId, careerId = null, options = {}) {
    if (!userId) {
      throw new Error("User ID is required.");
    }

    const requestedLimit = Number(options.limit);

    const limit =
      Number.isFinite(requestedLimit) && requestedLimit > 0
        ? Math.min(Math.floor(requestedLimit), 100)
        : 50;

    const query = {
      user: userId,
    };

    if (careerId) {
      query.careerId = this.normalizeCareerId(careerId);
    }

    const sessions = await LearningSession.find(query)
      .sort({
        createdAt: -1,
      })
      .limit(limit);

    return sessions.map((session) => this.decorateSession(session));
  }

  /*
  |--------------------------------------------------------------------------
  | GET ACTIVE SESSION
  |--------------------------------------------------------------------------
  */

  async getActiveSession(userId, careerId, topic = null) {
    if (!userId) {
      throw new Error("User ID is required.");
    }

    const normalizedCareerId = this.normalizeCareerId(careerId);

    const query = {
      user: userId,
      careerId: normalizedCareerId,
      status: {
        $in: ["started", "paused"],
      },
    };

    if (topic) {
      query.topic = this.normalizeTopic(topic);
    }

    const session = await LearningSession.findOne(query).sort({
      createdAt: -1,
    });

    if (!session) {
      return null;
    }

    return this.decorateSession(session);
  }

  /*
  |--------------------------------------------------------------------------
  | GET TOPIC STATISTICS
  |--------------------------------------------------------------------------
  */

  async getTopicStatistics(userId, careerId, topic) {
    if (!userId) {
      throw new Error("User ID is required.");
    }

    const normalizedCareerId = this.normalizeCareerId(careerId);

    const normalizedTopic = this.normalizeTopic(topic);

    const sessions = await LearningSession.find({
      user: userId,
      careerId: normalizedCareerId,
      topic: normalizedTopic,
    }).sort({
      createdAt: -1,
    });

    const completedSessions = sessions.filter(
      (session) => session.status === "completed",
    );

    const completedTopicSessions = sessions.filter(
      (session) => session.topicCompleted === true,
    );

    const totalSeconds = sessions.reduce(
      (total, session) =>
        total + Math.max(0, Number(session.durationSeconds) || 0),
      0,
    );

    const totalMinutes = Math.floor(totalSeconds / 60);

    return {
      topic: normalizedTopic,

      totalSessions: sessions.length,

      completedSessions: completedSessions.length,

      topicCompleted: completedTopicSessions.length > 0,

      completed: completedTopicSessions.length > 0,

      totalSeconds,

      totalMinutes,

      totalHours: Number((totalSeconds / 3600).toFixed(2)),

      averageUnderstandingScore: this.calculateAverageScore(
        sessions,
        "understandingScore",
      ),

      averageConfidenceScore: this.calculateAverageScore(
        sessions,
        "confidenceScore",
      ),

      averageFocusScore: this.calculateAverageScore(sessions, "focusScore"),

      sessions: sessions.map((session) => this.decorateSession(session)),
    };
  }

  /*
  |--------------------------------------------------------------------------
  | GET LEARNING SUMMARY
  |--------------------------------------------------------------------------
  */

  async getLearningSummary(userId, careerId = null) {
    if (!userId) {
      throw new Error("User ID is required.");
    }

    const query = {
      user: userId,
    };

    if (careerId) {
      query.careerId = this.normalizeCareerId(careerId);
    }

    const sessions = await LearningSession.find(query);

    const completedSessions = sessions.filter(
      (session) => session.status === "completed",
    );

    const completedTopics = new Set(
      sessions
        .filter((session) => session.topicCompleted === true)
        .map((session) => session.topic),
    );

    const totalSeconds = sessions.reduce(
      (total, session) =>
        total + Math.max(0, Number(session.durationSeconds) || 0),
      0,
    );

    const totalStudyMinutes = Math.floor(totalSeconds / 60);

    const totalStudyHours = Number((totalSeconds / 3600).toFixed(2));

    return {
      totalSessions: sessions.length,

      completedSessions: completedSessions.length,

      completedTopics: completedTopics.size,

      totalStudySeconds: totalSeconds,

      totalStudyMinutes,

      totalStudyHours,

      averageUnderstandingScore: this.calculateAverageScore(
        sessions,
        "understandingScore",
      ),

      averageConfidenceScore: this.calculateAverageScore(
        sessions,
        "confidenceScore",
      ),

      averageFocusScore: this.calculateAverageScore(sessions, "focusScore"),

      totalXp: sessions.reduce(
        (total, session) => total + Math.max(0, Number(session.xpEarned) || 0),
        0,
      ),
    };
  }

  /*
  |--------------------------------------------------------------------------
  | DECORATE SESSION
  |--------------------------------------------------------------------------
  |
  | Converts Mongo document into frontend-friendly data.
  |
  */

  decorateSession(session) {
    if (!session) {
      return null;
    }

    const data =
      typeof session.toObject === "function"
        ? session.toObject()
        : { ...session };

    /*
    |--------------------------------------------------------------------------
    | STORED DURATION
    |--------------------------------------------------------------------------
    */

    const storedDurationSeconds = Math.max(
      0,
      Number(data.durationSeconds) || 0,
    );

    /*
    |--------------------------------------------------------------------------
    | LIVE ACTIVE DURATION
    |--------------------------------------------------------------------------
    */

    let liveDurationSeconds = storedDurationSeconds;

    if (data.status === "started" && data.startedAt) {
      const startedAt = new Date(data.startedAt);

      const now = new Date();

      const elapsedSeconds = Math.max(
        0,
        Math.floor((now.getTime() - startedAt.getTime()) / 1000),
      );

      liveDurationSeconds += elapsedSeconds;
    }

    const liveDurationMinutes = Math.floor(liveDurationSeconds / 60);

    /*
    |--------------------------------------------------------------------------
    | PLANNED DURATION
    |--------------------------------------------------------------------------
    */

    const plannedDurationMinutes = Math.max(
      0,
      Number(data.plannedDurationMinutes) || 0,
    );

    const plannedDurationSeconds = plannedDurationMinutes * 60;

    /*
    |--------------------------------------------------------------------------
    | DISPLAY PROGRESS
    |--------------------------------------------------------------------------
    */

    let calculatedProgress = Number(data.progress) || 0;

    if (data.status === "started" && plannedDurationSeconds > 0) {
      calculatedProgress = Math.min(
        100,
        Math.round((liveDurationSeconds / plannedDurationSeconds) * 100),
      );
    }

    if (data.status === "completed") {
      calculatedProgress = 100;
    }

    /*
    |--------------------------------------------------------------------------
    | REMAINING TIME
    |--------------------------------------------------------------------------
    */

    const remainingSeconds = Math.max(
      0,
      plannedDurationSeconds - liveDurationSeconds,
    );

    const remainingMinutes = Math.ceil(remainingSeconds / 60);

    /*
    |--------------------------------------------------------------------------
    | FOCUS / UNDERSTANDING HELPERS
    |--------------------------------------------------------------------------
    */

    const understandingScore = this.safeScore(data.understandingScore);

    const confidenceScore = this.safeScore(data.confidenceScore);

    const focusScore = this.safeScore(data.focusScore);

    /*
    |--------------------------------------------------------------------------
    | RETURN FRONTEND-FRIENDLY SESSION
    |--------------------------------------------------------------------------
    */

    return {
      ...data,

      /*
       * Authoritative database duration.
       */

      durationSeconds: storedDurationSeconds,

      /*
       * Live duration for UI.
       */

      elapsedSeconds: liveDurationSeconds,

      durationMinutes: liveDurationMinutes,

      elapsedMinutes: liveDurationMinutes,

      plannedDurationMinutes,

      plannedDurationSeconds,

      progress: Math.min(100, Math.max(0, calculatedProgress)),

      remainingSeconds,

      remainingMinutes,

      /*
       * Status helpers.
       */

      isActive: data.status === "started",

      isPaused: data.status === "paused",

      isCompleted: data.status === "completed",

      isAbandoned: data.status === "abandoned",

      /*
       * Intelligence helpers.
       */

      understandingScore,

      confidenceScore,

      focusScore,

      hasUnderstandingCheck: Boolean(
        data.understandingCheck && data.understandingCheck.question,
      ),

      hasAssessment: Number(data.questionsAttempted) > 0,

      assessmentScore: this.safeScore(data.assessmentScore),

      /*
       * Revision helper.
       */

      needsRevision: Boolean(
        data.aiRevisionRequired || data.revisionRecommended,
      ),
    };
  }

  /*
  |--------------------------------------------------------------------------
  | NORMALIZE SCORE
  |--------------------------------------------------------------------------
  */

  normalizeScore(score) {
    const numericScore = Number(score);

    if (!Number.isFinite(numericScore)) {
      throw new Error("Score must be a valid number.");
    }

    return Math.min(100, Math.max(0, Math.round(numericScore)));
  }

  /*
  |--------------------------------------------------------------------------
  | SAFE SCORE
  |--------------------------------------------------------------------------
  */

  safeScore(score) {
    if (score === null || score === undefined) {
      return null;
    }

    const numericScore = Number(score);

    if (!Number.isFinite(numericScore)) {
      return null;
    }

    return Math.min(100, Math.max(0, Math.round(numericScore)));
  }

  /*
  |--------------------------------------------------------------------------
  | NORMALIZE ENUM VALUE
  |--------------------------------------------------------------------------
  */

  normalizeEnumValue(value, allowedValues, fieldName) {
    const normalizedValue = String(value || "")
      .trim()
      .toLowerCase();

    if (!allowedValues.includes(normalizedValue)) {
      throw new Error(`Invalid ${fieldName}.`);
    }

    return normalizedValue;
  }

  /*
  |--------------------------------------------------------------------------
  | CALCULATE AVERAGE SCORE
  |--------------------------------------------------------------------------
  */

  calculateAverageScore(sessions, field) {
    const scores = sessions
      .map((session) => this.safeScore(session[field]))
      .filter((score) => score !== null);

    if (scores.length === 0) {
      return null;
    }

    const total = scores.reduce((sum, score) => sum + score, 0);

    return Math.round(total / scores.length);
  }
}

/*
|--------------------------------------------------------------------------
| EXPORT
|--------------------------------------------------------------------------
*/

module.exports = new LearningSessionService();
