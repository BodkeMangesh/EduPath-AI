import api from "../api/axios";

export const getProgress = (careerId) =>
  api.get(`/learning/progress?careerId=${careerId}`);
