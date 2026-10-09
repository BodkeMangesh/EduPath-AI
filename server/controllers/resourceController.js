const asyncHandler = require("../middleware/asyncHandler");

const User = require("../models/User");
const LearningProgressService = require("../services/LearningProgressService");

const ResourceRecommendationEngine = require("../intelligence/algorithms/ResourceRecommendationEngine");

exports.getResources = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // ==========================================================
  // GET REQUEST CONTEXT
  // ==========================================================

  const requestedCareerId = req.query.careerId?.trim() || "";
  const requestedPhase = Number(req.query.phase) || null;
  const requestedTopic = req.query.topic?.trim() || "";

  // ==========================================================
  // GET USER
  // ==========================================================

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found.",
    });
  }

  // ==========================================================
  // RESOLVE CAREER ID
  // ==========================================================

  let careerId = requestedCareerId;

  /*

* If careerId is not supplied by the frontend,
* try to get it from the user's profile/onboarding data.
*
* This keeps Resources usable after page refresh/direct access.
  */

  if (!careerId) {
    careerId =
      user?.selectedCareer ||
      user?.profile?.careerId ||
      user?.careerId ||
      user?.selectedCareerId ||
      user?.aiProfile?.careerId ||
      "";
  }

  if (!careerId) {
    return res.status(400).json({
      success: false,
      message: "Career information is missing. Please select a career first.",
    });
  }

  // ==========================================================
  // GET LEARNING PROGRESS
  // ==========================================================

  const learningProgress = await LearningProgressService.getProgress(
    userId,
    careerId,
  );

  if (!learningProgress) {
    return res.status(404).json({
      success: false,
      message: "Learning progress not found.",
    });
  }

  // ==========================================================
  // CURRENT PHASE
  // ==========================================================

  const currentPhase =
    requestedPhase || Number(learningProgress.currentPhase) || 1;

  // ==========================================================
  // CURRENT TOPIC
  // ==========================================================

  const currentTopic =
    requestedTopic ||
    learningProgress.pendingTopics?.[0] ||
    learningProgress.nextTopic ||
    null;

  // ==========================================================
  // GENERATE PERSONALIZED RESOURCES
  // ==========================================================

  /*

* ResourceRecommendationEngine expects career information
* and learning progress.
*
* No Assessment dependency is required here.
  */

  const careerAnalysis = {
    recommendedCareer: {
      careerId,
      id: careerId,
      title: user?.profile?.careerTitle || careerId,
      careerTitle: user?.profile?.careerTitle || careerId,
    },
  };

  const resources = await ResourceRecommendationEngine.recommend(
    user,
    careerAnalysis,
    {
      ...(learningProgress.toObject?.() || learningProgress),
      currentPhase,
      currentTopic,
      nextTopic: currentTopic,
    },
  );

  // ==========================================================
  // VALIDATE RESOURCE RESPONSE
  // ==========================================================

  if (!resources || resources.error) {
    return res.status(500).json({
      success: false,
      message:
        resources?.message || "Resource generation returned invalid data.",
    });
  }

  // ==========================================================
  // RESPONSE
  // ==========================================================

  return res.status(200).json({
    success: true,

    message: "Personalized resources retrieved successfully.",

    data: {
      career: careerAnalysis.recommendedCareer.title,

      careerId,

      currentPhase,

      overallCompletion: Number(learningProgress.overallCompletion) || 0,

      nextTopic: resources.nextTopic || currentTopic,

      currentTopic: currentTopic,

      resources: {
        nextTopic: resources.nextTopic || currentTopic,

        objectives: resources.objectives || {},

        youtube: Array.isArray(resources.youtube) ? resources.youtube : [],

        documentation: Array.isArray(resources.documentation)
          ? resources.documentation
          : [],

        articles: Array.isArray(resources.articles) ? resources.articles : [],

        practice: Array.isArray(resources.practice) ? resources.practice : [],

        projects: Array.isArray(resources.projects) ? resources.projects : [],

        revision: Array.isArray(resources.revision) ? resources.revision : [],
      },
    },
  });
});
