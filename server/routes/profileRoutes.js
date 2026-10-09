const express = require("express");

const router = express.Router();

const profileController = require("../controllers/profileController");

const protect = require("../middleware/authMiddleware");

const onboardingAuth = require("../middleware/onboardingAuth");

router.put("/onboarding", protect, profileController.updateOnboarding);

module.exports = router;
