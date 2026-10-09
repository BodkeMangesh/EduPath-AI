const mongoose = require("mongoose");

const LearningProgress = require("../models/LearningProgress");
const NotificationService = require("./NotificationService");
const Career = require("../models/Career");

class LearningProgressService {
  /*
  |--------------------------------------------------------------------------
  | NORMALIZE CAREER IDENTIFIER
  |--------------------------------------------------------------------------
  */

  normalizeCareerId(careerId) {
    if (!careerId) {
      throw new Error("Career ID is required.");
    }

    const normalizedCareerId = String(careerId).trim();

    if (!normalizedCareerId) {
      throw new Error("Career ID is required.");
    }

    return normalizedCareerId.toLowerCase();
  }

  /*
  |--------------------------------------------------------------------------
  | NORMALIZE TOPIC
  |--------------------------------------------------------------------------
  */

  normalizeTopic(topic) {
    if (!topic || !String(topic).trim()) {
      throw new Error("Topic is required.");
    }

    return String(topic).trim();
  }

  /*
  |--------------------------------------------------------------------------
  | NORMALIZE PROJECT
  |--------------------------------------------------------------------------
  */

  normalizeProject(project) {
    if (!project || !String(project).trim()) {
      throw new Error("Project is required.");
    }

    return String(project).trim();
  }

  /*
  |--------------------------------------------------------------------------
  | FIND CAREER
  |--------------------------------------------------------------------------
  |
  | Supports:
  |
  | 1. MongoDB ObjectId
  | 2. Career.careerId
  | 3. Career.slug
  |
  | MongoDB Career is the single source of truth.
  |
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
     * MongoDB ObjectId
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
     * careerId / slug
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

    return career;
  }

  /*
  |--------------------------------------------------------------------------
  | GET CANONICAL CAREER IDENTIFIER
  |--------------------------------------------------------------------------
  */

  getCareerIdentifier(career) {
    if (!career) {
      throw new Error("Career is required.");
    }

    /*
     * Priority:
     *
     * career.careerId
     * ↓
     * career.slug
     * ↓
     * MongoDB _id
     */

    return String(career.careerId || career.slug || career._id || "")
      .trim()
      .toLowerCase();
  }

  /*
  |--------------------------------------------------------------------------
  | GET CAREER ROADMAP
  |--------------------------------------------------------------------------
  */

  async getCareerRoadmap(careerId) {
    return await this.findCareer(careerId);
  }

  /*
  |--------------------------------------------------------------------------
  | GET PHASE TOPICS
  |--------------------------------------------------------------------------
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

  /*
  |--------------------------------------------------------------------------
  | GET PHASE PROJECTS
  |--------------------------------------------------------------------------
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

  /*
  |--------------------------------------------------------------------------
  | GET PHASE INTERVIEW TOPICS
  |--------------------------------------------------------------------------
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

  /*
  |--------------------------------------------------------------------------
  | GET ALL ROADMAP TOPICS
  |--------------------------------------------------------------------------
  */

  async getAllRoadmapTopics(careerId) {
    const career = await this.getCareerRoadmap(careerId);

    if (!Array.isArray(career.roadmap)) {
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

  /*
  |--------------------------------------------------------------------------
  | GET ALL ROADMAP PROJECTS
  |--------------------------------------------------------------------------
  */

  async getAllRoadmapProjects(careerId) {
    const career = await this.getCareerRoadmap(careerId);

    if (!Array.isArray(career.roadmap)) {
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

  /*
  |--------------------------------------------------------------------------
  | GET ALL INTERVIEW TOPICS
  |--------------------------------------------------------------------------
  */

  async getAllInterviewTopics(careerId) {
    const career = await this.getCareerRoadmap(careerId);

    if (!Array.isArray(career.roadmap)) {
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

  /*
  |--------------------------------------------------------------------------
  | FIND EXISTING PROGRESS
  |--------------------------------------------------------------------------
  |
  | Internal helper.
  |
  | IMPORTANT:
  | We keep this separate from getProgress()
  | because getProgress() can auto-initialize.
  |
  */

  async findExistingProgress(userId, careerId) {
    if (!userId) {
      throw new Error("User ID is required.");
    }

    const normalizedCareerId = this.normalizeCareerId(careerId);

    /*
     * First try exact canonical identifier.
     */

    let progress = await LearningProgress.findOne({
      user: userId,
      careerId: normalizedCareerId,
    });

    if (progress) {
      return progress;
    }

    /*
     * ----------------------------------------------------------
     * Backward compatibility
     * ----------------------------------------------------------
     *
     * Some old progress records may have been stored using
     * MongoDB ObjectId while newer records use careerId/slug.
     *
     * If the identifier is an ObjectId, try the raw ObjectId
     * representation as well.
     */

    if (mongoose.Types.ObjectId.isValid(normalizedCareerId)) {
      progress = await LearningProgress.findOne({
        user: userId,
        careerId: String(normalizedCareerId),
      });
    }

    return progress;
  }

  /*
  |--------------------------------------------------------------------------
  | GET USER LEARNING PROGRESS
  |--------------------------------------------------------------------------
  |
  | IMPORTANT:
  |
  | If progress does not exist, automatically initialize it.
  |
  | This fixes:
  |
  | GET /api/v1/learning-progress/:careerId
  | 500 Learning progress not found
  |
  */

  async getProgress(userId, careerId) {
    if (!userId) {
      throw new Error("User ID is required.");
    }

    const normalizedCareerId = this.normalizeCareerId(careerId);

    /*
     * ----------------------------------------------------------
     * Resolve actual Career first
     * ----------------------------------------------------------
     */

    const career = await this.getCareerRoadmap(normalizedCareerId);

    const actualCareerId = this.getCareerIdentifier(career);

    /*
     * ----------------------------------------------------------
     * Find existing progress using canonical identifier
     * ----------------------------------------------------------
     */

    let progress = await this.findExistingProgress(userId, actualCareerId);

    /*
     * ----------------------------------------------------------
     * Backward compatibility:
     * try requested identifier too
     * ----------------------------------------------------------
     */

    if (!progress && actualCareerId !== normalizedCareerId) {
      progress = await this.findExistingProgress(userId, normalizedCareerId);
    }

    /*
     * ----------------------------------------------------------
     * AUTO INITIALIZE
     * ----------------------------------------------------------
     */

    if (!progress) {
      progress = await this.initializeProgress(userId, actualCareerId);
    } else {
      /*
       * Keep old progress synchronized with
       * current Career roadmap.
       */

      await this.synchronizeProgress(progress, actualCareerId);

      await progress.save();
    }

    return progress;
  }

  /*
  |--------------------------------------------------------------------------
  | INITIALIZE USER LEARNING PROGRESS
  |--------------------------------------------------------------------------
  */

  async initializeProgress(userId, careerId, learningPath = null) {
    if (!userId) {
      throw new Error("User ID is required.");
    }

    const normalizedCareerId = this.normalizeCareerId(careerId);

    /*
     * ----------------------------------------------------------
     * Validate actual MongoDB Career
     * ----------------------------------------------------------
     */

    const career = await this.getCareerRoadmap(normalizedCareerId);

    const actualCareerId = this.getCareerIdentifier(career);

    /*
     * ----------------------------------------------------------
     * Check existing progress DIRECTLY
     *
     * Do NOT call getProgress() here because getProgress()
     * itself can initialize.
     * ----------------------------------------------------------
     */

    let progress = await this.findExistingProgress(userId, actualCareerId);

    /*
     * Backward compatibility
     */

    if (!progress && actualCareerId !== normalizedCareerId) {
      progress = await this.findExistingProgress(userId, normalizedCareerId);
    }

    /*
     * ----------------------------------------------------------
     * Existing progress
     * ----------------------------------------------------------
     */

    if (progress) {
      await this.synchronizeProgress(progress, actualCareerId);

      await progress.save();

      return progress;
    }

    /*
     * ----------------------------------------------------------
     * Actual roadmap topics
     * ----------------------------------------------------------
     */

    const roadmapTopics = await this.getAllRoadmapTopics(actualCareerId);

    /*
     * ----------------------------------------------------------
     * Backward-compatible learning path
     * ----------------------------------------------------------
     */

    let learningPathTopics = [];

    if (learningPath) {
      if (Array.isArray(learningPath.pendingTopics)) {
        learningPathTopics.push(...learningPath.pendingTopics);
      }

      if (Array.isArray(learningPath.topics)) {
        learningPathTopics.push(...learningPath.topics);
      }

      if (Array.isArray(learningPath.phases)) {
        learningPath.phases.forEach((phase) => {
          if (Array.isArray(phase.topics)) {
            learningPathTopics.push(...phase.topics);
          }

          if (Array.isArray(phase.pendingTopics)) {
            learningPathTopics.push(...phase.pendingTopics);
          }
        });
      }
    }

    /*
     * ----------------------------------------------------------
     * Determine pending topics
     * ----------------------------------------------------------
     *
     * MongoDB Career roadmap has priority.
     */

    const pendingTopics =
      roadmapTopics.length > 0
        ? roadmapTopics
        : [
            ...new Set(
              learningPathTopics
                .filter(Boolean)
                .map((topic) => String(topic).trim())
                .filter(Boolean),
            ),
          ];

    /*
     * ----------------------------------------------------------
     * Create progress
     * ----------------------------------------------------------
     */

    try {
      progress = await LearningProgress.create({
        user: userId,

        careerId: actualCareerId,

        currentPhase: 1,

        completedTopics: [],

        pendingTopics,

        completedProjects: [],

        currentStreak: 0,

        totalStudyHours: 0,

        overallCompletion: 0,

        nextMilestone: pendingTopics[0] || "Learning Path Started",

        status: pendingTopics.length > 0 ? "Active" : "Completed",

        lastStudyDate: null,
      });
    } catch (error) {
      /*
       * --------------------------------------------------------
       * Race-condition protection
       * --------------------------------------------------------
       *
       * If another request created the progress document
       * at the same time, return that existing document.
       * --------------------------------------------------------
       */

      if (error?.code === 11000) {
        progress = await this.findExistingProgress(userId, actualCareerId);

        if (progress) {
          return progress;
        }
      }

      throw error;
    }

    return progress;
  }

  /*
  |--------------------------------------------------------------------------
  | CALCULATE OVERALL COMPLETION
  |--------------------------------------------------------------------------
  */

  async calculateCompletion(progress, careerId = null) {
    let totalTopics = 0;

    if (careerId) {
      totalTopics = (await this.getAllRoadmapTopics(careerId)).length;
    }

    /*
     * Backward-compatible fallback.
     */

    if (totalTopics === 0) {
      totalTopics =
        (progress.completedTopics || []).length +
        (progress.pendingTopics || []).length;
    }

    if (totalTopics === 0) {
      return 0;
    }

    const completed = new Set(
      (progress.completedTopics || [])
        .filter(Boolean)
        .map((topic) => this.normalizeTopic(topic).toLowerCase()),
    );

    return Math.min(100, Math.round((completed.size / totalTopics) * 100));
  }

  /*
  |--------------------------------------------------------------------------
  | CALCULATE CURRENT PHASE
  |--------------------------------------------------------------------------
  */

  async calculateCurrentPhase(progress, careerId) {
    const career = await this.getCareerRoadmap(careerId);

    const roadmap = Array.isArray(career.roadmap) ? career.roadmap : [];

    if (roadmap.length === 0) {
      return 1;
    }

    const completedTopics = new Set(
      (progress.completedTopics || [])
        .filter(Boolean)
        .map((topic) => this.normalizeTopic(topic).toLowerCase()),
    );

    /*
     * Find first incomplete phase.
     */

    for (const phase of roadmap) {
      const topics = this.getPhaseTopics(phase);

      const hasPendingTopic = topics.some(
        (topic) =>
          !completedTopics.has(this.normalizeTopic(topic).toLowerCase()),
      );

      if (hasPendingTopic) {
        return Number(phase.phase) || 1;
      }
    }

    /*
     * All topics completed.
     */

    return Number(roadmap[roadmap.length - 1].phase) || 1;
  }

  /*
  |--------------------------------------------------------------------------
  | SYNCHRONIZE PROGRESS WITH CAREER ROADMAP
  |--------------------------------------------------------------------------
  */

  async synchronizeProgress(progress, careerId) {
    const career = await this.getCareerRoadmap(careerId);

    const roadmapTopics = await this.getAllRoadmapTopics(careerId);

    /*
     * ----------------------------------------------------------
     * Normalize completed topics
     * ----------------------------------------------------------
     */

    const rawCompletedTopics = Array.isArray(progress.completedTopics)
      ? progress.completedTopics
      : [];

    const normalizedCompleted = [
      ...new Set(
        rawCompletedTopics
          .filter(Boolean)
          .map((topic) => String(topic).trim())
          .filter(Boolean),
      ),
    ];

    /*
     * ----------------------------------------------------------
     * Keep only topics existing in Career roadmap
     * ----------------------------------------------------------
     */

    const validCompletedTopics = normalizedCompleted.filter((completedTopic) =>
      roadmapTopics.some(
        (roadmapTopic) =>
          this.normalizeTopic(roadmapTopic).toLowerCase() ===
          this.normalizeTopic(completedTopic).toLowerCase(),
      ),
    );

    /*
     * ----------------------------------------------------------
     * Generate pending topics
     * ----------------------------------------------------------
     */

    const pendingTopics = roadmapTopics.filter(
      (roadmapTopic) =>
        !validCompletedTopics.some(
          (completedTopic) =>
            this.normalizeTopic(completedTopic).toLowerCase() ===
            this.normalizeTopic(roadmapTopic).toLowerCase(),
        ),
    );

    /*
     * ----------------------------------------------------------
     * Projects
     * ----------------------------------------------------------
     */

    const roadmapProjects = await this.getAllRoadmapProjects(careerId);

    const rawCompletedProjects = Array.isArray(progress.completedProjects)
      ? progress.completedProjects
      : [];

    const validCompletedProjects = [
      ...new Set(
        rawCompletedProjects
          .filter(Boolean)
          .map((project) => String(project).trim())
          .filter(Boolean),
      ),
    ].filter((completedProject) =>
      roadmapProjects.some(
        (roadmapProject) =>
          this.normalizeTopic(roadmapProject).toLowerCase() ===
          this.normalizeTopic(completedProject).toLowerCase(),
      ),
    );

    /*
     * ----------------------------------------------------------
     * Update topics
     * ----------------------------------------------------------
     */

    progress.completedTopics = validCompletedTopics;

    progress.pendingTopics = pendingTopics;

    progress.completedProjects = validCompletedProjects;

    /*
     * ----------------------------------------------------------
     * Current phase
     * ----------------------------------------------------------
     */

    progress.currentPhase = await this.calculateCurrentPhase(
      progress,
      careerId,
    );

    /*
     * ----------------------------------------------------------
     * Overall completion
     * ----------------------------------------------------------
     */

    progress.overallCompletion = await this.calculateCompletion(
      progress,
      careerId,
    );

    /*
     * ----------------------------------------------------------
     * Next milestone
     * ----------------------------------------------------------
     */

    progress.nextMilestone = pendingTopics[0] || "Learning Path Completed";

    /*
     * ----------------------------------------------------------
     * Status
     * ----------------------------------------------------------
     */

    progress.status = pendingTopics.length === 0 ? "Completed" : "Active";

    if (!career) {
      throw new Error("Career roadmap not found.");
    }

    return progress;
  }

  /*
  |--------------------------------------------------------------------------
  | COMPLETE LEARNING TOPIC
  |--------------------------------------------------------------------------
  */

  async completeTopic(userId, careerId, topic) {
    if (!userId) {
      throw new Error("User ID is required.");
    }

    const normalizedCareerId = this.normalizeCareerId(careerId);

    const normalizedTopic = this.normalizeTopic(topic);

    /*
     * ----------------------------------------------------------
     * Get or initialize progress
     * ----------------------------------------------------------
     */

    const progress = await this.getProgress(userId, normalizedCareerId);

    /*
     * ----------------------------------------------------------
     * Validate Career roadmap
     * ----------------------------------------------------------
     */

    const roadmapTopics = await this.getAllRoadmapTopics(normalizedCareerId);

    const roadmapTopic = roadmapTopics.find(
      (item) =>
        this.normalizeTopic(item).toLowerCase() ===
        normalizedTopic.toLowerCase(),
    );

    if (!roadmapTopic) {
      throw new Error("Topic is not part of the current career roadmap.");
    }

    /*
     * ----------------------------------------------------------
     * Already completed
     * ----------------------------------------------------------
     */

    const alreadyCompleted = (progress.completedTopics || []).some(
      (item) =>
        this.normalizeTopic(item).toLowerCase() ===
        normalizedTopic.toLowerCase(),
    );

    if (alreadyCompleted) {
      throw new Error("Topic already completed.");
    }

    /*
     * ----------------------------------------------------------
     * Pending check
     * ----------------------------------------------------------
     */

    const isPending = (progress.pendingTopics || []).some(
      (item) =>
        this.normalizeTopic(item).toLowerCase() ===
        normalizedTopic.toLowerCase(),
    );

    if (!isPending) {
      throw new Error(
        "Topic is not part of the current pending learning path.",
      );
    }

    /*
     * ----------------------------------------------------------
     * Add completed
     * ----------------------------------------------------------
     */

    if (!Array.isArray(progress.completedTopics)) {
      progress.completedTopics = [];
    }

    progress.completedTopics.push(roadmapTopic);

    /*
     * ----------------------------------------------------------
     * Remove pending
     * ----------------------------------------------------------
     */

    progress.pendingTopics = (progress.pendingTopics || []).filter(
      (item) =>
        this.normalizeTopic(item).toLowerCase() !==
        normalizedTopic.toLowerCase(),
    );

    /*
     * ----------------------------------------------------------
     * Synchronize
     * ----------------------------------------------------------
     */

    await this.synchronizeProgress(progress, normalizedCareerId);

    /*
     * ----------------------------------------------------------
     * Study activity
     * ----------------------------------------------------------
     */

    const now = new Date();

    const previousStudyDate = progress.lastStudyDate
      ? new Date(progress.lastStudyDate)
      : null;

    const isSameDay =
      previousStudyDate &&
      previousStudyDate.getFullYear() === now.getFullYear() &&
      previousStudyDate.getMonth() === now.getMonth() &&
      previousStudyDate.getDate() === now.getDate();

    const isYesterday =
      previousStudyDate &&
      (() => {
        const yesterday = new Date(now);

        yesterday.setDate(yesterday.getDate() - 1);

        return (
          previousStudyDate.getFullYear() === yesterday.getFullYear() &&
          previousStudyDate.getMonth() === yesterday.getMonth() &&
          previousStudyDate.getDate() === yesterday.getDate()
        );
      })();

    if (isSameDay) {
      // Do not increment twice on same day.
    } else if (isYesterday) {
      progress.currentStreak = Number(progress.currentStreak || 0) + 1;
    } else {
      progress.currentStreak = 1;
    }

    progress.lastStudyDate = now;

    await progress.save();

    /*
     * ----------------------------------------------------------
     * Notification
     * ----------------------------------------------------------
     */

    try {
      await NotificationService.createNotification({
        userId,

        type: "topic_completed",

        title: "Topic Completed 🎉",

        message: `You completed "${roadmapTopic}". Keep learning and continue with your next topic.`,

        relatedTopic: roadmapTopic,
      });
    } catch (error) {
      console.error("Notification creation failed:", error.message);
    }

    return progress;
  }

  /*
  |--------------------------------------------------------------------------
  | COMPLETE PROJECT
  |--------------------------------------------------------------------------
  */

  async completeProject(userId, careerId, project) {
    if (!userId) {
      throw new Error("User ID is required.");
    }

    const normalizedCareerId = this.normalizeCareerId(careerId);

    const normalizedProject = this.normalizeProject(project);

    /*
     * getProgress() automatically initializes
     * progress when required.
     */

    const progress = await this.getProgress(userId, normalizedCareerId);

    const roadmapProjects =
      await this.getAllRoadmapProjects(normalizedCareerId);

    const roadmapProject = roadmapProjects.find(
      (item) =>
        this.normalizeTopic(item).toLowerCase() ===
        this.normalizeTopic(normalizedProject).toLowerCase(),
    );

    if (!roadmapProject) {
      throw new Error("Project is not part of the current career roadmap.");
    }

    const alreadyCompleted = (progress.completedProjects || []).some(
      (item) =>
        this.normalizeTopic(item).toLowerCase() ===
        this.normalizeTopic(normalizedProject).toLowerCase(),
    );

    if (alreadyCompleted) {
      throw new Error("Project already completed.");
    }

    if (!Array.isArray(progress.completedProjects)) {
      progress.completedProjects = [];
    }

    progress.completedProjects.push(roadmapProject);

    await this.synchronizeProgress(progress, normalizedCareerId);

    progress.lastStudyDate = new Date();

    await progress.save();

    try {
      await NotificationService.createNotification({
        userId,

        type: "project_completed",

        title: "Project Completed 🚀",

        message: `You completed "${roadmapProject}". Great work—keep building your portfolio.`,

        relatedTopic: roadmapProject,
      });
    } catch (error) {
      console.error("Notification creation failed:", error.message);
    }

    return progress;
  }

  /*
  |--------------------------------------------------------------------------
  | COMPLETE TODAY'S LEARNING PLAN
  |--------------------------------------------------------------------------
  */

  async completeTodayPlan(userId, careerId) {
    const normalizedCareerId = this.normalizeCareerId(careerId);

    /*
     * Automatically initialize if required.
     */

    const progress = await this.getProgress(userId, normalizedCareerId);

    await this.synchronizeProgress(progress, normalizedCareerId);

    await progress.save();

    if (progress.pendingTopics.length === 0) {
      throw new Error("No pending topics remaining.");
    }

    const todayTopic = progress.pendingTopics[0];

    return await this.completeTopic(userId, normalizedCareerId, todayTopic);
  }

  /*
  |--------------------------------------------------------------------------
  | UPDATE STUDY HOURS
  |--------------------------------------------------------------------------
  */

  async updateStudyHours(userId, careerId, hours) {
    if (!userId) {
      throw new Error("User ID is required.");
    }

    const normalizedCareerId = this.normalizeCareerId(careerId);

    /*
     * Automatically initialize if required.
     */

    const progress = await this.getProgress(userId, normalizedCareerId);

    const studyHours = Number(hours);

    if (!Number.isFinite(studyHours) || studyHours < 0) {
      throw new Error("Valid study hours are required.");
    }

    progress.totalStudyHours =
      Number(progress.totalStudyHours || 0) + studyHours;

    progress.lastStudyDate = new Date();

    await progress.save();

    return progress;
  }

  /*
  |--------------------------------------------------------------------------
  | UPDATE STREAK
  |--------------------------------------------------------------------------
  */

  async updateStreak(userId, careerId) {
    if (!userId) {
      throw new Error("User ID is required.");
    }

    const normalizedCareerId = this.normalizeCareerId(careerId);

    /*
     * Automatically initialize if required.
     */

    const progress = await this.getProgress(userId, normalizedCareerId);

    const now = new Date();

    const previousStudyDate = progress.lastStudyDate
      ? new Date(progress.lastStudyDate)
      : null;

    /*
     * Same day
     */

    if (previousStudyDate) {
      const sameDay =
        previousStudyDate.getFullYear() === now.getFullYear() &&
        previousStudyDate.getMonth() === now.getMonth() &&
        previousStudyDate.getDate() === now.getDate();

      if (sameDay) {
        return progress;
      }

      /*
       * Yesterday
       */

      const yesterday = new Date(now);

      yesterday.setDate(yesterday.getDate() - 1);

      const wasYesterday =
        previousStudyDate.getFullYear() === yesterday.getFullYear() &&
        previousStudyDate.getMonth() === yesterday.getMonth() &&
        previousStudyDate.getDate() === yesterday.getDate();

      if (wasYesterday) {
        progress.currentStreak = Number(progress.currentStreak || 0) + 1;
      } else {
        progress.currentStreak = 1;
      }
    } else {
      progress.currentStreak = 1;
    }

    progress.lastStudyDate = now;

    await progress.save();

    return progress;
  }

  async getAllRoadmapTopics(careerId) {
    const career = await this.getCareerRoadmap(careerId);

    console.log("===== CAREER ROADMAP DEBUG =====");
    console.log("Career ID:", career?.careerId);
    console.log("Career Slug:", career?.slug);
    console.log("Roadmap:", JSON.stringify(career?.roadmap, null, 2));
    console.log("================================");

    if (!Array.isArray(career.roadmap)) {
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
}

module.exports = new LearningProgressService();
