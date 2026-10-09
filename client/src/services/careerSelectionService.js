import api from "../api/axios";

/*
|--------------------------------------------------------------------------
| Career Selection Service
|--------------------------------------------------------------------------
| Handles all frontend API communication related to Career Selection.
|
| Backend routes:
| GET   /api/v1/career-selection
| GET   /api/v1/career-selection/options
| POST  /api/v1/career-selection/select
| PATCH /api/v1/career-selection/change
|--------------------------------------------------------------------------
*/

/**
 * Get current career selection data.
 *
 * If careerId is provided, the backend returns selection
 * information for that specific career.
 *
 * @param {string|null} careerId
 * @returns {Promise<Object>}
 */
export const getCareerSelection = async (careerId = null) => {
  const params = {};

  if (careerId) {
    params.careerId = careerId;
  }

  const response = await api.get("/career-selection", {
    params,
  });

  return response.data;
};

/**
 * Get recommended career options.
 *
 * @param {number} limit
 * @returns {Promise<Object>}
 */
export const getCareerOptions = async (limit = 5) => {
  const response = await api.get("/career-selection/options", {
    params: {
      limit,
    },
  });

  return response.data;
};

/**
 * Select a career for the current user.
 *
 * @param {string} careerId
 * @returns {Promise<Object>}
 */
export const selectCareer = async (careerId) => {
  if (!careerId) {
    throw new Error("Career ID is required.");
  }

  const response = await api.post("/career-selection/select", {
    careerId,
  });

  return response.data;
};

/**
 * Change the user's currently selected career.
 *
 * @param {string} careerId
 * @returns {Promise<Object>}
 */
export const changeCareer = async (careerId) => {
  if (!careerId) {
    throw new Error("Career ID is required.");
  }

  const response = await api.patch("/career-selection/change", {
    careerId,
  });

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Default Service Object
|--------------------------------------------------------------------------
| Provides a single object that can be imported when preferred.
|--------------------------------------------------------------------------
*/

const careerSelectionService = {
  getCareerSelection,
  getCareerOptions,
  selectCareer,
  changeCareer,
};

export default careerSelectionService;
