import api from "../api/axios";

export const getRoadmap = async (careerId) => {
  return await api.get(`/roadmap?careerId=${careerId}`);
};
