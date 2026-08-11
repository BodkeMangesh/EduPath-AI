const LearningService = require("../services/LearningService");
const asyncHandler = require("../middleware/asyncHandler");

class LearningController {
  /**
   * Get Learning Progress
   */
  getProgress = asyncHandler(async (req, res) => {
    const { careerId } = req.query;

    const progress = await LearningService.getProgress(req.user._id, careerId);

    res.status(200).json({
      success: true,
      data: progress,
    });
  });

  /**
   * Complete Topic
   */
  completeTopic = asyncHandler(async (req, res) => {
    const { careerId, topic } = req.body;

    const progress = await LearningService.completeTopic(
      req.user._id,
      careerId,
      topic,
    );

    res.status(200).json({
      success: true,
      message: "Topic completed successfully.",
      data: progress,
    });
  });

  /**
   * Complete Today's Learning Plan
   */
  completeTodayPlan = asyncHandler(async (req, res) => {
    const { careerId } = req.body;

    const progress = await LearningService.completeTodayPlan(
      req.user._id,
      careerId,
    );

    res.status(200).json({
      success: true,
      message: "Today's learning plan completed successfully.",
      data: progress,
    });
  });
}

module.exports = new LearningController();
