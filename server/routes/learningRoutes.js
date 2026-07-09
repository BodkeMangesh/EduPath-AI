const express = require("express");
const LearningController = require("../controllers/LearningController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Learning Routes
|--------------------------------------------------------------------------
*/

/**
 * @swagger
 * /learning/progress:
 *   get:
 *     summary: Get user's learning progress
 *     tags: [Learning]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: careerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Career ID
 *     responses:
 *       200:
 *         description: Learning progress retrieved successfully.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Learning progress not found.
 */

router.get("/progress", protect, LearningController.getProgress);

/**
 * @swagger
 * /learning/complete-topic:
 *   post:
 *     summary: Mark a topic as completed
 *     tags: [Learning]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - careerId
 *               - topic
 *             properties:
 *               careerId:
 *                 type: string
 *                 example: backend-developer
 *               topic:
 *                 type: string
 *                 example: OOP
 *     responses:
 *       200:
 *         description: Topic marked as completed.
 *       400:
 *         description: Invalid request.
 *       401:
 *         description: Unauthorized.
 */

router.post("/complete-topic", protect, LearningController.completeTopic);

module.exports = router;
