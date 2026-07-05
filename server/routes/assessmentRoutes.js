const express = require("express");
const assessmentController = require("../controllers/assessmentController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Assessment Routes
|--------------------------------------------------------------------------
*/

// Start Assessment
router.post("/start", protect, assessmentController.startAssessment);

// Submit Assessment
router.put("/submit/:id", protect, assessmentController.submitAssessment);

module.exports = router;
