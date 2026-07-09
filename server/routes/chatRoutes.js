const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const { chat } = require("../controllers/chatController");

console.log("protect:", protect);
console.log("chat:", chat);

/**
 * @swagger
 * /chat:
 *   post:
 *     summary: Ask the AI Mentor
 *     tags: [AI Chat]
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
 *               - message
 *             properties:
 *               careerId:
 *                 type: string
 *                 example: backend-developer
 *               message:
 *                 type: string
 *                 example: How should I learn Spring Boot?
 *     responses:
 *       200:
 *         description: AI response generated successfully.
 *       400:
 *         description: Invalid request.
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: AI service error.
 */

router.post("/", protect, chat);

module.exports = router;
