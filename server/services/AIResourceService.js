const AIProvider = require("../ai/AIProvider");

class AIResourceService {
  /**
   * Generate AI Learning Resources
   */
  async generate(progress, assessment = {}) {
    try {
      const context = {
        currentTopic: progress.nextMilestone || "Java",

        completedTopics: progress.completedTopics || [],

        pendingTopics: progress.pendingTopics || [],

        career: progress.careerId || "Backend Developer",

        learningStyle:
          assessment.preferredLearningStyle ||
          assessment.learningStyle ||
          "Project Based",

        dailyStudyHours: assessment.dailyStudyHours || 2,
      };

      const resources = await AIProvider.generate("resources", context);

      return resources;
    } catch (error) {
      console.error("AI Resource Service Error:", error.message);

      throw new Error("Unable to generate AI resources.");
    }
  }
}

module.exports = new AIResourceService();
