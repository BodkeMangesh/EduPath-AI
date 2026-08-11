import api from "../api/axios";

/**
 * Get learning progress
 */
export const getLearningProgress = async (careerId) => {
  console.log("Learning API careerId:", careerId);
  return await api.get("/learning/progress", {
    params: {
      careerId,
    },
  });
};

/**
 * Complete a learning topic
 */
export const completeTopic = async (careerId, topic) => {
  return await api.post("/learning/complete-topic", {
    careerId,
    topic,
  });
};

/**
 * Complete today's learning plan
 */
export const completeTodayPlan = async (careerId) => {
  return await api.post("/learning/complete-today", {
    careerId,
  });
};
