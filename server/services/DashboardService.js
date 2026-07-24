const User = require("../models/User");
const LearningProgress = require("../models/LearningProgress");
const Assessment = require("../models/Assessment");

const AIMentorEngine = require("../intelligence/AIMentorEngine");
const DailyLearningEngine = require("../intelligence/DailyLearningEngine");
const CareerReadinessEngine = require("../intelligence/CareerReadinessEngine");
const AIProvider = require("../ai/AIProvider");
const AIResourceService = require("./AIResourceService");

class DashboardService {
  /**
   * Get User Dashboard
   */
  async getDashboard(userId, careerId) {
    const user = await User.findById(userId).select("fullName email");

    console.log("User ID:", userId);
    console.log("Career ID:", careerId);
    const progress = await LearningProgress.findOne({
      user: userId,
      status: "Active",
    });
    console.log("Progress:", progress);
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

    // Build Ai Context `
    const context = {
      career: progress.careerId,
      completion: progress.overallCompletion,
      streak: progress.currentStreak,
      studyHours: progress.totalStudyHours,
      readiness: readiness,
      nextTopic: progress.pendingTopics[0],
    };

    let mentor;
    try {
      mentor = await AIProvider.generate("mentor", context);
    } catch (error) {
      console.log(
        "Using fallback mentor advice due to AI error:",
        error.message,
      );
      mentor = await AIMentorEngine.generate(progress, {
        careerReadiness: readiness,
      });
    }

    const dailyPlan = await DailyLearningEngine.generate(progress);

    const resources = await AIResourceService.generate(
      progress,
      latestAssessment,
    );

    return {
      user,

      id: user._id,

      fullName: user.fullName,

      email: user.email,

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

      resources,
    };
  }
}

module.exports = new DashboardService();
