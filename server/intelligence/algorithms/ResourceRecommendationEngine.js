const AIProvider = require("../../ai/AIProvider");

class ResourceRecommendationEngine {
  /*
  |--------------------------------------------------------------------------
  | Generate Personalized Resources
  |--------------------------------------------------------------------------
  */

  async recommend(user, careerAnalysis, learningProgress = null) {
    try {
      // ==========================================================
      // VALIDATION
      // ==========================================================

      if (!user) {
        throw new Error("User information is required.");
      }

      if (!careerAnalysis) {
        throw new Error("Career analysis is required.");
      }

      // ==========================================================
      // RECOMMENDED CAREER
      // ==========================================================

      const recommendedCareer =
        careerAnalysis?.careerAnalysis?.recommendedCareer ||
        careerAnalysis?.recommendedCareer ||
        {};

      // ==========================================================
      // CAREER INFORMATION
      // ==========================================================

      const careerId =
        recommendedCareer?.careerId ||
        recommendedCareer?.id ||
        recommendedCareer?._id ||
        null;

      const careerTitle =
        recommendedCareer?.careerTitle ||
        recommendedCareer?.title ||
        recommendedCareer?.name ||
        "";

      const careerDescription = recommendedCareer?.description || "";

      const missingSkills = Array.isArray(recommendedCareer?.missingSkills)
        ? recommendedCareer.missingSkills
        : [];

      // ==========================================================
      // USER INFORMATION
      // ==========================================================

      const onboarding = user?.onboarding || {};
      const aiProfile = user?.aiProfile || {};
      const professional = user?.professional || {};
      const placement = user?.placement || {};
      const education = user?.education || {};

      // ==========================================================
      // INTERESTS
      // ==========================================================

      const interests = [
        ...(Array.isArray(aiProfile?.interests) ? aiProfile.interests : []),

        ...(Array.isArray(onboarding?.interests) ? onboarding.interests : []),
      ];

      const uniqueInterests = [
        ...new Set(
          interests
            .filter(Boolean)
            .map((item) => String(item).trim())
            .filter(Boolean),
        ),
      ];

      // ==========================================================
      // TECHNICAL SKILLS
      // ==========================================================

      const technicalSkills = Array.isArray(professional?.skills)
        ? professional.skills
            .filter(Boolean)
            .map((skill) => String(skill).trim())
            .filter(Boolean)
        : [];

      // ==========================================================
      // LEARNING PROGRESS
      // ==========================================================

      const progressData =
        learningProgress?.toObject?.() || learningProgress || {};

      const pendingTopics = Array.isArray(progressData?.pendingTopics)
        ? progressData.pendingTopics
        : [];

      const completedTopics = Array.isArray(progressData?.completedTopics)
        ? progressData.completedTopics
        : [];

      // ==========================================================
      // CURRENT PHASE
      // ==========================================================

      const currentPhase = Number(progressData?.currentPhase) || 1;

      // ==========================================================
      // CURRENT TOPIC
      // ==========================================================
      //
      // Priority:
      //
      // 1. Explicit topic supplied by controller
      // 2. Progress nextTopic
      // 3. First pending topic
      //

      const currentTopic =
        progressData?.currentTopic ||
        progressData?.nextTopic ||
        pendingTopics[0] ||
        "";

      // ==========================================================
      // LEARNING TARGET
      // ==========================================================

      const currentLearningTarget = {
        phase: currentPhase,
        topic: currentTopic,
      };

      // ==========================================================
      // PERSONALIZED CONTEXT
      // ==========================================================

      const context = {
        // ========================================================
        // CAREER
        // ========================================================

        career: {
          careerId,

          id: careerId,

          title: careerTitle,

          careerTitle,

          description: careerDescription,

          careerGoal: aiProfile?.careerGoal || onboarding?.careerGoal || "",

          targetRole: placement?.targetRole || "",

          dreamCompany: placement?.dreamCompany || "",

          missingSkills,
        },

        // ========================================================
        // USER PROFILE
        // ========================================================

        user: {
          fullName: user?.fullName || "",

          role: user?.role || "student",

          education: {
            collegeName: education?.collegeName || "",

            university: education?.university || "",

            degree: education?.degree || "",

            branch: education?.branch || "",

            semester: education?.semester || null,

            graduationYear: education?.graduationYear || null,

            cgpa: education?.cgpa ?? null,
          },

          interests: uniqueInterests,

          technicalSkills,

          strengths: [],

          weaknesses: missingSkills,

          learningStyle: user?.learningStyle || "mixed",

          preferredLearningStyle: user?.learningStyle || "mixed",

          preferredLanguage: aiProfile?.preferredLanguage || "English",

          dailyStudyHours: Number(aiProfile?.dailyStudyHours) || 2,

          careerGoal: aiProfile?.careerGoal || onboarding?.careerGoal || "",

          currentSituation: onboarding?.currentSituation || "",

          targetRole: placement?.targetRole || "",

          dreamCompany: placement?.dreamCompany || "",

          experienceLevel: professional?.experienceLevel || "beginner",

          placementFocus: user?.placementFocus || "both",

          certifications: Array.isArray(professional?.certifications)
            ? professional.certifications
            : [],

          projects: Array.isArray(professional?.projects)
            ? professional.projects
            : [],
        },

        // ========================================================
        // LEARNING PROGRESS
        // ========================================================

        learningProgress: {
          currentPhase,

          overallCompletion: Number(progressData?.overallCompletion) || 0,

          completedTopics,

          pendingTopics,

          nextMilestone: progressData?.nextMilestone || null,

          nextTopic: progressData?.nextTopic || currentTopic || null,

          status: progressData?.status || "Active",

          currentStreak: Number(progressData?.currentStreak) || 0,

          totalStudyHours: Number(progressData?.totalStudyHours) || 0,
        },

        // ========================================================
        // IMPORTANT:
        // resourcePrompt.js expects this object
        // ========================================================

        currentLearningTarget,

        // ========================================================
        // CURRENT TOPIC
        // ========================================================

        currentTopic,
      };

      // ==========================================================
      // DEBUG
      // ==========================================================

      console.log("==================================================");

      console.log("RESOURCE RECOMMENDATION ENGINE");

      console.log("==================================================");

      console.log("Career:", careerTitle);
      console.log("Career ID:", careerId);
      console.log("Current Phase:", currentPhase);
      console.log("Current Topic:", currentTopic);
      console.log("Completed Topics:", completedTopics);
      console.log("Pending Topics:", pendingTopics);

      console.log("Learning Style:", context.user.learningStyle);

      console.log("Daily Study Hours:", context.user.dailyStudyHours);

      console.log("Technical Skills:", technicalSkills);

      console.log("==================================================");

      // ==========================================================
      // AI RESOURCE GENERATION
      // ==========================================================

      const result = await AIProvider.generate("resources", context);

      // ==========================================================
      // VALIDATE AI RESPONSE
      // ==========================================================

      if (!result) {
        throw new Error("AI returned an empty resource response.");
      }

      if (result?.error) {
        throw new Error("AI resource generation failed.");
      }

      // ==========================================================
      // NORMALIZE AI RESPONSE
      // ==========================================================

      const normalized = this.normalizeResources(result, currentTopic);

      // ==========================================================
      // FINAL VALIDATION
      // ==========================================================

      const totalResources =
        normalized.youtube.length +
        normalized.documentation.length +
        normalized.articles.length +
        normalized.practice.length +
        normalized.projects.length +
        normalized.revision.length;

      console.log("==================================================");

      console.log("RESOURCE GENERATION RESULT");

      console.log("Current Topic:", normalized.nextTopic);

      console.log("YouTube:", normalized.youtube.length);

      console.log("Documentation:", normalized.documentation.length);

      console.log("Articles:", normalized.articles.length);

      console.log("Practice:", normalized.practice.length);

      console.log("Projects:", normalized.projects.length);

      console.log("Revision:", normalized.revision.length);

      console.log("Total Resources:", totalResources);

      console.log("==================================================");

      return normalized;
    } catch (error) {
      console.error("Resource Recommendation Error:", error);

      throw new Error("Unable to generate resource recommendations.");
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Normalize Complete Resource Response
  |--------------------------------------------------------------------------
  */

  normalizeResources(result, currentTopic = null) {
    return {
      nextTopic: result?.nextTopic || currentTopic || null,

      objectives:
        result?.objectives && typeof result.objectives === "object"
          ? {
              learn: String(result.objectives.learn || "").trim(),

              practice: String(result.objectives.practice || "").trim(),

              revision: String(result.objectives.revision || "").trim(),
            }
          : {
              learn: "",
              practice: "",
              revision: "",
            },

      youtube: this.normalizeResourceList(result?.youtube),

      documentation: this.normalizeResourceList(result?.documentation),

      articles: this.normalizeResourceList(result?.articles),

      practice: this.normalizeResourceList(result?.practice),

      projects: this.normalizeProjectList(result?.projects),

      revision: this.normalizeResourceList(result?.revision),
    };
  }

  /*
  |--------------------------------------------------------------------------
  | Normalize Resource List
  |--------------------------------------------------------------------------
  */

  normalizeResourceList(resources) {
    if (!Array.isArray(resources)) {
      return [];
    }

    const seen = new Set();

    return resources
      .filter(
        (resource) =>
          resource && typeof resource === "object" && resource.title,
      )
      .map((resource) => {
        const title = String(resource.title).trim();

        const provider = resource.provider
          ? String(resource.provider).trim()
          : "";

        const url = resource.url ? String(resource.url).trim() : "";

        const description = resource.description
          ? String(resource.description).trim()
          : "";

        const reason = resource.reason ? String(resource.reason).trim() : "";

        const level = resource.level ? String(resource.level).trim() : null;

        const type = resource.type ? String(resource.type).trim() : "";

        const durationMinutes = Number(resource.durationMinutes) || 0;

        const priority = this.normalizePriority(resource.priority);

        return {
          title,

          type,

          provider,

          url: this.normalizeUrl(url),

          description,

          reason,

          level,

          durationMinutes,

          priority,
        };
      })
      .filter((resource) => {
        const key =
          `${resource.title.toLowerCase().trim()}|` +
          `${resource.provider.toLowerCase().trim()}`;

        if (seen.has(key)) {
          return false;
        }

        seen.add(key);

        return true;
      });
  }

  /*
  |--------------------------------------------------------------------------
  | Normalize Project List
  |--------------------------------------------------------------------------
  */

  normalizeProjectList(projects) {
    if (!Array.isArray(projects)) {
      return [];
    }

    const seen = new Set();

    return projects
      .filter(
        (project) => project && typeof project === "object" && project.title,
      )
      .map((project) => ({
        title: String(project.title).trim(),

        description: project.description
          ? String(project.description).trim()
          : "",

        reason: project.reason ? String(project.reason).trim() : "",

        url: this.normalizeUrl(project.url || ""),

        level: project.level ? String(project.level).trim() : null,

        durationMinutes: Number(project.durationMinutes) || 0,

        priority: this.normalizePriority(project.priority),
      }))
      .filter((project) => {
        const key = project.title.toLowerCase().trim();

        if (seen.has(key)) {
          return false;
        }

        seen.add(key);

        return true;
      });
  }

  /*
  |--------------------------------------------------------------------------
  | Normalize Priority
  |--------------------------------------------------------------------------
  */

  normalizePriority(priority) {
    const normalized = priority ? String(priority).trim().toLowerCase() : "";

    switch (normalized) {
      case "high":
        return "High";

      case "medium":
        return "Medium";

      case "low":
        return "Low";

      default:
        return "Medium";
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Normalize URL
  |--------------------------------------------------------------------------
  */

  normalizeUrl(url) {
    if (!url) {
      return "";
    }

    const normalized = String(url).trim();

    if (!normalized) {
      return "";
    }

    if (normalized.startsWith("https://") || normalized.startsWith("http://")) {
      return normalized;
    }

    if (normalized.startsWith("www.")) {
      return `https://${normalized}`;
    }

    return "";
  }
}

module.exports = new ResourceRecommendationEngine();
