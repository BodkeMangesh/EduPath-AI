import api from "../api/axios";

/**
 * Career Explorer Service
 *
 * Handles all Career Explorer API communication.
 *
 * Backend Base Route:
 * /api/v1/career-explorer
 */

/**
 * Get Career Explorer profile
 *
 * Returns:
 * - User profile snapshot
 * - Selected career information
 * - Career match
 * - Readiness
 * - Roadmap progress
 * - Next action
 * - Recommendations when no career is selected
 *
 * @param {Object} params
 * @param {string} params.careerId - Optional career ID
 * @param {number} params.limit - Optional recommendation limit
 */
export const getExplorerProfile = async ({ careerId, limit } = {}) => {
  try {
    const params = {};

    if (careerId) {
      params.careerId = careerId;
    }

    if (limit) {
      params.limit = limit;
    }

    const response = await api.get("/career-explorer", {
      params,
    });

    return response.data;
  } catch (error) {
    console.error(
      "Career Explorer Profile Error:",
      error?.response?.data || error.message,
    );

    throw error;
  }
};

/**
 * Get personalized career recommendations
 *
 * @param {number} limit - Number of recommendations to fetch
 */
export const getRecommendedCareers = async (limit = 5) => {
  try {
    const response = await api.get("/career-explorer/recommendations", {
      params: {
        limit,
      },
    });

    return response.data;
  } catch (error) {
    console.error(
      "Career Recommendations Error:",
      error?.response?.data || error.message,
    );

    throw error;
  }
};

/**
 * Get skill gap for a specific career
 *
 * @param {string} careerId - Career MongoDB ID
 */
export const getSkillGap = async (careerId) => {
  if (!careerId) {
    throw new Error("Career ID is required.");
  }

  try {
    const response = await api.get(`/career-explorer/skill-gap/${careerId}`);

    return response.data;
  } catch (error) {
    console.error(
      "Career Skill Gap Error:",
      error?.response?.data || error.message,
    );

    throw error;
  }
};

/**
 * Get detailed information for a specific career
 *
 * @param {string} careerId - Career MongoDB ID
 */
export const getCareerDetails = async (careerId) => {
  if (!careerId) {
    throw new Error("Career ID is required.");
  }

  try {
    const response = await api.get(`/career-explorer/career/${careerId}`);

    return response.data;
  } catch (error) {
    console.error(
      "Career Details Error:",
      error?.response?.data || error.message,
    );

    throw error;
  }
};

/**
 * Get complete Career Explorer data
 *
 * Useful when the page needs both profile
 * and recommendations.
 */
export const getCareerExplorerData = async ({ careerId, limit = 5 } = {}) => {
  try {
    const response = await getExplorerProfile({
      careerId,
      limit,
    });

    return response;
  } catch (error) {
    console.error(
      "Career Explorer Data Error:",
      error?.response?.data || error.message,
    );

    throw error;
  }
};

export default {
  getExplorerProfile,
  getRecommendedCareers,
  getSkillGap,
  getCareerDetails,
  getCareerExplorerData,
};
