const User = require("../models/User");
const RoadmapService = require("./RoadmapService");

class ResourcesService {
  /**
   * Get personalized resources for a user's current roadmap topic
   *
   * Resources are generated dynamically from:
   *
   * User Profile
   * + Onboarding Data
   * + Career
   * + Current Phase
   * + Current Topic
   * + Learning Style
   * + Experience Level
   * + Daily Study Hours
   */

  async getResources(userId, careerId, phase, topic) {
    // ==========================================================
    // 1. VALIDATION
    // ==========================================================

    if (!userId) {
      throw new Error("User ID is required.");
    }

    if (!careerId) {
      throw new Error("Career ID is required.");
    }

    if (!phase) {
      throw new Error("Phase is required.");
    }

    if (!topic) {
      throw new Error("Topic is required.");
    }

    // ==========================================================
    // 2. GET USER PROFILE
    // ==========================================================

    const user = await User.findById(userId).select(
      "-password -emailVerificationToken -emailVerificationExpires",
    );

    if (!user) {
      throw new Error("User not found.");
    }

    // ==========================================================
    // 3. GET ROADMAP
    // ==========================================================

    const roadmap = await RoadmapService.getRoadmap(userId, careerId);

    if (!roadmap) {
      throw new Error("Roadmap not found.");
    }

    // ==========================================================
    // 4. FIND CURRENT PHASE
    // ==========================================================

    const currentPhase = roadmap.phases.find(
      (item) => Number(item.phase) === Number(phase),
    );

    if (!currentPhase) {
      throw new Error("Roadmap phase not found.");
    }

    // ==========================================================
    // 5. VALIDATE TOPIC
    // ==========================================================

    const normalizedTopic = String(topic).trim().toLowerCase();

    const roadmapTopic = currentPhase.topics.find(
      (item) => String(item).trim().toLowerCase() === normalizedTopic,
    );

    if (!roadmapTopic) {
      throw new Error("Topic does not belong to this roadmap phase.");
    }

    // ==========================================================
    // 6. EXTRACT USER DATA
    // ==========================================================

    const onboarding = user.onboarding || {};
    const aiProfile = user.aiProfile || {};
    const professional = user.professional || {};
    const placement = user.placement || {};
    const education = user.education || {};

    const learningStyle =
      user.learningStyle || aiProfile.preferredLanguage || "mixed";

    const dailyStudyHours = Number(aiProfile.dailyStudyHours) || 2;

    const experienceLevel = professional.experienceLevel || "beginner";

    const skills = Array.isArray(professional.skills)
      ? professional.skills
      : [];

    const interests = Array.isArray(onboarding.interests)
      ? onboarding.interests
      : [];

    const careerGoal = onboarding.careerGoal || aiProfile.careerGoal || "";

    const currentSituation = onboarding.currentSituation || "";

    const targetRole = placement.targetRole || "";

    const placementFocus = user.placementFocus || "both";

    // ==========================================================
    // 7. GENERATE PERSONALIZATION CONTEXT
    // ==========================================================

    const personalization = {
      learningStyle,

      dailyStudyHours,

      experienceLevel,

      careerGoal,

      currentSituation,

      targetRole,

      placementFocus,

      skills,

      interests,

      education: {
        degree: education.degree || "",
        branch: education.branch || "",
        semester: education.semester || null,
        graduationYear: education.graduationYear || null,
      },
    };

    // ==========================================================
    // 8. GENERATE RESOURCE PLAN
    // ==========================================================

    const resourcePlan = this.generateResourcePlan({
      topic: roadmapTopic,
      phase: currentPhase,
      personalization,
    });

    // ==========================================================
    // 9. RETURN RESPONSE
    // ==========================================================

    return {
      career: roadmap.career,

      careerId: roadmap.careerId,

      phase: currentPhase.phase,

      phaseTitle: currentPhase.title,

      topic: roadmapTopic,

      personalization,

      resourcePlan,
    };
  }

  // ============================================================
  // RESOURCE PLAN GENERATOR
  // ============================================================

  generateResourcePlan({ topic, phase, personalization }) {
    const {
      learningStyle,
      dailyStudyHours,
      experienceLevel,
      placementFocus,
      targetRole,
    } = personalization;

    // ----------------------------------------------------------
    // Calculate today's available learning time
    // ----------------------------------------------------------

    const totalMinutes = Math.max(30, Math.round(dailyStudyHours * 60));

    // ----------------------------------------------------------
    // Divide time dynamically
    // ----------------------------------------------------------

    const learnMinutes = Math.round(totalMinutes * 0.45);

    const practiceMinutes = Math.round(totalMinutes * 0.35);

    const revisionMinutes = Math.max(
      10,
      totalMinutes - learnMinutes - practiceMinutes,
    );

    // ----------------------------------------------------------
    // Learning style preference
    // ----------------------------------------------------------

    let preferredResourceType = "mixed";

    if (learningStyle === "visual") {
      preferredResourceType = "video";
    }

    if (learningStyle === "reading") {
      preferredResourceType = "documentation";
    }

    if (learningStyle === "practical") {
      preferredResourceType = "practice";
    }

    // ----------------------------------------------------------
    // Experience-based difficulty
    // ----------------------------------------------------------

    let difficulty = "beginner";

    if (experienceLevel === "intermediate") {
      difficulty = "intermediate";
    }

    if (experienceLevel === "advanced" || experienceLevel === "professional") {
      difficulty = "advanced";
    }

    // ----------------------------------------------------------
    // Placement customization
    // ----------------------------------------------------------

    const placementPreparation =
      placementFocus === "tech" || placementFocus === "both";

    // ----------------------------------------------------------
    // Dynamic resource structure
    // ----------------------------------------------------------

    return {
      topic,

      phase: phase.phase,

      phaseTitle: phase.title,

      difficulty,

      preferredResourceType,

      totalMinutes,

      learn: {
        enabled: true,

        durationMinutes: learnMinutes,

        objective: `Understand ${topic} according to your current ${difficulty} level.`,

        resourceType: preferredResourceType,
      },

      practice: {
        enabled: true,

        durationMinutes: practiceMinutes,

        objective: `Practice ${topic} through hands-on tasks suitable for a ${difficulty} learner.`,

        placementFocused: placementPreparation,
      },

      revision: {
        enabled: true,

        durationMinutes: revisionMinutes,

        objective: `Revise the important concepts of ${topic}.`,
      },

      careerAlignment: {
        targetRole,

        placementFocused: placementPreparation,
      },
    };
  }
}

module.exports = new ResourcesService();
