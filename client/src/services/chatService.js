import api from "../api/axios";

export const sendMessage = async ({ message, careerId }) => {
  const response = await api.post("/chat", {
    message,
    careerId,
  });

  return response.data;
};
