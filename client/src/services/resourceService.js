import api from "../api/axios";

/*
|--------------------------------------------------------------------------
| Get Personalized Resources
|--------------------------------------------------------------------------
|
| Resources are generated from:
|
| User Profile
| + Onboarding Data
| + Roadmap
| + Current Phase
| + Current Topic
|
|--------------------------------------------------------------------------
*/

export const getResources = async ({ careerId, phase, topic }) => {
  // ==========================================================
  // VALIDATION
  // ==========================================================

  if (!careerId) {
    throw new Error("Career ID is required.");
  }

  if (!phase) {
    throw new Error("Phase is required.");
  }

  if (!topic) {
    throw new Error("Topic is required.");
  }

  // ==========================================================
  // API REQUEST
  // ==========================================================

  const response = await api.get("/resources", {
    params: {
      careerId,
      phase,
      topic,
    },
  });

  // ==========================================================
  // RETURN API DATA
  // ==========================================================

  return response.data;
};
