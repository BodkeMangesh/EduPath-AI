const express = require("express");

const LearningController = require("../controllers/LearningController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/progress", protect, LearningController.getProgress);

router.post("/complete-topic", protect, LearningController.completeTopic);

router.post("/complete-today", protect, LearningController.completeTodayPlan);

router.get("/session/active", protect, LearningController.getActiveSession);

router.get(
  "/session/topic-stats",
  protect,
  LearningController.getTopicStatistics,
);

router.get("/session/summary", protect, LearningController.getLearningSummary);

router.get("/sessions", protect, LearningController.getHistory);

router.post("/session/start", protect, LearningController.startSession);

router.get("/session/:sessionId", protect, LearningController.getSession);

router.post(
  "/session/:sessionId/pause",
  protect,
  LearningController.pauseSession,
);

router.post(
  "/session/:sessionId/resume",
  protect,
  LearningController.resumeSession,
);

router.patch(
  "/session/:sessionId/progress",
  protect,
  LearningController.updateSessionProgress,
);

router.patch(
  "/session/:sessionId/notes",
  protect,
  LearningController.updateSessionNotes,
);

router.patch(
  "/session/:sessionId/intelligence",
  protect,
  LearningController.updateLearningIntelligence,
);

router.post(
  "/session/:sessionId/understanding-check",
  protect,
  LearningController.updateUnderstandingCheck,
);

router.patch(
  "/session/:sessionId/next-topic",
  protect,
  LearningController.updateNextTopicRecommendation,
);

router.patch(
  "/session/:sessionId/duration",
  protect,
  LearningController.updateSessionDuration,
);

router.post(
  "/session/:sessionId/complete",
  protect,
  LearningController.completeSession,
);

router.post(
  "/session/:sessionId/abandon",
  protect,
  LearningController.abandonSession,
);

module.exports = router;
