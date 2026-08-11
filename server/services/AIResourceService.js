const AIProvider = require("../ai/AIProvider");
const ResourceLinkMapper = require("../utils/ResourceLinkMapper");

class AIResourceService {
  /**
   * Generate AI Learning Resources
   */
  async generate(progress, assessment = {}) {
    assessment = assessment || {};

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

      // --------------------
      // Attach URLs
      // --------------------

      resources.youtube = (resources.youtube || []).map((item) => ({
        ...item,
        url: ResourceLinkMapper.getYouTubeLink(item.title),
      }));

      resources.documentation = (resources.documentation || []).map((item) => ({
        ...item,
        url: ResourceLinkMapper.getDocumentationLink(item.title),
      }));

      resources.practice = (resources.practice || []).map((item) => ({
        ...item,
        url: ResourceLinkMapper.getPracticeLink(item.title),
      }));

      if (resources.project) {
        resources.project = {
          ...resources.project,
          url: ResourceLinkMapper.getProjectLink(resources.project.title),
        };
      }

      return resources;
    } catch (error) {
      console.error("AI Resource Service Error:", error.message);

      throw new Error("Unable to generate AI resources.");
    }
  }
}

module.exports = new AIResourceService();
