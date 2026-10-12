import api from "../api/axios";

export const register = (data) => {
  return api.post("/auth/register", data);
};

export const login = (data) => {
  return api.post("/auth/login", data);
};

export const getProfile = () => {
  return api.get("/users/me");
};

// Update Profile
export const updateProfile = (data) => {
  return api.put("/users/profile", data);
};

// Change Password
export const changePassword = (data) => {
  return api.put("/users/change-password", data);
};


 // Forgot Password
export const forgotPassword = (email) => {
  return api.post("/auth/forgot-password", { email });
};

// Reset Password
export const resetPassword = (data) => {
  return api.post("/auth/reset-password", data);
};
