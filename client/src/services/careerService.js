import api from "../api/axios";

/**
 * Get all careers
 */
export const getCareers = (params = {}) => {
  return api.get("/careers", { params });
};

/**
 * Search careers
 */
export const searchCareers = (keyword) => {
  return api.get("/careers/search", {
    params: { keyword },
  });
};

/**
 * Get career by slug
 */
export const getCareerBySlug = (slug) => {
  return api.get(`/careers/${slug}`);
};

/**
 * Get categories
 */
export const getCategories = () => {
  return api.get("/careers/categories");
};

/**
 * Get statistics
 */
export const getStatistics = () => {
  return api.get("/careers/statistics");
};

/**
 * Select career
 */
export const selectCareer = (careerId) => {
  return api.post("/users/select-career", {
    careerId,
  });
};
