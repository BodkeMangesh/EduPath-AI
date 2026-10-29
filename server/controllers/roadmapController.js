const asyncHandler = require("../middleware/asyncHandler");
const RoadmapService = require("../services/roadmapService");

/**
 * ============================================================
 * GET USER ROADMAP
 * ============================================================
 *
 * GET /api/v1/roadmap?careerId=python-developer
 *
 * Returns personalized roadmap based on:
 *
 * - User onboarding
 * - Selected career
 * - Learning profile
 * - Learning progress
 * - Career knowledge base
 */
exports.getRoadmap = asyncHandler(async (req, res) => {
  // ==========================================================
  // USER
  // ==========================================================

  const userId = req.user?._id || req.user?.id;

  // ==========================================================
  // CAREER
  // ==========================================================

  const { careerId } = req.query;

  // ==========================================================
  // VALIDATION
  // ==========================================================

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "User authentication is required.",
    });
  }

  if (!careerId) {
    return res.status(400).json({
      success: false,
      message: "Career ID is required.",
    });
  }

  // ==========================================================
  // GET ROADMAP
  // ==========================================================

  const roadmap = await RoadmapService.getRoadmap(
    userId,
    careerId,
  );

  // ==========================================================
  // RESPONSE
  // ==========================================================

  return res.status(200).json({
    success: true,

    message: "Roadmap retrieved successfully.",

    data: roadmap,
  });
});