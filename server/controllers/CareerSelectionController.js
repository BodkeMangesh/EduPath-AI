const CareerSelectionService = require("../services/CareerSelectionService");
const asyncHandler = require("../middleware/asyncHandler");
const { successResponse } = require("../utils/responseHandler");

exports.getCareerSelection = asyncHandler(async (req, res) => {
  const { careerId } = req.query;

  const data = await CareerSelectionService.getCareerSelection(
    req.user._id,
    careerId || null,
  );

  return successResponse(
    res,
    200,
    "Career selection data fetched successfully.",
    data,
  );
});

exports.selectCareer = asyncHandler(async (req, res) => {
  const { careerId } = req.body;

  if (!careerId) {
    return res.status(400).json({
      success: false,
      message: "Career ID is required.",
    });
  }

  const data = await CareerSelectionService.selectCareer(
    req.user._id,
    careerId,
  );

  return successResponse(res, 200, "Career selected successfully.", data);
});

exports.changeCareer = asyncHandler(async (req, res) => {
  const { careerId } = req.body;

  if (!careerId) {
    return res.status(400).json({
      success: false,
      message: "Career ID is required.",
    });
  }

  const data = await CareerSelectionService.changeCareer(
    req.user._id,
    careerId,
  );

  return successResponse(res, 200, "Career changed successfully.", data);
});

exports.getCareerOptions = asyncHandler(async (req, res) => {
  const { limit } = req.query;

  const data = await CareerSelectionService.getAvailableCareerOptions(
    req.user._id,
    limit,
  );

  return successResponse(
    res,
    200,
    "Career options fetched successfully.",
    data,
  );
});
