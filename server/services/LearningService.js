const LearningProgressService = require("./LearningProgressService");

class LearningService {
  /**
   * Get User Learning Progress
   */
  async getProgress(userId, careerId) {
    console.log("User ID:", userId, "Career ID:", careerId);
    const progress = await LearningProgressService.getProgress(
      userId,
      careerId,
    );

    console.log("Retrieved Progress:", progress);
    if (!progress) {
      throw new Error("Learning progress not found.");
    }

    return progress;
  }

  /**
   * Complete Learning Topic
   */
  async completeTopic(userId, careerId, topic) {
    return await LearningProgressService.completeTopic(userId, careerId, topic);
  }
}

module.exports = new LearningService();
