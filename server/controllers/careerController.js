const CareerService = require("../services/CareerService");
const asyncHandler = require("../middleware/asyncHandler");

const { successResponse } = require("../utils/responseHandler");
/**
 * GET /api/v1/careers
 */
exports.getAllCareers = asyncHandler(async (req, res) => {
  const careers = await CareerService.getAllCareers(req.query);

  successResponse(res, 200, "Careers fetched successfully.", careers);
});

/**
 * GET /api/v1/careers/:slug
 */
exports.getCareerBySlug = asyncHandler(async (req, res) => {
  const career = await CareerService.getCareerBySlug(req.params.slug);

  successResponse(res, 200, "Career fetched successfully.", career);
});

/**
 * GET /api/v1/careers/search
 */
exports.searchCareers = asyncHandler(async (req, res) => {
  const { keyword } = req.query;

  const careers = await CareerService.searchCareers(keyword);

  successResponse(res, 200, "Careers searched successfully.", careers);
});

/**
 * GET /api/v1/careers/categories
 */
exports.getCategories = asyncHandler(async (req, res) => {
  const categories = await CareerService.getCategories();

  return successResponse(
    res,
    200,
    "Categories fetched successfully.",
    categories,
  );
});

/**
 * GET /api/v1/careers/statistics
 */
exports.getStatistics = asyncHandler(async (req, res) => {
  const statistics = await CareerService.getStatistics();

  return successResponse(
    res,
    200,
    "Statistics fetched successfully.",
    statistics,
  );
});

exports.createCareer = asyncHandler(async (req, res) => {
  const career = await CareerService.createCareer(req.body);

  return successResponse(res, 201, "Career created successfully.", career);
});

exports.createCategory = asyncHandler(async (req, res) => {
  const category = await CareerService.createCategory(req.body);

  return successResponse(
    res,
    201,
    "Career category created successfully.",
    category,
  );
});

exports.updateCareer = asyncHandler(async (req, res) => {
  const career = await CareerService.updateCareer(req.params.id, req.body);

  return successResponse(res, 200, "Career updated successfully.", career);
});

exports.deleteCareer = asyncHandler(async (req, res) => {
  await CareerService.deleteCareer(req.params.id);

  return successResponse(res, 200, "Career deleted successfully.", null);
});

exports.someMethod = asyncHandler(async (req, res) => {
  const data = await CareerService.someMethod();

  return successResponse(res, 200, "Success message.", data);
});
