const express = require("express");
const DashboardController = require("../controllers/DashboardController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Dashboard Routes
|--------------------------------------------------------------------------
*/

router.get("/", protect, DashboardController.getDashboard);

module.exports = router;
