import api from "../api/axios";

export const getDashboard = async () => {
  const response = await api.get("/dashboard");

  return response.data.data;
};

export const completeTopic = async (careerId, topic) => {
  const response = await api.post("/learning/complete-topic", {
    careerId,
    topic,
  });

  return response.data;
};

export const saveStudySession = async (sessionData) => {
  const response = await api.post("/study-session/save-session", sessionData);

  return response.data;
};
