const LearningProgress = require("../models/LearningProgress");
const NotificationService = require("./NotificationService");

class LearningProgressService {
  /**
   * Initialize User Learning Progress
   */
  async initializeProgress(userId, careerId, learningPath = null) {
    console.log("===== INITIALIZE LEARNING PROGRESS =====");

    console.log("userId:", userId);
    console.log("careerId:", careerId);
    console.log("learningPath:", learningPath);

    if (!userId) {
      throw new Error("User ID is required.");
    }

    if (!careerId) {
      throw new Error("Career ID is required.");
    }

    // Check existing progress
    let progress = await LearningProgress.findOne({
      user: userId,
      careerId: String(careerId),
    });

    if (progress) {
      console.log("Existing Learning Progress Found:", progress._id);

      return progress;
    }

    // ==========================================
    // Extract pending topics
    // ==========================================

    let pendingTopics = [];

    if (learningPath) {
      // Case 1:
      // learningPath.pendingTopics
      if (Array.isArray(learningPath.pendingTopics)) {
        pendingTopics.push(...learningPath.pendingTopics);
      }

      // Case 2:
      // learningPath.topics
      if (Array.isArray(learningPath.topics)) {
        pendingTopics.push(...learningPath.topics);
      }

      // Case 3:
      // learningPath.phases
      if (Array.isArray(learningPath.phases)) {
        learningPath.phases.forEach((phase) => {
          if (Array.isArray(phase.pendingTopics)) {
            pendingTopics.push(...phase.pendingTopics);
          }

          // Fallback if phase only has topics
          if (Array.isArray(phase.topics)) {
            pendingTopics.push(...phase.topics);
          }
        });
      }
    }

    // Remove duplicate topics
    pendingTopics = [
      ...new Set(
        pendingTopics
          .filter(Boolean)
          .map((topic) => String(topic).trim())
          .filter(Boolean),
      ),
    ];

    console.log("Pending Topics:", pendingTopics);

    // ==========================================
    // Create Learning Progress
    // ==========================================

    progress = await LearningProgress.create({
      user: userId,

      careerId: String(careerId),

      currentPhase: 1,

      completedTopics: [],

      pendingTopics,

      completedProjects: [],

      currentStreak: 0,

      totalStudyHours: 0,

      overallCompletion: 0,

      nextMilestone: pendingTopics[0] || "Learning Path Started",

      status: "Active",
    });

    console.log("Learning Progress Created:", progress._id);

    return progress;
  }

  /**
   * Get User Progress
   */
  async getProgress(userId, careerId) {
    return await LearningProgress.findOne({
      user: userId,
      careerId: String(careerId),
    });
  }

  /**
   * Calculate Completion Percentage
   */
  calculateCompletion(progress) {
    const completed = progress.completedTopics.length;

    const pending = progress.pendingTopics.length;

    const total = completed + pending;

    if (total === 0) {
      return 0;
    }

    return Math.round((completed / total) * 100);
  }

  /**
   * Complete Learning Topic
   */
  async completeTopic(userId, careerId, topic) {
  const progress = await this.getProgress(userId, careerId);

  if (!progress) {
    throw new Error("Learning progress not found.");
  }

  if (!topic || !String(topic).trim()) {
    throw new Error("Topic is required.");
  }

  topic = String(topic).trim();

  // Check whether topic is actually pending
  const isPending = progress.pendingTopics.includes(topic);

  if (!isPending) {
    throw new Error("Topic is not pending or already completed.");
  }

  // Add to completed topics
  if (!progress.completedTopics.includes(topic)) {
    progress.completedTopics.push(topic);
  }

  // Remove from pending topics
  progress.pendingTopics = progress.pendingTopics.filter(
    (item) => item !== topic,
  );

  // Update completion
  progress.overallCompletion =
    this.calculateCompletion(progress);

  // Update phase
  this.updateCurrentPhase(progress);

  // Update next milestone
  progress.nextMilestone =
    progress.pendingTopics[0] ||
    "Learning Path Completed";

  // Update status
  if (progress.pendingTopics.length === 0) {
    progress.status = "Completed";
  }

  await progress.save();

  // ==========================================
  // Create Notification
  // ==========================================

  try {
    await NotificationService.createNotification({
      userId,
      type: "topic_completed",
      title: "Topic Completed 🎉",
      message: `You completed "${topic}". Keep learning and continue with your next topic.`,
      relatedTopic: topic,
    });
  } catch (error) {
    // Notification failure should NOT break learning progress
    console.error(
      "Notification creation failed:",
      error.message,
    );
  }

  return progress;
}

  /**
   * Complete Today's Learning Plan
   */
  async completeTodayPlan(userId, careerId) {
    const progress = await this.getProgress(userId, careerId);

    if (!progress) {
      throw new Error("Learning progress not found.");
    }

    if (progress.pendingTopics.length === 0) {
      throw new Error("No pending topics remaining.");
    }

    const todayTopic = progress.pendingTopics[0];

    return await this.completeTopic(userId, careerId, todayTopic);
  }

  /**
   * Update Current Phase
   */
  updateCurrentPhase(progress) {
    const completed = progress.completedTopics.length;

    if (completed >= 3) {
      progress.currentPhase = 2;
    }

    if (completed >= 6) {
      progress.currentPhase = 3;
    }

    if (completed >= 9) {
      progress.currentPhase = 4;
    }

    if (completed >= 12) {
      progress.currentPhase = 5;
    }
  }

  /**
   * Update Study Hours
   */
  async updateStudyHours(userId, careerId, hours) {
    const progress = await this.getProgress(userId, careerId);

    if (!progress) {
      throw new Error("Learning progress not found.");
    }

    progress.totalStudyHours += Number(hours) || 0;

    progress.lastStudyDate = new Date();

    await progress.save();

    return progress;
  }

  /**
   * Update Streak
   */
  async updateStreak(userId, careerId) {
    const progress = await this.getProgress(userId, careerId);

    if (!progress) {
      throw new Error("Learning progress not found.");
    }

    progress.currentStreak += 1;

    progress.lastStudyDate = new Date();

    await progress.save();

    return progress;
  }
}

module.exports = new LearningProgressService();
