const asyncHandler = require("../middleware/asyncHandler");

const Assessment = require("../models/Assessment");

const LearningProgressService = require("../services/LearningProgressService");

const CareerIntelligenceEngine = require("../intelligence/CareerIntelligenceEngine");

const ResourceRecommendationEngine = require("../intelligence/algorithms/ResourceRecommendationEngine");

exports.getResources = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // ------------------------------------------
  // Get latest completed assessment
  // ------------------------------------------

  const assessment = await Assessment.findOne({
    user: userId,
    status: "completed",
  }).sort({
    completedAt: -1,
  });

  if (!assessment) {
    return res.status(404).json({
      success: false,
      message: "Completed assessment not found.",
    });
  }

  // ------------------------------------------
  // Analyze career
  // ------------------------------------------

  const careerAnalysis = await CareerIntelligenceEngine.analyze(assessment);

  const recommendedCareer =
    careerAnalysis?.careerAnalysis?.recommendedCareer ||
    careerAnalysis?.recommendedCareer;

  if (!recommendedCareer) {
    console.log(
      "Career Intelligence Result:",
      JSON.stringify(careerAnalysis, null, 2),
    );

    return res.status(404).json({
      success: false,
      message: "Recommended career not found.",
    });
  }

  const careerId = recommendedCareer.careerId;

  // ------------------------------------------
  // Get actual learning progress
  // ------------------------------------------

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

  // ------------------------------------------
  // Generate personalized resources
  // ------------------------------------------

  const resources = await ResourceRecommendationEngine.recommend(
    assessment,
    careerAnalysis,
    learningProgress,
  );

  // ------------------------------------------
  // Response
  // ------------------------------------------

  return res.status(200).json({
    success: true,

    message: "Personalized resources retrieved successfully.",

    data: {
      career: recommendedCareer.title || recommendedCareer.careerId,

      currentPhase: learningProgress.currentPhase,

      overallCompletion: learningProgress.overallCompletion,

      nextTopic: learningProgress.pendingTopics?.[0] || null,

      resources,
    },
  });
});
