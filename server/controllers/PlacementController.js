const asyncHandler = require("../middleware/asyncHandler");
const PlacementService = require("../services/PlacementService");

/**
 * ---------------------------------------------------------
 * GET PLACEMENT DASHBOARD
 * ---------------------------------------------------------
 * GET /api/v1/placement
 */
exports.getPlacement = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "User authentication is required.",
    });
  }

  const placement = await PlacementService.getPlacement(userId);

  return res.status(200).json({
    success: true,
    message: "Placement dashboard retrieved successfully.",
    data: placement,
  });
});

/**
 * ---------------------------------------------------------
 * CREATE PLACEMENT PROFILE
 * ---------------------------------------------------------
 * POST /api/v1/placement
 */
exports.createPlacementProfile = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "User authentication is required.",
    });
  }

  const placement = await PlacementService.createPlacementProfile(userId);

  return res.status(201).json({
    success: true,
    message: "Placement profile created successfully.",
    data: placement,
  });
});

/**
 * ---------------------------------------------------------
 * UPDATE TARGET ROLE / DREAM COMPANY
 * ---------------------------------------------------------
 * PATCH /api/v1/placement/target
 */
exports.updateTarget = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "User authentication is required.",
    });
  }

  const { targetRole, dreamCompany } = req.body || {};

  const placement = await PlacementService.updateTarget(userId, {
    targetRole,
    dreamCompany,
  });

  return res.status(200).json({
    success: true,
    message: "Placement target updated successfully.",
    data: placement,
  });
});

/**
 * ---------------------------------------------------------
 * UPDATE DSA
 * ---------------------------------------------------------
 * PATCH /api/v1/placement/dsa
 */
exports.updateDsa = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "User authentication is required.",
    });
  }

  const { level, questionsSolved, topicsCompleted } = req.body || {};

  const placement = await PlacementService.updateDsa(userId, {
    level,
    questionsSolved,
    topicsCompleted,
  });

  return res.status(200).json({
    success: true,
    message: "DSA readiness updated successfully.",
    data: placement,
  });
});

/**
 * ---------------------------------------------------------
 * UPDATE RESUME
 * ---------------------------------------------------------
 * PATCH /api/v1/placement/resume
 */
exports.updateResume = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "User authentication is required.",
    });
  }

  const { uploaded, score } = req.body || {};

  const placement = await PlacementService.updateResume(userId, {
    uploaded,
    score,
  });

  return res.status(200).json({
    success: true,
    message: "Resume readiness updated successfully.",
    data: placement,
  });
});

/**
 * ---------------------------------------------------------
 * UPDATE INTERVIEW
 * ---------------------------------------------------------
 * PATCH /api/v1/placement/interview
 */
exports.updateInterview = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "User authentication is required.",
    });
  }

  const { mockInterviews, completed, lastScore } = req.body || {};

  const placement = await PlacementService.updateInterview(userId, {
    mockInterviews,
    completed,
    lastScore,
  });

  return res.status(200).json({
    success: true,
    message: "Interview readiness updated successfully.",
    data: placement,
  });
});

/**
 * ---------------------------------------------------------
 * UPDATE CHECKLIST ITEM
 * ---------------------------------------------------------
 * PATCH /api/v1/placement/checklist/:checklistId
 */
exports.updateChecklistItem = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "User authentication is required.",
    });
  }

  const { checklistId } = req.params;
  const { completed } = req.body || {};

  if (!checklistId) {
    return res.status(400).json({
      success: false,
      message: "Checklist ID is required.",
    });
  }

  const item = await PlacementService.updateChecklistItem(
    userId,
    checklistId,
    completed,
  );

  return res.status(200).json({
    success: true,
    message: "Checklist item updated successfully.",
    data: item,
  });
});
