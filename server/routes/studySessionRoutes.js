const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const StudySessionController = require("../controllers/StudySessionController");

/*
|--------------------------------------------------------------------------
| Study Session Routes
|--------------------------------------------------------------------------
*/

// Save completed Pomodoro session
router.post("/save-session", protect, StudySessionController.saveSession);

module.exports = router;
