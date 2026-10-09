const express = require("express");

const careerExplorerController = require("../controllers/CareerExplorerController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Career Explorer Routes
|--------------------------------------------------------------------------
| Base URL:
| /api/career-explorer
|
| All Career Explorer routes require authentication.
|--------------------------------------------------------------------------
*/

// Career Explorer main profile
router.get("/", protect, careerExplorerController.getExplorerProfile);

// Recommended careers
router.get(
  "/recommendations",
  protect,
  careerExplorerController.getRecommendedCareers,
);

// Skill gap for a specific career
router.get(
  "/skill-gap/:careerId",
  protect,
  careerExplorerController.getSkillGap,
);

// Detailed information for a specific career
router.get(
  "/career/:careerId",
  protect,
  careerExplorerController.getCareerDetails,
);

module.exports = router;
