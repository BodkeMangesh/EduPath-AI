import api from "../api/axios";

export const getResources = async () => {
  return await api.get("/resources");
};
