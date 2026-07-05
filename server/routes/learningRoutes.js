const express = require("express");
const LearningController = require("../controllers/LearningController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Learning Routes
|--------------------------------------------------------------------------
*/

router.get("/progress", protect, LearningController.getProgress);

router.patch("/complete-topic", protect, LearningController.completeTopic);

module.exports = router;
