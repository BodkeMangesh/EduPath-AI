const RoadmapService = require("../services/RoadmapService");

class RoadmapController {
  /**
   * Get User Roadmap
   */
  async getRoadmap(req, res) {
    try {
      const userId = req.user._id;
      const { careerId } = req.query;

      if (!careerId) {
        return res.status(400).json({
          success: false,
          message: "careerId is required.",
        });
      }

      const roadmap = await RoadmapService.getRoadmap(userId, careerId);

      return res.status(200).json({
        success: true,
        message: "Roadmap retrieved successfully.",
        data: roadmap,
      });
    } catch (error) {
      console.error("Roadmap Controller Error:", error);

      return res.status(500).json({
        success: false,
        message: error.message || "Unable to retrieve roadmap.",
      });
    }
  }
}

module.exports = new RoadmapController();
