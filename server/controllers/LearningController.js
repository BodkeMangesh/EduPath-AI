const LearningService = require("../services/LearningService");

class LearningController {
  /**
   * Get Learning Progress
   */
  async getProgress(req, res, next) {
    try {
      const { careerId } = req.query;

      const progress = await LearningService.getProgress(
        req.user._id,
        careerId,
      );

      return res.status(200).json({
        success: true,
        data: progress,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Complete Topic
   */
  async completeTopic(req, res, next) {
    try {
      const { careerId, topic } = req.body;

      const progress = await LearningService.completeTopic(
        req.user._id,
        careerId,
        topic,
      );

      return res.status(200).json({
        success: true,
        message: "Topic completed successfully.",
        data: progress,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new LearningController();
