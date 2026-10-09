const mongoose = require("mongoose");

const Career = require("../models/Career");
const User = require("../models/User");
const LearningProgressService = require("./LearningProgressService");

class RoadmapService {
  /**
   * ============================================================
   * FIND CAREER
   * ============================================================
   *
   * Supports:
   *
   * 1. MongoDB ObjectId
   * 2. Career.careerId
   * 3. Career.slug
   *
   * MongoDB Career is the single source of truth.
   */
  async findCareer(careerIdentifier) {
    if (!careerIdentifier) {
      throw new Error("Career ID is required.");
    }

    const identifier = String(careerIdentifier).trim();

    if (!identifier) {
      throw new Error("Career ID is required.");
    }

    let career = null;

    /*
     * ----------------------------------------------------------
     * ObjectId lookup
     * ----------------------------------------------------------
     */

    if (mongoose.Types.ObjectId.isValid(identifier)) {
      career = await Career.findOne({
        _id: identifier,
        isActive: true,
      })
        .populate("category", "name slug icon")
        .lean();
    }

    /*
     * ----------------------------------------------------------
     * careerId / slug lookup
     * ----------------------------------------------------------
     */

    if (!career) {
      const normalizedIdentifier = identifier.toLowerCase();

      career = await Career.findOne({
        isActive: true,
        $or: [
          {
            careerId: normalizedIdentifier,
          },
          {
            slug: normalizedIdentifier,
          },
        ],
      })
        .populate("category", "name slug icon")
        .lean();
    }

    if (!career) {
      throw new Error("Career not found.");
    }

    console.log("===== ROADMAP SERVICE CAREER DEBUG =====");
    console.log("Career _id:", career?._id);
    console.log("Career careerId:", career?.careerId);
    console.log("Career slug:", career?.slug);
    console.log("Roadmap exists:", Array.isArray(career?.roadmap));
    console.log("Roadmap length:", career?.roadmap?.length);
    console.log("Roadmap:", JSON.stringify(career?.roadmap, null, 2));
    console.log("========================================");

    return career;
  }

  /**
   * ============================================================
   * GET CAREER IDENTIFIER
   * ============================================================
   */

  getCareerIdentifier(career) {
    if (!career) {
      throw new Error("Career is required.");
    }

    return String(career.careerId || career.slug || career._id || "")
      .trim()
      .toLowerCase();
  }

  /**
   * ============================================================
   * NORMALIZE TOPIC
   * ============================================================
   */

  normalizeTopic(topic) {
    return String(topic || "")
      .trim()
      .toLowerCase();
  }

  /**
   * ============================================================
   * GET PHASE TOPICS
   * ============================================================
   */

  getPhaseTopics(phase) {
    if (!phase || !Array.isArray(phase.topics)) {
      return [];
    }

    return phase.topics
      .flat(Infinity)
      .filter(Boolean)
      .map((topic) => String(topic).trim())
      .filter(Boolean);
  }

  /**
   * ============================================================
   * GET PHASE PROJECTS
   * ============================================================
   */

  getPhaseProjects(phase) {
    if (!phase || !Array.isArray(phase.projects)) {
      return [];
    }

    return phase.projects
      .flat(Infinity)
      .filter(Boolean)
      .map((project) => String(project).trim())
      .filter(Boolean);
  }

  /**
   * ============================================================
   * GET PHASE INTERVIEW TOPICS
   * ============================================================
   */

  getPhaseInterviewTopics(phase) {
    if (!phase || !Array.isArray(phase.interviewTopics)) {
      return [];
    }

    return phase.interviewTopics
      .flat(Infinity)
      .filter(Boolean)
      .map((topic) => String(topic).trim())
      .filter(Boolean);
  }

  /**
   * ============================================================
   * GET ALL ROADMAP TOPICS
   * ============================================================
   */

  getAllRoadmapTopics(career) {
    if (!career || !Array.isArray(career.roadmap)) {
      return [];
    }

    return [
      ...new Set(
        career.roadmap
          .flatMap((phase) => this.getPhaseTopics(phase))
          .filter(Boolean),
      ),
    ];
  }

  /**
   * ============================================================
   * GET ALL ROADMAP PROJECTS
   * ============================================================
   */

  getAllRoadmapProjects(career) {
    if (!career || !Array.isArray(career.roadmap)) {
      return [];
    }

    return [
      ...new Set(
        career.roadmap
          .flatMap((phase) => this.getPhaseProjects(phase))
          .filter(Boolean),
      ),
    ];
  }

  /**
   * ============================================================
   * GET ALL INTERVIEW TOPICS
   * ============================================================
   */

  getAllInterviewTopics(career) {
    if (!career || !Array.isArray(career.roadmap)) {
      return [];
    }

    return [
      ...new Set(
        career.roadmap
          .flatMap((phase) => this.getPhaseInterviewTopics(phase))
          .filter(Boolean),
      ),
    ];
  }

  /**
   * ============================================================
   * NORMALIZE USER SKILLS
   * ============================================================
   */

  normalizeSkills(skills) {
    if (!Array.isArray(skills)) {
      return [];
    }

    return [
      ...new Set(
        skills
          .filter(Boolean)
          .map((skill) => String(skill).trim())
          .filter(Boolean),
      ),
    ];
  }

  /**
   * ============================================================
   * BUILD SKILL GAP
   * ============================================================
   *
   * Uses Career.skills as required skills.
   */
  buildSkillGap(userSkills, careerSkills) {
    const normalizedUserSkills = this.normalizeSkills(userSkills);

    const normalizedCareerSkills = this.normalizeSkills(careerSkills);

    const userSkillMap = new Map(
      normalizedUserSkills.map((skill) => [skill.toLowerCase(), skill]),
    );

    const matchedSkills = [];

    const missingSkills = [];

    normalizedCareerSkills.forEach((requiredSkill) => {
      const normalizedRequiredSkill = requiredSkill.toLowerCase();

      if (userSkillMap.has(normalizedRequiredSkill)) {
        matchedSkills.push(userSkillMap.get(normalizedRequiredSkill));
      } else {
        missingSkills.push(requiredSkill);
      }
    });

    const totalRequiredSkills = normalizedCareerSkills.length;

    const skillMatchPercentage =
      totalRequiredSkills === 0
        ? 0
        : Math.round((matchedSkills.length / totalRequiredSkills) * 100);

    return {
      totalRequiredSkills,

      matchedSkills,

      missingSkills,

      skillMatchPercentage,
    };
  }

  /**
   * ============================================================
   * BUILD PERSONALIZED PHASES
   * ============================================================
   */

  buildPhases(career, progress) {
    const rawPhases = Array.isArray(career.roadmap) ? career.roadmap : [];

    const completedTopics = new Set(
      (progress?.completedTopics || [])
        .filter(Boolean)
        .map((topic) => this.normalizeTopic(topic)),
    );

    return rawPhases.map((phase, index) => {
      const topics = this.getPhaseTopics(phase);

      const projects = this.getPhaseProjects(phase);

      const interviewTopics = this.getPhaseInterviewTopics(phase);

      const completedPhaseTopics = topics.filter((topic) =>
        completedTopics.has(this.normalizeTopic(topic)),
      );

      const pendingPhaseTopics = topics.filter(
        (topic) => !completedTopics.has(this.normalizeTopic(topic)),
      );

      const totalTopics = topics.length;

      const completion =
        totalTopics === 0
          ? 0
          : Math.round((completedPhaseTopics.length / totalTopics) * 100);

      return {
        phase: Number(phase.phase) || index + 1,

        title: phase.title || `Phase ${index + 1}`,

        duration: phase.duration || "",

        topics,

        projects,

        interviewTopics,

        completedTopics: completedPhaseTopics,

        pendingTopics: pendingPhaseTopics,

        completion,

        status: "locked",

        action: "locked",

        isCurrent: false,
      };
    });
  }

  /**
   * ============================================================
   * APPLY PHASE STATUS
   * ============================================================
   */

  applyPhaseStatus(phases) {
    if (!Array.isArray(phases) || phases.length === 0) {
      return phases;
    }

    let activePhaseIndex = phases.findIndex((phase) => phase.completion < 100);

    /*
     * All phases completed.
     * Keep the final phase as current.
     */
    if (activePhaseIndex === -1) {
      activePhaseIndex = phases.length - 1;
    }

    return phases.map((phase, index) => {
      let status = "locked";

      let action = "locked";

      if (phase.completion === 100) {
        status = "completed";

        action = "completed";
      } else if (index === activePhaseIndex) {
        status = "active";

        action = phase.completion > 0 ? "continue" : "start";
      }

      return {
        ...phase,

        status,

        action,

        isCurrent: index === activePhaseIndex,
      };
    });
  }

  /**
   * ============================================================
   * GET CURRENT PHASE
   * ============================================================
   */

  getCurrentPhase(phases) {
    if (!Array.isArray(phases) || phases.length === 0) {
      return 1;
    }

    const currentPhase = phases.find((phase) => phase.isCurrent);

    return currentPhase
      ? Number(currentPhase.phase) || 1
      : Number(phases[0].phase) || 1;
  }

  /**
   * ============================================================
   * GET OVERALL COMPLETION
   * ============================================================
   */

  calculateOverallCompletion(phases, completedTopics) {
    const totalTopics = phases.reduce(
      (total, phase) => total + phase.topics.length,
      0,
    );

    if (totalTopics === 0) {
      return 0;
    }

    const completedTopicSet = new Set(
      (completedTopics || [])
        .filter(Boolean)
        .map((topic) => this.normalizeTopic(topic)),
    );

    let completedCount = 0;

    phases.forEach((phase) => {
      phase.topics.forEach((topic) => {
        if (completedTopicSet.has(this.normalizeTopic(topic))) {
          completedCount += 1;
        }
      });
    });

    return Math.min(100, Math.round((completedCount / totalTopics) * 100));
  }

  /**
   * ============================================================
   * GET NEXT TOPIC
   * ============================================================
   */

  getNextTopic(phases) {
    if (!Array.isArray(phases)) {
      return null;
    }

    const currentPhase = phases.find((phase) => phase.isCurrent);

    if (!currentPhase) {
      return null;
    }

    return currentPhase.pendingTopics?.[0] || null;
  }

  /**
   * ============================================================
   * GET NEXT PROJECT
   * ============================================================
   *
   * Prefer project from current phase.
   */
  getNextProject(phases, progress) {
    if (!Array.isArray(phases)) {
      return null;
    }

    const completedProjects = new Set(
      (progress?.completedProjects || [])
        .filter(Boolean)
        .map((project) => this.normalizeTopic(project)),
    );

    const currentPhase = phases.find((phase) => phase.isCurrent);

    if (currentPhase) {
      const currentPhaseProject = currentPhase.projects.find(
        (project) => !completedProjects.has(this.normalizeTopic(project)),
      );

      if (currentPhaseProject) {
        return currentPhaseProject;
      }
    }

    for (const phase of phases) {
      const project = phase.projects.find(
        (item) => !completedProjects.has(this.normalizeTopic(item)),
      );

      if (project) {
        return project;
      }
    }

    return null;
  }

  /**
   * ============================================================
   * GET NEXT INTERVIEW TOPICS
   * ============================================================
   */

  getCurrentInterviewTopics(phases) {
    if (!Array.isArray(phases)) {
      return [];
    }

    const currentPhase = phases.find((phase) => phase.isCurrent);

    return currentPhase?.interviewTopics || [];
  }

  /**
   * ============================================================
   * BUILD NEXT MILESTONE
   * ============================================================
   */

  buildNextMilestone({ nextTopic, currentPhaseData, overallCompletion }) {
    if (overallCompletion >= 100) {
      return "Learning Path Completed";
    }

    if (nextTopic) {
      return `Complete ${nextTopic}`;
    }

    if (currentPhaseData && currentPhaseData.completion === 100) {
      return "Next Phase Unlocked";
    }

    return "Continue Learning";
  }

  /**
   * ============================================================
   * BUILD ROADMAP STATUS
   * ============================================================
   */

  buildStatus(overallCompletion) {
    return overallCompletion >= 100 ? "Completed" : "Active";
  }

  /**
   * ============================================================
   * BUILD READINESS
   * ============================================================
   *
   * This is roadmap-level readiness.
   *
   * It combines:
   *
   * - roadmap completion
   * - skill match
   * - project completion
   * - interview preparation
   *
   * It is intentionally simple and transparent.
   */
  buildReadiness({
    overallCompletion,
    skillMatchPercentage,
    totalProjects,
    completedProjects,
    totalInterviewTopics,
    completedInterviewTopics,
  }) {
    const roadmapScore = Number(overallCompletion || 0);

    const skillScore = Number(skillMatchPercentage || 0);

    const projectScore =
      totalProjects === 0
        ? 0
        : Math.round((completedProjects / totalProjects) * 100);

    const interviewScore =
      totalInterviewTopics === 0
        ? 0
        : Math.round((completedInterviewTopics / totalInterviewTopics) * 100);

    /*
     * If a category has no data,
     * redistribute its weight.
     */
    const components = [];

    if (totalProjects > 0) {
      components.push({
        score: projectScore,
        weight: 20,
      });
    }

    if (totalInterviewTopics > 0) {
      components.push({
        score: interviewScore,
        weight: 15,
      });
    }

    components.push({
      score: roadmapScore,
      weight: 40,
    });

    components.push({
      score: skillScore,
      weight: 25,
    });

    const totalWeight = components.reduce((sum, item) => sum + item.weight, 0);

    const weightedScore =
      totalWeight === 0
        ? 0
        : Math.round(
            components.reduce(
              (sum, item) => sum + item.score * item.weight,
              0,
            ) / totalWeight,
          );

    let level = "Needs Improvement";

    if (weightedScore >= 85) {
      level = "Placement Ready";
    } else if (weightedScore >= 70) {
      level = "Strong Progress";
    } else if (weightedScore >= 50) {
      level = "Developing";
    }

    return {
      score: weightedScore,

      level,

      roadmapCompletion: roadmapScore,

      skillMatch: skillScore,

      projectCompletion: projectScore,

      interviewPreparation: interviewScore,
    };
  }

  /**
   * ============================================================
   * GENERATE TODAY'S PLAN
   * ============================================================
   */

  generateTodayPlan({
    currentPhaseData,
    nextTopic,
    dailyStudyHours,
    learningStyle,
  }) {
    if (!currentPhaseData || !nextTopic) {
      return {
        available: false,

        title: "Learning Path Completed",

        totalMinutes: 0,

        totalHours: 0,

        tasks: [],
      };
    }

    const safeStudyHours =
      Number(dailyStudyHours) > 0 ? Number(dailyStudyHours) : 2;

    const totalMinutes = Math.max(30, Math.round(safeStudyHours * 60));

    let learnMinutes = Math.round(totalMinutes * 0.45);

    let practiceMinutes = Math.round(totalMinutes * 0.3);

    let revisionMinutes = Math.round(totalMinutes * 0.15);

    let projectMinutes =
      totalMinutes - learnMinutes - practiceMinutes - revisionMinutes;

    /*
     * Learning style adjustment.
     */

    if (learningStyle === "practical") {
      practiceMinutes += 10;

      learnMinutes -= 5;

      revisionMinutes -= 5;
    }

    if (learningStyle === "reading") {
      learnMinutes += 10;

      practiceMinutes -= 5;

      revisionMinutes -= 5;
    }

    if (learningStyle === "visual") {
      learnMinutes += 5;

      revisionMinutes += 5;

      practiceMinutes -= 10;
    }

    learnMinutes = Math.max(10, learnMinutes);

    practiceMinutes = Math.max(10, practiceMinutes);

    revisionMinutes = Math.max(5, revisionMinutes);

    projectMinutes = Math.max(0, projectMinutes);

    const tasks = [
      {
        order: 1,

        type: "learn",

        title: `Learn ${nextTopic}`,

        topic: nextTopic,

        durationMinutes: learnMinutes,

        completed: false,
      },

      {
        order: 2,

        type: "practice",

        title: `Practice ${nextTopic}`,

        topic: nextTopic,

        durationMinutes: practiceMinutes,

        completed: false,
      },

      {
        order: 3,

        type: "revision",

        title: `Revise ${nextTopic}`,

        topic: nextTopic,

        durationMinutes: revisionMinutes,

        completed: false,
      },
    ];

    if (projectMinutes >= 10) {
      tasks.push({
        order: 4,

        type: "project",

        title: "Apply what you learned",

        topic: nextTopic,

        durationMinutes: projectMinutes,

        completed: false,
      });
    }

    return {
      available: true,

      title: "Today's Learning Plan",

      phase: currentPhaseData.phase,

      phaseTitle: currentPhaseData.title,

      topic: nextTopic,

      totalMinutes,

      totalHours: safeStudyHours,

      learningStyle: learningStyle || "mixed",

      tasks,
    };
  }

  /**
   * ============================================================
   * GET PERSONALIZED ROADMAP
   * ============================================================
   */

  async getRoadmap(userId, careerId = null) {
    if (!userId) {
      throw new Error("User ID is required.");
    }

    /*
     * ----------------------------------------------------------
     * GET USER
     * ----------------------------------------------------------
     */

    const user = await User.findById(userId).lean();

    if (!user) {
      throw new Error("User not found.");
    }

    /*
     * ----------------------------------------------------------
     * DETERMINE CAREER
     * ----------------------------------------------------------
     *
     * Explicit careerId has priority.
     *
     * Otherwise use user's selectedCareer.
     */

    let careerIdentifier = careerId || null;

    if (!careerIdentifier && user.selectedCareer) {
      careerIdentifier = user.selectedCareer;
    }

    if (!careerIdentifier) {
      throw new Error("No career selected. Please select a career first.");
    }

    /*
     * ----------------------------------------------------------
     * GET CAREER
     * ----------------------------------------------------------
     */

    const career = await this.findCareer(careerIdentifier);

    const normalizedCareerId = this.getCareerIdentifier(career);

    /*
     * ----------------------------------------------------------
     * USER PROFILE
     * ----------------------------------------------------------
     */

    const onboarding = user.onboarding || {};

    const professional = user.professional || {};

    const placement = user.placement || {};

    const aiProfile = user.aiProfile || {};

    const dailyStudyHours = Number(aiProfile.dailyStudyHours) || 2;

    const learningStyle = user.learningStyle || "mixed";

    const placementFocus = user.placementFocus || "both";

    const experienceLevel = professional.experienceLevel || "beginner";

    const currentSituation = onboarding.currentSituation || "";

    const careerGoal = onboarding.careerGoal || "";

    const interests = Array.isArray(onboarding.interests)
      ? onboarding.interests
      : [];

    const skills = this.normalizeSkills(professional.skills);

    const targetRole = placement.targetRole || "";

    const dreamCompany = placement.dreamCompany || "";

    /*
     * ----------------------------------------------------------
     * GET / INITIALIZE LEARNING PROGRESS
     * ----------------------------------------------------------
     *
     * LearningProgressService still handles
     * the actual progress persistence.
     */

    let progress = await LearningProgressService.getProgress(
      userId,
      normalizedCareerId,
    );

    if (!progress) {
      /*
       * We intentionally initialize through the
       * existing service.
       *
       * The service will be upgraded next so
       * that it also uses MongoDB Career.
       */
      progress = await LearningProgressService.initializeProgress(
        userId,
        normalizedCareerId,
        {
          phases: career.roadmap || [],
        },
      );
    }

    /*
     * ----------------------------------------------------------
     * BUILD PHASES
     * ----------------------------------------------------------
     */

    let phases = this.buildPhases(career, progress);

    phases = this.applyPhaseStatus(phases);

    /*
     * ----------------------------------------------------------
     * COMPLETED / PENDING TOPICS
     * ----------------------------------------------------------
     */

    const allTopics = phases.flatMap((phase) => phase.topics);

    const allCompletedTopics = phases.flatMap((phase) => phase.completedTopics);

    const allPendingTopics = phases.flatMap((phase) => phase.pendingTopics);

    /*
     * ----------------------------------------------------------
     * OVERALL COMPLETION
     * ----------------------------------------------------------
     */

    const overallCompletion = this.calculateOverallCompletion(
      phases,
      allCompletedTopics,
    );

    /*
     * ----------------------------------------------------------
     * CURRENT PHASE
     * ----------------------------------------------------------
     */

    const currentPhase = this.getCurrentPhase(phases);

    const currentPhaseData = phases.find((phase) => phase.isCurrent) || null;

    /*
     * ----------------------------------------------------------
     * NEXT TOPIC
     * ----------------------------------------------------------
     */

    const nextTopic = this.getNextTopic(phases);

    /*
     * ----------------------------------------------------------
     * NEXT PROJECT
     * ----------------------------------------------------------
     */

    const nextProject = this.getNextProject(phases, progress);

    /*
     * ----------------------------------------------------------
     * INTERVIEW TOPICS
     * ----------------------------------------------------------
     */

    const currentInterviewTopics = this.getCurrentInterviewTopics(phases);

    const allInterviewTopics = this.getAllInterviewTopics(career);

    /*
     * ----------------------------------------------------------
     * PROJECT DATA
     * ----------------------------------------------------------
     */

    const allProjects = this.getAllRoadmapProjects(career);

    const completedProjects = Array.isArray(progress.completedProjects)
      ? progress.completedProjects
      : [];

    /*
     * ----------------------------------------------------------
     * SKILL GAP
     * ----------------------------------------------------------
     */

    const skillGap = this.buildSkillGap(skills, career.skills || []);

    /*
     * ----------------------------------------------------------
     * INTERVIEW COMPLETION
     * ----------------------------------------------------------
     *
     * Current LearningProgress model does not
     * have completedInterviewTopics.
     *
     * Therefore we keep this at 0 for now.
     *
     * This can be connected later when
     * Interview Preparation gets its own progress model.
     */

    const completedInterviewTopics = 0;

    /*
     * ----------------------------------------------------------
     * READINESS
     * ----------------------------------------------------------
     */

    const readiness = this.buildReadiness({
      overallCompletion,

      skillMatchPercentage: skillGap.skillMatchPercentage,

      totalProjects: allProjects.length,

      completedProjects: completedProjects.length,

      totalInterviewTopics: allInterviewTopics.length,

      completedInterviewTopics,
    });

    /*
     * ----------------------------------------------------------
     * NEXT MILESTONE
     * ----------------------------------------------------------
     */

    const nextMilestone = this.buildNextMilestone({
      nextTopic,

      currentPhaseData,

      overallCompletion,
    });

    /*
     * ----------------------------------------------------------
     * STATUS
     * ----------------------------------------------------------
     */

    const status = this.buildStatus(overallCompletion);

    /*
     * ----------------------------------------------------------
     * TODAY'S PLAN
     * ----------------------------------------------------------
     */

    const todayPlan = this.generateTodayPlan({
      currentPhaseData,

      nextTopic,

      dailyStudyHours,

      learningStyle,
    });

    /*
     * ----------------------------------------------------------
     * SYNC LEARNING PROGRESS
     * ----------------------------------------------------------
     *
     * Existing LearningProgressService remains
     * responsible for its own synchronization.
     *
     * We update the values that are already
     * supported by the model.
     */

    let progressChanged = false;

    if (progress.overallCompletion !== overallCompletion) {
      progress.overallCompletion = overallCompletion;

      progressChanged = true;
    }

    if (progress.currentPhase !== currentPhase) {
      progress.currentPhase = currentPhase;

      progressChanged = true;
    }

    if (progress.nextMilestone !== nextMilestone) {
      progress.nextMilestone = nextMilestone;

      progressChanged = true;
    }

    if (progress.status !== status) {
      progress.status = status;

      progressChanged = true;
    }

    /*
     * Save only when something changed.
     */

    if (progressChanged) {
      await progress.save();
    }

    /*
     * ----------------------------------------------------------
     * CAREER CATEGORY
     * ----------------------------------------------------------
     */

    const category = career.category || null;

    /*
     * ----------------------------------------------------------
     * FINAL RESPONSE
     * ----------------------------------------------------------
     */

    return {
      /*
       * --------------------------------------------------------
       * Career
       * --------------------------------------------------------
       */

      career: career.name || "",

      careerId: career.careerId || career.slug || String(career._id),

      careerMongoId: career._id ? String(career._id) : null,

      slug: career.slug || "",

      description: career.description || "",

      category:
        typeof category === "object" ? category.name || "" : category || "",

      categoryDetails: typeof category === "object" ? category : null,

      difficulty: career.difficulty || "",

      estimatedDuration: career.estimatedDuration || "",

      /*
       * --------------------------------------------------------
       * Career Information
       * --------------------------------------------------------
       */

      careerInfo: {
        averageSalary: career.averageSalary || "",

        growthRate: career.growthRate || "",

        demand: career.demand || "",

        eligibility: Array.isArray(career.eligibility)
          ? career.eligibility
          : [],

        tags: Array.isArray(career.tags) ? career.tags : [],
      },

      /*
       * --------------------------------------------------------
       * User Personalization
       * --------------------------------------------------------
       */

      userProfile: {
        currentSituation,

        careerGoal,

        interests,

        learningStyle,

        dailyStudyHours,

        experienceLevel,

        skills,

        placementFocus,

        targetRole,

        dreamCompany,
      },

      /*
       * --------------------------------------------------------
       * Skill Gap
       * --------------------------------------------------------
       */

      skillGap,

      /*
       * --------------------------------------------------------
       * Progress
       * --------------------------------------------------------
       */

      overallCompletion,

      completedTopics: allCompletedTopics,

      pendingTopics: allPendingTopics,

      currentPhase,

      nextTopic,

      nextMilestone,

      status,

      /*
       * --------------------------------------------------------
       * Readiness
       * --------------------------------------------------------
       */

      readiness,

      /*
       * --------------------------------------------------------
       * Today's Plan
       * --------------------------------------------------------
       */

      todayPlan,

      /*
       * --------------------------------------------------------
       * Projects
       * --------------------------------------------------------
       */

      projects: {
        total: allProjects.length,

        completed: completedProjects,

        pending: allProjects.filter(
          (project) =>
            !completedProjects.some(
              (completedProject) =>
                this.normalizeTopic(completedProject) ===
                this.normalizeTopic(project),
            ),
        ),

        next: nextProject,
      },

      /*
       * --------------------------------------------------------
       * Interview Preparation
       * --------------------------------------------------------
       */

      interview: {
        totalTopics: allInterviewTopics.length,

        currentPhaseTopics: currentInterviewTopics,

        allTopics: allInterviewTopics,

        completedTopics: completedInterviewTopics,

        completion:
          allInterviewTopics.length === 0
            ? 0
            : Math.round(
                (completedInterviewTopics / allInterviewTopics.length) * 100,
              ),
      },

      /*
       * --------------------------------------------------------
       * Phases
       * --------------------------------------------------------
       */

      phases,

      /*
       * --------------------------------------------------------
       * Journey Summary
       * --------------------------------------------------------
       */

      journey: {
        totalPhases: phases.length,

        completedPhases: phases.filter((phase) => phase.status === "completed")
          .length,

        currentPhase,

        totalTopics: allTopics.length,

        completedTopics: allCompletedTopics.length,

        pendingTopics: allPendingTopics.length,

        totalProjects: allProjects.length,

        totalInterviewTopics: allInterviewTopics.length,
      },
    };
  }
}

module.exports = new RoadmapService();
