import api from "../api/axios";

export const getDashboard = async (careerId) => {
  const response = await api.get("/dashboard", {
    params: { careerId },
  });

  return response.data.data;
};

export const completeTopic = async (topic, careerId) => {
  const response = await api.post("/learning/complete-topic", {
    topic,
    careerId,
  });

  return response.data;
};

export const saveStudySession = async (sessionData) => {
  const response = await api.post("/study-session/save-session", sessionData);

  return response.data;
};
