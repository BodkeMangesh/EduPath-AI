const express = require("express");

const router = express.Router();

const careerController = require("../controllers/careerController");

const protect = require("../middleware/authMiddleware");

const validateRequest = require("../middleware/validateRequest");

const {
  validateCreateCareer,
  validateCreateCategory,
} = require("../validators/careerValidator");

// ============================
// Public Routes
// ============================

// Get all careers
router.get("/", careerController.getAllCareers);

// Search careers
router.get("/search", careerController.searchCareers);

// Get all categories
router.get("/categories", careerController.getCategories);

// Career statistics
router.get("/statistics", careerController.getStatistics);

// Get career details by slug
router.get("/:slug", careerController.getCareerBySlug);

// ============================
// Protected Admin/Management Routes
// ============================

// Create career category
router.post(
  "/category",
  protect,
  validateCreateCategory,
  validateRequest,
  careerController.createCategory,
);

// Create career
router.post(
  "/",
  protect,
  validateCreateCareer,
  validateRequest,
  careerController.createCareer,
);

// Update career
router.put(
  "/:id",
  protect,
  validateCreateCareer,
  validateRequest,
  careerController.updateCareer,
);

// Delete career
router.delete("/:id", protect, careerController.deleteCareer);

module.exports = router;
