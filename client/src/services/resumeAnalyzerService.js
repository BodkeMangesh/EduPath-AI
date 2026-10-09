import api from "../api/axios";

const getApiData = (response) => {
  return response?.data?.data ?? response?.data ?? {};
};

export const getResumeAnalysis = async () => {
  const response = await api.get(
    "/resume-analyzer",
  );

  return getApiData(response);
};

export const createResumeAnalysis =
  async () => {
    const response = await api.post(
      "/resume-analyzer",
    );

    return getApiData(response);
  };

export const analyzeResume = async () => {
  const response = await api.post(
    "/resume-analyzer/analyze",
  );

  return getApiData(response);
};

export const uploadResume = async (file) => {
  if (!file) {
    throw new Error(
      "Resume file is required.",
    );
  }

  const formData = new FormData();

  formData.append("resume", file);

  const response = await api.post(
    "/resume-analyzer/upload",
    formData,
  );

  return getApiData(response);
};

export const updateResumeInfo = async ({
  fileName,
  fileUrl,
  fileType,
  fileSize,
  uploaded,
}) => {
  const response = await api.patch(
    "/resume-analyzer/resume",
    {
      fileName,
      fileUrl,
      fileType,
      fileSize,
      uploaded,
    },
  );

  return getApiData(response);
};

export const updateResumeSuggestion =
  async (
    suggestionId,
    completed,
  ) => {
    if (!suggestionId) {
      throw new Error(
        "Suggestion ID is required.",
      );
    }

    const response = await api.patch(
      `/resume-analyzer/suggestions/${suggestionId}`,
      {
        completed,
      },
    );

    return getApiData(response);
  };