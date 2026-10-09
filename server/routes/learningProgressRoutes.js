const express = require("express");

const LearningProgressController = require("../controllers/LearningProgressController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| BASIC LEARNING PROGRESS
|--------------------------------------------------------------------------
| GET /api/v1/learning-progress?careerId=backend-developer
*/

router.get("/", protect, LearningProgressController.getProgress);

/*
|--------------------------------------------------------------------------
| PROGRESS DASHBOARD
|--------------------------------------------------------------------------
| GET /api/v1/learning-progress/dashboard?careerId=backend-developer
|
| Complete progress data for the Progress page.
*/

router.get("/dashboard", protect, LearningProgressController.getDashboard);

/*
|--------------------------------------------------------------------------
| PROGRESS OVERVIEW
|--------------------------------------------------------------------------
| GET /api/v1/learning-progress/overview?careerId=backend-developer
*/

router.get("/overview", protect, LearningProgressController.getOverview);

/*
|--------------------------------------------------------------------------
| SESSION ANALYTICS
|--------------------------------------------------------------------------
| GET /api/v1/learning-progress/sessions?careerId=backend-developer
*/

router.get(
  "/sessions",
  protect,
  LearningProgressController.getSessionAnalytics,
);

/*
|--------------------------------------------------------------------------
| TOPIC ANALYTICS
|--------------------------------------------------------------------------
| GET /api/v1/learning-progress/topics?careerId=backend-developer
*/

router.get("/topics", protect, LearningProgressController.getTopicAnalytics);

/*
|--------------------------------------------------------------------------
| LEARNING QUALITY
|--------------------------------------------------------------------------
| GET /api/v1/learning-progress/quality?careerId=backend-developer
*/

router.get("/quality", protect, LearningProgressController.getLearningQuality);

/*
|--------------------------------------------------------------------------
| LEARNING ACTIVITY
|--------------------------------------------------------------------------
| GET /api/v1/learning-progress/activity
| ?careerId=backend-developer&days=30
*/

router.get(
  "/activity",
  protect,
  LearningProgressController.getActivityAnalytics,
);

/*
|--------------------------------------------------------------------------
| PROGRESS INSIGHTS
|--------------------------------------------------------------------------
| GET /api/v1/learning-progress/insights?careerId=backend-developer
*/

router.get(
  "/insights",
  protect,
  LearningProgressController.getProgressInsights,
);

/*
|--------------------------------------------------------------------------
| LEARNING FORECAST
|--------------------------------------------------------------------------
| GET /api/v1/learning-progress/forecast?careerId=backend-developer
*/

router.get(
  "/forecast",
  protect,
  LearningProgressController.getLearningForecast,
);

/*
|--------------------------------------------------------------------------
| COMPLETE TOPIC
|--------------------------------------------------------------------------
| POST /api/v1/learning-progress/complete-topic
|
| Body:
| {
|   "careerId": "backend-developer",
|   "topic": "Node.js"
| }
*/

router.post(
  "/complete-topic",
  protect,
  LearningProgressController.completeTopic,
);

/*
|--------------------------------------------------------------------------
| COMPLETE TODAY'S PLAN
|--------------------------------------------------------------------------
| POST /api/v1/learning-progress/complete-today
|
| Body:
| {
|   "careerId": "backend-developer"
| }
*/

router.post(
  "/complete-today",
  protect,
  LearningProgressController.completeTodayPlan,
);

/*
|--------------------------------------------------------------------------
| UPDATE STUDY HOURS
|--------------------------------------------------------------------------
| PATCH /api/v1/learning-progress/study-hours
|
| Body:
| {
|   "careerId": "backend-developer",
|   "hours": 2
| }
*/

router.patch(
  "/study-hours",
  protect,
  LearningProgressController.updateStudyHours,
);

/*
|--------------------------------------------------------------------------
| UPDATE LEARNING STREAK
|--------------------------------------------------------------------------
| PATCH /api/v1/learning-progress/streak
|
| Body:
| {
|   "careerId": "backend-developer"
| }
*/

router.patch("/streak", protect, LearningProgressController.updateStreak);

module.exports = router;
