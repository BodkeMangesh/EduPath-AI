const AIProvider = require("../ai/AIProvider");
const ResourceLinkMapper = require("../utils/ResourceLinkMapper");

class AIResourceService {
  /**
   * Generate AI Learning Resources
   */
  async generate(user, progress) {
    if (!user) {
      throw new Error("User profile is required.");
    }

    if (!progress) {
      throw new Error("Learning progress is required.");
    }

    try {
      /*
       * ----------------------------------------------------
       * Build User-Based AI Context
       * ----------------------------------------------------
       */

      const context = {
        currentTopic:
          progress.pendingTopics?.[0] || progress.nextMilestone || null,

        completedTopics: progress.completedTopics || [],

        pendingTopics: progress.pendingTopics || [],

        career: {
          careerId: progress.careerId || null,

          targetRole: user.placement?.targetRole || null,

          careerGoal: user.aiProfile?.careerGoal || null,

          dreamCompany: user.placement?.dreamCompany || null,
        },

        user: {
          fullName: user.fullName || null,

          role: user.role || null,

          education: {
            collegeName: user.education?.collegeName || null,
            university: user.education?.university || null,
            degree: user.education?.degree || null,
            branch: user.education?.branch || null,
            semester: user.education?.semester || null,
            cgpa: user.education?.cgpa || null,
            graduationYear: user.education?.graduationYear || null,
          },

          skills: user.professional?.skills || [],

          interests: user.aiProfile?.interests || [],

          experienceLevel: user.professional?.experienceLevel || "beginner",

          learningStyle: user.learningStyle || "mixed",

          preferredLanguage: user.aiProfile?.preferredLanguage || "English",

          dailyStudyHours: user.aiProfile?.dailyStudyHours || 2,
        },

        learningProgress: {
          currentPhase: progress.currentPhase || 1,

          overallCompletion: progress.overallCompletion || 0,

          currentStreak: progress.currentStreak || 0,

          totalStudyHours: progress.totalStudyHours || 0,

          completedTopics: progress.completedTopics || [],

          pendingTopics: progress.pendingTopics || [],

          nextMilestone: progress.nextMilestone || null,

          status: progress.status || "Active",
        },
      };

      console.log("===== RESOURCE AI CONTEXT =====");

      console.log(JSON.stringify(context, null, 2));

      /*
       * ----------------------------------------------------
       * Generate AI Resources
       * ----------------------------------------------------
       */

      const resources = await AIProvider.generate("resources", context);

      /*
       * ----------------------------------------------------
       * Attach Resource URLs
       * ----------------------------------------------------
       */

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

      if (Array.isArray(resources.projects)) {
        resources.projects = resources.projects.map((project) => ({
          ...project,

          url: ResourceLinkMapper.getProjectLink(project.title),
        }));
      }

      return resources;
    } catch (error) {
      console.error("AI Resource Service Error:", error.message);

      throw new Error("Unable to generate AI resources.");
    }
  }
}

module.exports = new AIResourceService();
