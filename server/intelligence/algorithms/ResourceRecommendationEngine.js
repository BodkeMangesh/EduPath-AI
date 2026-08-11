const AIProvider = require("../../ai/AIProvider");

class ResourceRecommendationEngine {
  async recommend(assessment, careerAnalysis, learningProgress = null) {
    try {
      const recommendedCareer = careerAnalysis?.recommendedCareer || {};

      const missingSkills = recommendedCareer?.missingSkills || [];

      const context = {
        career: {
          id: recommendedCareer?.careerId || null,
          title: recommendedCareer?.title || null,
          missingSkills,
        },

        user: {
          education: assessment?.education || null,
          interests: assessment?.interests || [],
          technicalSkills: assessment?.technicalSkills || [],
          strengths: assessment?.strengths || [],
          weaknesses: assessment?.weaknesses || [],
          preferredLearningStyle:
            assessment?.preferredLearningStyle ||
            assessment?.aiProfile?.preferredLearningStyle ||
            null,
          dailyStudyHours:
            assessment?.dailyStudyHours ||
            assessment?.aiProfile?.dailyStudyHours ||
            null,
          careerGoal: assessment?.careerGoal || null,
        },

        learningProgress: learningProgress
          ? {
              currentPhase: learningProgress.currentPhase || null,

              overallCompletion: learningProgress.overallCompletion || 0,

              completedTopics: learningProgress.completedTopics || [],

              pendingTopics: learningProgress.pendingTopics || [],

              nextMilestone: learningProgress.nextMilestone || null,

              status: learningProgress.status || null,
            }
          : null,
      };

      console.log("===== RESOURCE RECOMMENDATION CONTEXT =====");

      console.log(JSON.stringify(context, null, 2));

      const result = await AIProvider.generate("resources", context);

      if (!result || result.error) {
        throw new Error("Invalid resource recommendation received from AI.");
      }

      return this.normalizeResources(result);
    } catch (error) {
      console.error("Resource Recommendation Error:", error.message);

      throw new Error("Unable to generate resource recommendations.");
    }
  }

  normalizeResources(result) {
    return {
      nextTopic: result.nextTopic || null,

      youtube: this.normalizeResourceList(result.youtube),

      documentation: this.normalizeResourceList(result.documentation),

      practice: this.normalizeResourceList(result.practice),

      projects: this.normalizeProjectList(result.projects),
    };
  }

  normalizeResourceList(resources) {
    if (!Array.isArray(resources)) {
      return [];
    }

    return resources
      .filter((resource) => resource && resource.title)
      .map((resource) => ({
        title: String(resource.title).trim(),

        provider: resource.provider ? String(resource.provider).trim() : "",

        url: resource.url ? String(resource.url).trim() : "",

        reason: resource.reason ? String(resource.reason).trim() : "",

        level: resource.level ? String(resource.level).trim() : null,

        priority: this.normalizePriority(resource.priority),
      }));
  }

  normalizeProjectList(projects) {
    if (!Array.isArray(projects)) {
      return [];
    }

    return projects
      .filter((project) => project && project.title)
      .map((project) => ({
        title: String(project.title).trim(),

        reason: project.reason ? String(project.reason).trim() : "",

        priority: this.normalizePriority(project.priority),
      }));
  }

  normalizePriority(priority) {
    const allowed = ["High", "Medium", "Low"];

    return allowed.includes(priority) ? priority : "Medium";
  }
}

module.exports = new ResourceRecommendationEngine();
