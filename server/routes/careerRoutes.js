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

// Career Details
router.get("/:slug", careerController.getCareerBySlug);

router.post("/category", validateRequest, careerController.createCategory);

router.post("/", validateRequest, careerController.createCareer);

router.put("/:id", validateRequest,  careerController.updateCareer);

router.delete("/:id", validateRequest, careerController.deleteCareer);

module.exports = router;
