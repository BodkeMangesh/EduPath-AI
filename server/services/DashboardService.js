const User = require("../models/User");
const LearningProgress = require("../models/LearningProgress");
const Assessment = require("../models/Assessment");

const AIMentorEngine = require("../intelligence/AIMentorEngine");
const DailyLearningEngine = require("../intelligence/DailyLearningEngine");
const CareerReadinessEngine = require("../intelligence/CareerReadinessEngine");

class DashboardService {
  /**
   * Get User Dashboard
   */
  async getDashboard(userId, careerId) {
    const user = await User.findById(userId).select("name email");

    const progress = await LearningProgress.findOne({
      user: userId,
      careerId,
    });

    const latestAssessment = await Assessment.findOne({
      user: userId,
      status: "completed",
    }).sort({ completedAt: -1 });

    if (!progress) {
      throw new Error("Learning progress not found.");
    }

    const readiness = CareerReadinessEngine.calculate(
      progress,
      latestAssessment,
    );

    try {
      mentor = await AIProvider.generate("mentor", context);
    } catch (err) {
      mentor = await AIMentorEngine.generate(progress, context);
    }

    const mentor = await AIMentorEngine.generate(progress, {
      careerReadiness: readiness,
    });

    const dailyPlan = await DailyLearningEngine.generate(progress);

    return {
      user,

      career: progress.careerId,

      overallCompletion: progress.overallCompletion,

      currentPhase: progress.currentPhase,

      studyStreak: progress.currentStreak,

      totalStudyHours: progress.totalStudyHours,

      nextMilestone: progress.nextMilestone,

      completedTopics: progress.completedTopics.length,

      pendingTopics: progress.pendingTopics.length,

      todayTask: progress.pendingTopics[0] || "No task",

      careerReadiness: readiness,

      estimatedCompletion: "Coming Soon",

      mentor,

      dailyPlan,
    };
  }
}

module.exports = new DashboardService();
