const express = require("express");
const assessmentController = require("../controllers/assessmentController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Assessment Routes
|--------------------------------------------------------------------------
*/
/**
 * @swagger
 * /assessments/start:
 *   post:
 *     summary: Start a new assessment
 *     tags: [Assessment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example: {}
 *     responses:
 *       201:
 *         description: Assessment started successfully.
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
 */

// Start Assessment
router.post("/start", protect, assessmentController.startAssessment);

/**
 * @swagger
 * /assessments/submit/{id}:
 *   put:
 *     summary: Submit completed assessment
 *     tags: [Assessment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Assessment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               education:
 *                 type: string
 *                 example: BCA
 *               interests:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example:
 *                   - Backend Development
 *                   - Artificial Intelligence
 *               skills:
 *                 type: object
 *                 properties:
 *                   java:
 *                     type: integer
 *                     example: 8
 *                   javascript:
 *                     type: integer
 *                     example: 7
 *                   html:
 *                     type: integer
 *                     example: 8
 *                   css:
 *                     type: integer
 *                     example: 7
 *                   sql:
 *                     type: integer
 *                     example: 6
 *                   springBoot:
 *                     type: integer
 *                     example: 4
 *               strengths:
 *                 type: array
 *                 items:
 *                   type: string
 *               weaknesses:
 *                 type: array
 *                 items:
 *                   type: string
 *               preferredLearningStyle:
 *                 type: string
 *                 example: Project Based
 *               dailyStudyHours:
 *                 type: number
 *                 example: 2
 *               careerGoal:
 *                 type: string
 *                 example: Become a Backend Developer
 *     responses:
 *       200:
 *         description: Assessment submitted successfully.
 *       400:
 *         description: Invalid request.
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
 */

// Submit Assessment
router.put("/submit/:id", protect, assessmentController.submitAssessment);

module.exports = router;
