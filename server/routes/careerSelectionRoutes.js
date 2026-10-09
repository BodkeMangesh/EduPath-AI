const express = require("express");

const careerSelectionController = require("../controllers/CareerSelectionController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Career Selection Routes
|--------------------------------------------------------------------------
| All career-selection routes require an authenticated user.
|--------------------------------------------------------------------------
*/

// Get current career selection / selection details
router.get("/", protect, careerSelectionController.getCareerSelection);

// Get recommended career options
router.get("/options", protect, careerSelectionController.getCareerOptions);

// Select a career
router.post("/select", protect, careerSelectionController.selectCareer);

// Change selected career
router.patch("/change", protect, careerSelectionController.changeCareer);

module.exports = router;
