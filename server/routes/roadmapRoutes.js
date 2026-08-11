const express = require("express");

const RoadmapController = require("../controllers/RoadmapController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * Get User Roadmap
 *
 * GET /api/v1/roadmap?careerId=full-stack
 */
router.get("/", protect, RoadmapController.getRoadmap);

module.exports = router;
