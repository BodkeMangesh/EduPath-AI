const express = require("express");

const PlacementController = require("../controllers/PlacementController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * ---------------------------------------------------------
 * Placement Dashboard
 * ---------------------------------------------------------
 */

// Get complete placement dashboard
router.get("/", authMiddleware, PlacementController.getPlacement);

// Create placement profile
router.post("/", authMiddleware, PlacementController.createPlacementProfile);

/**
 * ---------------------------------------------------------
 * Placement Target
 * ---------------------------------------------------------
 */

// Update target role / dream company
router.patch("/target", authMiddleware, PlacementController.updateTarget);

/**
 * ---------------------------------------------------------
 * DSA
 * ---------------------------------------------------------
 */

// Update DSA readiness
router.patch("/dsa", authMiddleware, PlacementController.updateDsa);

/**
 * ---------------------------------------------------------
 * Resume
 * ---------------------------------------------------------
 */

// Update resume readiness
router.patch("/resume", authMiddleware, PlacementController.updateResume);

/**
 * ---------------------------------------------------------
 * Interview
 * ---------------------------------------------------------
 */

// Update interview readiness
router.patch("/interview", authMiddleware, PlacementController.updateInterview);

/**
 * ---------------------------------------------------------
 * Checklist
 * ---------------------------------------------------------
 */

// Update individual checklist item
router.patch(
  "/checklist/:checklistId",
  authMiddleware,
  PlacementController.updateChecklistItem,
);

module.exports = router;
