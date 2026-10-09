import api from "../api/axios";

export const getLearningProgress = async (careerId) => {
  if (!careerId) throw new Error("Career ID is required.");

  return await api.get("/learning/progress", {
    params: { careerId },
  });
};

export const completeTopic = async (careerId, topic) => {
  if (!careerId) throw new Error("Career ID is required.");
  if (!topic) throw new Error("Topic is required.");

  return await api.post("/learning/complete-topic", {
    careerId,
    topic,
  });
};

export const completeTodayPlan = async (careerId) => {
  if (!careerId) throw new Error("Career ID is required.");

  return await api.post("/learning/complete-today", {
    careerId,
  });
};

export const getLearningResources = async ({ careerId, phase, topic } = {}) => {
  return await api.get("/resources", {
    params: {
      careerId,
      phase,
      topic,
    },
  });
};

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
  if (!careerId) throw new Error("Career ID is required.");
  if (!topic) throw new Error("Topic is required.");

  return await api.post("/learning/session/start", {
    careerId,
    phase,
    phaseTitle,
    topic,
    type,
    plannedDurationMinutes,
    learningStyle,
    resourceTitle,
    resourceProvider,
    resourceUrl,
    source,
  });
};

export const getLearningSession = async (sessionId) => {
  if (!sessionId) throw new Error("Session ID is required.");

  return await api.get(`/learning/session/${sessionId}`);
};

export const getActiveLearningSession = async ({ careerId, topic } = {}) => {
  if (!careerId) throw new Error("Career ID is required.");

  return await api.get("/learning/session/active", {
    params: {
      careerId,
      topic,
    },
  });
};

export const pauseLearningSession = async (sessionId) => {
  if (!sessionId) throw new Error("Session ID is required.");

  return await api.post(`/learning/session/${sessionId}/pause`);
};

export const resumeLearningSession = async (sessionId) => {
  if (!sessionId) throw new Error("Session ID is required.");

  return await api.post(`/learning/session/${sessionId}/resume`);
};

export const updateLearningSessionProgress = async (sessionId, progress) => {
  if (!sessionId) throw new Error("Session ID is required.");

  const normalizedProgress = Math.min(100, Math.max(0, Number(progress) || 0));

  return await api.patch(`/learning/session/${sessionId}/progress`, {
    progress: normalizedProgress,
  });
};

export const updateLearningSessionNotes = async (sessionId, notes) => {
  if (!sessionId) throw new Error("Session ID is required.");

  return await api.patch(`/learning/session/${sessionId}/notes`, {
    notes: String(notes || "").slice(0, 2000),
  });
};

export const updateLearningIntelligence = async (
  sessionId,
  intelligence = {},
) => {
  if (!sessionId) throw new Error("Session ID is required.");

  return await api.patch(
    `/learning/session/${sessionId}/intelligence`,
    intelligence,
  );
};

export const updateUnderstandingCheck = async (sessionId, checkData = {}) => {
  if (!sessionId) throw new Error("Session ID is required.");

  return await api.post(
    `/learning/session/${sessionId}/understanding-check`,
    checkData,
  );
};

export const updateNextTopicRecommendation = async (
  sessionId,
  { nextTopic = "", revisionRecommended = false, revisionReason = "" } = {},
) => {
  if (!sessionId) throw new Error("Session ID is required.");

  return await api.patch(`/learning/session/${sessionId}/next-topic`, {
    nextTopic,
    revisionRecommended,
    revisionReason,
  });
};

export const updateLearningSessionDuration = async (sessionId) => {
  if (!sessionId) throw new Error("Session ID is required.");

  return await api.patch(`/learning/session/${sessionId}/duration`);
};

export const completeLearningSession = async (
  sessionId,
  topicCompleted = true,
) => {
  if (!sessionId) throw new Error("Session ID is required.");

  return await api.post(`/learning/session/${sessionId}/complete`, {
    topicCompleted: Boolean(topicCompleted),
  });
};

export const abandonLearningSession = async (sessionId) => {
  if (!sessionId) throw new Error("Session ID is required.");

  return await api.post(`/learning/session/${sessionId}/abandon`);
};

export const getLearningHistory = async ({ careerId, limit = 20 } = {}) => {
  return await api.get("/learning/sessions", {
    params: {
      careerId,
      limit,
    },
  });
};

export const getTopicStatistics = async ({ careerId, topic } = {}) => {
  return await api.get("/learning/session/topic-stats", {
    params: {
      careerId,
      topic,
    },
  });
};

export const getLearningSummary = async (careerId) => {
  if (!careerId) throw new Error("Career ID is required.");

  return await api.get("/learning/session/summary", {
    params: {
      careerId,
    },
  });
};
