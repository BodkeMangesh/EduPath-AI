import api from "../api/axios";

export const sendMessage = async ({ message, conversation = [] }) => {
  const response = await api.post("/chat", {
    message,
    conversation,
  });

  return response.data;
};
