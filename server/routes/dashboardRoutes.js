const express = require("express");
const DashboardController = require("../controllers/DashboardController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Dashboard Routes
|--------------------------------------------------------------------------
*/

/**
 * @swagger
 * /dashboard:
 *   get:
 *     summary: Get user's dashboard
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: careerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Career ID selected by the user
 *     responses:
 *       200:
 *         description: Dashboard data fetched successfully.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Dashboard not found.
 *       500:
 *         description: Internal server error.
 */

router.get("/", protect, DashboardController.getDashboard);

module.exports = router;
