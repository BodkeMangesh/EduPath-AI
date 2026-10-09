const express = require("express");

const ResumeAnalyzerController = require("../controllers/ResumeAnalyzerController");
const authMiddleware = require("../middleware/authMiddleware");
const uploadResume = require("../middleware/uploadResume");

const router = express.Router();

// Get current resume analysis
router.get("/", authMiddleware, ResumeAnalyzerController.getAnalysis);

// Create resume analyzer profile
router.post("/", authMiddleware, ResumeAnalyzerController.createAnalysis);

// Analyze resume/profile
router.post("/analyze", authMiddleware, ResumeAnalyzerController.analyzeResume);

// Upload actual resume file
router.post(
  "/upload",
  authMiddleware,
  uploadResume.single("resume"),
  ResumeAnalyzerController.uploadResume,
);

// Update resume information
router.patch("/resume", authMiddleware, ResumeAnalyzerController.updateResume);

// Update resume suggestion status
router.patch(
  "/suggestions/:suggestionId",
  authMiddleware,
  ResumeAnalyzerController.updateSuggestion,
);

module.exports = router;
