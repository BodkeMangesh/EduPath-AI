import api from "../api/axios";

/*
|--------------------------------------------------------------------------
| LEARNING PROGRESS
|--------------------------------------------------------------------------
*/

export const getLearningProgress = async (careerId) => {
  if (!careerId) {
    throw new Error("Career ID is required.");
  }

  return await api.get("/learning-progress", {
    params: { careerId },
  });
};

/*
|--------------------------------------------------------------------------
| COMPLETE LEARNING TOPIC
|--------------------------------------------------------------------------
*/

export const completeTopic = async (careerId, topic) => {
  if (!careerId) {
    throw new Error("Career ID is required.");
  }

  if (!topic || !String(topic).trim()) {
    throw new Error("Topic is required.");
  }

  return await api.post("/learning-progress/complete-topic", {
    careerId,
    topic: String(topic).trim(),
  });
};

/*
|--------------------------------------------------------------------------
| COMPLETE TODAY'S LEARNING PLAN
|--------------------------------------------------------------------------
*/

export const completeTodayPlan = async (careerId) => {
  if (!careerId) {
    throw new Error("Career ID is required.");
  }

  return await api.post("/learning-progress/complete-today", {
    careerId,
  });
};

/*
|--------------------------------------------------------------------------
| UPDATE STUDY HOURS
|--------------------------------------------------------------------------
*/

export const updateStudyHours = async (careerId, hours) => {
  if (!careerId) {
    throw new Error("Career ID is required.");
  }

  const numericHours = Number(hours);

  if (!Number.isFinite(numericHours) || numericHours <= 0) {
    throw new Error("Hours must be a valid number greater than 0.");
  }

  return await api.patch("/learning-progress/study-hours", {
    careerId,
    hours: numericHours,
  });
};

/*
|--------------------------------------------------------------------------
| UPDATE LEARNING STREAK
|--------------------------------------------------------------------------
*/

export const updateStreak = async (careerId) => {
  if (!careerId) {
    throw new Error("Career ID is required.");
  }

  return await api.patch("/learning-progress/streak", {
    careerId,
  });
};

/*
|--------------------------------------------------------------------------
| LEARNING RESOURCES
|--------------------------------------------------------------------------
*/

export const getLearningResources = async ({ careerId, phase, topic } = {}) => {
  return await api.get("/resources", {
    params: {
      careerId,
      phase,
      topic,
    },
  });
};

/*
|--------------------------------------------------------------------------
| START LEARNING SESSION
|--------------------------------------------------------------------------
*/

export const startLearningSession = async ({
  careerId,
  phase,
  phaseTitle = "",
  topic,
  type = "learn",
  plannedDurationMinutes = 30,
  learningStyle = "mixed",
  resourceTitle = "",
  resourceProvider = "",
  resourceUrl = "",
  source = "resources",
} = {}) => {
  if (!careerId) {
    throw new Error("Career ID is required.");
  }

  if (!topic || !String(topic).trim()) {
    throw new Error("Topic is required.");
  }

  return await api.post("/learning/session/start", {
    careerId,
    phase,
    phaseTitle,
    topic: String(topic).trim(),
    type,
    plannedDurationMinutes,
    learningStyle,
    resourceTitle,
    resourceProvider,
    resourceUrl,
    source,
  });
};

/*
|--------------------------------------------------------------------------
| GET LEARNING SESSION
|--------------------------------------------------------------------------
*/

export const getLearningSession = async (sessionId) => {
  if (!sessionId) {
    throw new Error("Session ID is required.");
  }

  return await api.get(`/learning/session/${sessionId}`);
};

/*
|--------------------------------------------------------------------------
| GET ACTIVE LEARNING SESSION
|--------------------------------------------------------------------------
*/

export const getActiveLearningSession = async ({ careerId, topic } = {}) => {
  if (!careerId) {
    throw new Error("Career ID is required.");
  }

  return await api.get("/learning/session/active", {
    params: {
      careerId,
      topic,
    },
  });
};

/*
|--------------------------------------------------------------------------
| PAUSE LEARNING SESSION
|--------------------------------------------------------------------------
*/

export const pauseLearningSession = async (sessionId) => {
  if (!sessionId) {
    throw new Error("Session ID is required.");
  }

  return await api.post(`/learning/session/${sessionId}/pause`);
};

/*
|--------------------------------------------------------------------------
| RESUME LEARNING SESSION
|--------------------------------------------------------------------------
*/

export const resumeLearningSession = async (sessionId) => {
  if (!sessionId) {
    throw new Error("Session ID is required.");
  }

  return await api.post(`/learning/session/${sessionId}/resume`);
};

/*
|--------------------------------------------------------------------------
| UPDATE SESSION PROGRESS
|--------------------------------------------------------------------------
*/

export const updateLearningSessionProgress = async (sessionId, progress) => {
  if (!sessionId) {
    throw new Error("Session ID is required.");
  }

  const normalizedProgress = Math.min(100, Math.max(0, Number(progress) || 0));

  return await api.patch(`/learning/session/${sessionId}/progress`, {
    progress: normalizedProgress,
  });
};

/*
|--------------------------------------------------------------------------
| UPDATE SESSION NOTES
|--------------------------------------------------------------------------
*/

export const updateLearningSessionNotes = async (sessionId, notes) => {
  if (!sessionId) {
    throw new Error("Session ID is required.");
  }

  return await api.patch(`/learning/session/${sessionId}/notes`, {
    notes: String(notes || "").trim(),
  });
};

/*
|--------------------------------------------------------------------------
| UPDATE LEARNING INTELLIGENCE
|--------------------------------------------------------------------------
|
| Sends AI/session quality metrics.
|
*/

export const updateLearningIntelligence = async (
  sessionId,
  {
    understandingScore = null,
    confidenceScore = null,
    focusScore = null,
    focusLevel = null,
    difficultyLevel = null,
    aiCoachInsights = [],
    aiRecommendation = "",
    aiRevisionRequired = false,
    revisionRecommended = false,
    revisionReason = "",
    xpEarned = 0,
  } = {},
) => {
  if (!sessionId) {
    throw new Error("Session ID is required.");
  }

  return await api.patch(`/learning/session/${sessionId}/intelligence`, {
    understandingScore,
    confidenceScore,
    focusScore,
    focusLevel,
    difficultyLevel,
    aiCoachInsights,
    aiRecommendation,
    aiRevisionRequired,
    revisionRecommended,
    revisionReason,
    xpEarned,
  });
};

/*
|--------------------------------------------------------------------------
| UPDATE UNDERSTANDING CHECK
|--------------------------------------------------------------------------
*/

export const updateUnderstandingCheck = async (
  sessionId,
  {
    question = "",
    options = [],
    correctAnswer = "",
    userAnswer = "",
    isCorrect = null,
    feedback = "",
    questionsAttempted = 0,
    questionsCorrect = 0,
    assessmentScore = null,
  } = {},
) => {
  if (!sessionId) {
    throw new Error("Session ID is required.");
  }

  return await api.patch(`/learning/session/${sessionId}/understanding-check`, {
    question,
    options,
    correctAnswer,
    userAnswer,
    isCorrect,
    feedback,
    questionsAttempted,
    questionsCorrect,
    assessmentScore,
  });
};

/*
|--------------------------------------------------------------------------
| UPDATE NEXT TOPIC RECOMMENDATION
|--------------------------------------------------------------------------
*/

export const updateNextTopicRecommendation = async (
  sessionId,
  { nextTopic = "", revisionRecommended = false, revisionReason = "" } = {},
) => {
  if (!sessionId) {
    throw new Error("Session ID is required.");
  }

  return await api.patch(`/learning/session/${sessionId}/next-topic`, {
    nextTopic,
    revisionRecommended,
    revisionReason,
  });
};

/*
|--------------------------------------------------------------------------
| UPDATE SESSION DURATION
|--------------------------------------------------------------------------
*/

export const updateLearningSessionDuration = async (
  sessionId,
  { durationSeconds = 0, durationMinutes = 0 } = {},
) => {
  if (!sessionId) {
    throw new Error("Session ID is required.");
  }

  return await api.patch(`/learning/session/${sessionId}/duration`, {
    durationSeconds: Math.max(0, Number(durationSeconds) || 0),
    durationMinutes: Math.max(0, Number(durationMinutes) || 0),
  });
};

/*
|--------------------------------------------------------------------------
| COMPLETE LEARNING SESSION
|--------------------------------------------------------------------------
*/

export const completeLearningSession = async (
  sessionId,
  topicCompleted = true,
) => {
  if (!sessionId) {
    throw new Error("Session ID is required.");
  }

  return await api.post(`/learning/session/${sessionId}/complete`, {
    topicCompleted: Boolean(topicCompleted),
  });
};

/*
|--------------------------------------------------------------------------
| ABANDON LEARNING SESSION
|--------------------------------------------------------------------------
*/

export const abandonLearningSession = async (sessionId) => {
  if (!sessionId) {
    throw new Error("Session ID is required.");
  }

  return await api.post(`/learning/session/${sessionId}/abandon`);
};

/*
|--------------------------------------------------------------------------
| LEARNING SESSION HISTORY
|--------------------------------------------------------------------------
*/

export const getLearningHistory = async ({ careerId, limit = 20 } = {}) => {
  return await api.get("/learning/sessions", {
    params: {
      careerId,
      limit,
    },
  });
};

/*
|--------------------------------------------------------------------------
| TOPIC STATISTICS
|--------------------------------------------------------------------------
*/

export const getTopicStatistics = async ({ careerId, topic } = {}) => {
  return await api.get("/learning/session/topic-stats", {
    params: {
      careerId,
      topic,
    },
  });
};

/*
|--------------------------------------------------------------------------
| LEARNING SESSION SUMMARY
|--------------------------------------------------------------------------
*/

export const getLearningSummary = async (careerId) => {
  if (!careerId) {
    throw new Error("Career ID is required.");
  }

  return await api.get("/learning/session/summary", {
    params: { careerId },
  });
};
