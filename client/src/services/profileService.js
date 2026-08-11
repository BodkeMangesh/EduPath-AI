import api from "../api/axios";

export const getProfile = () => {
  return api.get("/users/me");
};

export const updateProfile = (data) => {
  return api.put("/users/profile", data);
};

export const changePassword = (data) => {
  return api.put("/users/change-password", data);
};
