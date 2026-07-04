const express = require("express");
const UserController = require("../controllers/UserController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/me", protect, UserController.getProfile);
router.put("/profile", protect, UserController.updateProfile);
router.put("/change-password", protect, UserController.changePassword);

module.exports = router;
