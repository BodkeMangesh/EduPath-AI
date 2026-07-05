const LearningProgress = require("../models/LearningProgress");

class LearningProgressService {
  /**
   * Initialize User Learning Progress
   */
  async initializeProgress(userId, learningPath, careerId) {
    console.log("User:", userId);
    console.log("Career:", careerId);

    const existingProgress = await LearningProgress.findOne({
      user: userId,
      careerId,
    });

    console.log("Existing Progress:", existingProgress);

    if (existingProgress) {
      return existingProgress;
    }

    const pendingTopics = [];

    learningPath.phases.forEach((phase) => {
      pendingTopics.push(...phase.pendingTopics);
    });

    console.log("Pending Topics:", pendingTopics);

    const progress = await LearningProgress.create({
      user: userId,
      careerId,
      currentPhase: 1,
      completedTopics: [],
      pendingTopics,
      completedProjects: [],
      currentStreak: 0,
      totalStudyHours: 0,
      overallCompletion: 0,
      nextMilestone: learningPath.nextTopic,
    });

    console.log("Created Progress:", progress);

    return progress;
  }

  /**
   * Get User Progress
   */
  async getProgress(userId, careerId) {
    return await LearningProgress.findOne({
      user: userId,
      careerId,
    });
  }

  /**
   * Calculate Completion Percentage
   */
  calculateCompletion(progress) {
    const completed = progress.completedTopics.length;

    const total = completed + progress.pendingTopics.length;

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

    if (!progress.completedTopics.includes(topic)) {
      progress.completedTopics.push(topic);
    }

    progress.pendingTopics = progress.pendingTopics.filter(
      (item) => item !== topic,
    );

    progress.overallCompletion = this.calculateCompletion(progress);
    this.updateCurrentPhase(progress);

    progress.nextMilestone =
      progress.pendingTopics[0] || "Learning Path Completed";

    await progress.save();

    return progress;
  }

  /**
   * Update Current Phase
   */
  updateCurrentPhase(progress, learningPath) {
    const completed = progress.completedTopics.length;

    if (completed >= 3) progress.currentPhase = 2;

    if (completed >= 6) progress.currentPhase = 3;

    if (completed >= 9) progress.currentPhase = 4;

    if (completed >= 12) progress.currentPhase = 5;
  }

  async updateStudyHours(userId, careerId, hours) {
    const progress = await this.getProgress(userId, careerId);

    progress.totalStudyHours += hours;

    progress.lastStudyDate = new Date();

    await progress.save();

    return progress;
  }

  async updateStreak(userId, careerId) {
    const progress = await this.getProgress(userId, careerId);

    progress.currentStreak += 1;

    progress.lastStudyDate = new Date();

    await progress.save();

    return progress;
  }
}

module.exports = new LearningProgressService();
