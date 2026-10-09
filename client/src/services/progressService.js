import api from "../api/axios";

/*
|--------------------------------------------------------------------------
| BASIC PROGRESS
|--------------------------------------------------------------------------
*/

export const getProgress = async (careerId) => {
  if (!careerId) {
    throw new Error("Career ID is required.");
  }

  return await api.get("/learning-progress", {
    params: { careerId },
  });
};

/*
|--------------------------------------------------------------------------
| COMPLETE PROGRESS DASHBOARD
|--------------------------------------------------------------------------
| Returns:
| - overview
| - session analytics
| - topic analytics
| - learning quality
| - activity
| - insights
| - forecast
*/

export const getProgressDashboard = async (careerId) => {
  if (!careerId) {
    throw new Error("Career ID is required.");
  }

  return await api.get("/learning-progress/dashboard", {
    params: { careerId },
  });
};

/*
|--------------------------------------------------------------------------
| PROGRESS OVERVIEW
|--------------------------------------------------------------------------
*/

export const getProgressOverview = async (careerId) => {
  if (!careerId) {
    throw new Error("Career ID is required.");
  }

  return await api.get("/learning-progress/overview", {
    params: { careerId },
  });
};

/*
|--------------------------------------------------------------------------
| SESSION ANALYTICS
|--------------------------------------------------------------------------
*/

export const getProgressSessions = async (careerId) => {
  if (!careerId) {
    throw new Error("Career ID is required.");
  }

  return await api.get("/learning-progress/sessions", {
    params: { careerId },
  });
};

/*
|--------------------------------------------------------------------------
| TOPIC ANALYTICS
|--------------------------------------------------------------------------
*/

export const getProgressTopics = async (careerId) => {
  if (!careerId) {
    throw new Error("Career ID is required.");
  }

  return await api.get("/learning-progress/topics", {
    params: { careerId },
  });
};

/*
|--------------------------------------------------------------------------
| LEARNING QUALITY
|--------------------------------------------------------------------------
*/

export const getProgressQuality = async (careerId) => {
  if (!careerId) {
    throw new Error("Career ID is required.");
  }

  return await api.get("/learning-progress/quality", {
    params: { careerId },
  });
};

/*
|--------------------------------------------------------------------------
| LEARNING ACTIVITY
|--------------------------------------------------------------------------
| days:
| 7   → weekly activity
| 30  → monthly activity
| 90  → quarterly activity
| 365 → yearly activity
*/

export const getProgressActivity = async (careerId, days = 30) => {
  if (!careerId) {
    throw new Error("Career ID is required.");
  }

  const normalizedDays = Number(days);

  if (
    !Number.isFinite(normalizedDays) ||
    normalizedDays < 7 ||
    normalizedDays > 365
  ) {
    throw new Error("Days must be between 7 and 365.");
  }

  return await api.get("/learning-progress/activity", {
    params: {
      careerId,
      days: normalizedDays,
    },
  });
};

/*
|--------------------------------------------------------------------------
| PROGRESS INSIGHTS
|--------------------------------------------------------------------------
*/

export const getProgressInsights = async (careerId) => {
  if (!careerId) {
    throw new Error("Career ID is required.");
  }

  return await api.get("/learning-progress/insights", {
    params: { careerId },
  });
};

/*
|--------------------------------------------------------------------------
| LEARNING FORECAST
|--------------------------------------------------------------------------
*/

export const getLearningForecast = async (careerId) => {
  if (!careerId) {
    throw new Error("Career ID is required.");
  }

  return await api.get("/learning-progress/forecast", {
    params: { careerId },
  });
};

/*
|--------------------------------------------------------------------------
| COMPLETE TOPIC
|--------------------------------------------------------------------------
*/

export const completeProgressTopic = async (careerId, topic) => {
  if (!careerId) {
    throw new Error("Career ID is required.");
  }

  if (!topic) {
    throw new Error("Topic is required.");
  }

  return await api.post("/learning-progress/complete-topic", {
    careerId,
    topic,
  });
};

/*
|--------------------------------------------------------------------------
| COMPLETE TODAY'S PLAN
|--------------------------------------------------------------------------
*/

export const completeTodayProgress = async (careerId) => {
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

export const updateProgressStudyHours = async (careerId, hours) => {
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

export const updateProgressStreak = async (careerId) => {
  if (!careerId) {
    throw new Error("Career ID is required.");
  }

  return await api.patch("/learning-progress/streak", {
    careerId,
  });
};
