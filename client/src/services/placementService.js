import api from "../api/axios";

/**
 * ---------------------------------------------------------
 * Helper: Extract API data
 * ---------------------------------------------------------
 */
const getApiData = (response) => {
  return response?.data?.data ?? response?.data ?? {};
};

/**
 * ---------------------------------------------------------
 * GET PLACEMENT DASHBOARD
 * ---------------------------------------------------------
 */
export const getPlacement = async () => {
  const response = await api.get("/placement");

  return getApiData(response);
};

/**
 * ---------------------------------------------------------
 * CREATE PLACEMENT PROFILE
 * ---------------------------------------------------------
 */
export const createPlacementProfile = async () => {
  const response = await api.post("/placement");

  return getApiData(response);
};

/**
 * ---------------------------------------------------------
 * UPDATE TARGET ROLE / DREAM COMPANY
 * ---------------------------------------------------------
 */
export const updatePlacementTarget = async ({ targetRole, dreamCompany }) => {
  const response = await api.patch("/placement/target", {
    targetRole,
    dreamCompany,
  });

  return getApiData(response);
};

/**
 * ---------------------------------------------------------
 * UPDATE DSA
 * ---------------------------------------------------------
 */
export const updatePlacementDsa = async ({
  level,
  questionsSolved,
  topicsCompleted,
}) => {
  const response = await api.patch("/placement/dsa", {
    level,
    questionsSolved,
    topicsCompleted,
  });

  return getApiData(response);
};

/**
 * ---------------------------------------------------------
 * UPDATE RESUME
 * ---------------------------------------------------------
 */
export const updatePlacementResume = async ({ uploaded, score }) => {
  const response = await api.patch("/placement/resume", {
    uploaded,
    score,
  });

  return getApiData(response);
};

/**
 * ---------------------------------------------------------
 * UPDATE INTERVIEW
 * ---------------------------------------------------------
 */
export const updatePlacementInterview = async ({
  mockInterviews,
  completed,
  lastScore,
}) => {
  const response = await api.patch("/placement/interview", {
    mockInterviews,
    completed,
    lastScore,
  });

  return getApiData(response);
};

/**
 * ---------------------------------------------------------
 * UPDATE CHECKLIST ITEM
 * ---------------------------------------------------------
 */
export const updatePlacementChecklistItem = async (checklistId, completed) => {
  if (!checklistId) {
    throw new Error("Checklist ID is required.");
  }

  const response = await api.patch(`/placement/checklist/${checklistId}`, {
    completed,
  });

  return getApiData(response);
};
