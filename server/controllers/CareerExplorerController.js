const CareerExplorerService = require("../services/CareerExploreService");
const asyncHandler = require("../middleware/asyncHandler");
const { successResponse } = require("../utils/responseHandler");

/**
 * GET /api/v1/career-explorer
 *
 * Get the complete Career Explorer profile for the
 * currently authenticated user.
 *
 * Optional query:
 * ?careerId=backend-developer
 * ?limit=5
 */
exports.getExplorerProfile = asyncHandler(async (req, res) => {
  const { careerId, limit } = req.query;

  const data = await CareerExplorerService.getExplorerProfile(req.user._id, {
    careerId,
    limit,
  });

  return successResponse(
    res,
    200,
    "Career Explorer data fetched successfully.",
    data,
  );
});

/**
 * GET /api/v1/career-explorer/recommendations
 *
 * Get personalized career recommendations.
 *
 * Optional query:
 * ?limit=5
 */
exports.getRecommendedCareers = asyncHandler(async (req, res) => {
  const { limit } = req.query;

  const recommendations = await CareerExplorerService.getRecommendedCareers(
    req.user._id,
    {
      limit,
    },
  );

  return successResponse(
    res,
    200,
    "Career recommendations fetched successfully.",
    recommendations,
  );
});

/**
 * GET /api/v1/career-explorer/skill-gap/:careerId
 *
 * Get user's skill gap for a specific career.
 */
exports.getSkillGap = asyncHandler(async (req, res) => {
  const { careerId } = req.params;

  const data = await CareerExplorerService.getSkillGap(req.user._id, careerId);

  return successResponse(
    res,
    200,
    "Career skill gap fetched successfully.",
    data,
  );
});

/**
 * GET /api/v1/career-explorer/career/:careerId
 *
 * Get detailed career information along with:
 * - Career match
 * - Skill gap
 * - Readiness
 * - Roadmap progress
 * - Next action
 */
exports.getCareerDetails = asyncHandler(async (req, res) => {
  const { careerId } = req.params;

  const data = await CareerExplorerService.getCareerDetails(
    req.user._id,
    careerId,
  );

  return successResponse(
    res,
    200,
    "Career details fetched successfully.",
    data,
  );
});
