const User = require("../models/User");
const LearningProgress = require("../models/LearningProgress");
const LearningSession = require("../models/LearningSession");

/*
|--------------------------------------------------------------------------
| Dashboard Service
|--------------------------------------------------------------------------
|
| Provides all important information required by the Dashboard.
|
| Data sources:
| - User
| - LearningProgress
| - LearningSession
|
|--------------------------------------------------------------------------
*/

class DashboardService {
  getCareerId(user) {
    if (!user?.selectedCareer) return null;

    return user.selectedCareer.slug
      ? String(user.selectedCareer.slug).trim().toLowerCase()
      : null;
  }

  async getDashboard(userId) {
    /*
    |--------------------------------------------------------------------------
    | 1. Get User
    |--------------------------------------------------------------------------
    */

    const user = await User.findById(userId)
      .select(
        "fullName email profileImage learningStyle placement aiProfile progress selectedCareer careerStatus achievements onboarding",
      )
      .populate("selectedCareer", "name title slug");

    if (!user) {
      throw new Error("User not found.");
    }

    /*
    |--------------------------------------------------------------------------
    | 2. Determine Career
    |--------------------------------------------------------------------------
    */

    const careerId = this.getCareerId(user);

    /*
    |--------------------------------------------------------------------------
    | 3. Get Learning Progress
    |--------------------------------------------------------------------------
    */

    let learningProgress = null;

    if (careerId) {
      learningProgress = await LearningProgress.findOne({
        user: userId,
        careerId,
      }).lean();
    }

    /*
    |--------------------------------------------------------------------------
    | 4. Get Learning Sessions
    |--------------------------------------------------------------------------
    */

    let completedSessions = [];
    let activeSession = null;

    if (careerId) {
      completedSessions = await LearningSession.find({
        user: userId,
        careerId,
        status: "completed",
      })
        .sort({ completedAt: -1 })
        .limit(5)
        .lean();

      activeSession = await LearningSession.findOne({
        user: userId,
        careerId,
        status: { $in: ["started", "paused"] },
      })
        .sort({ updatedAt: -1 })
        .lean();
    }

    /*
    |--------------------------------------------------------------------------
    | 5. Calculate Study Time
    |--------------------------------------------------------------------------
    |
    | durationSeconds is the authoritative learning-session value.
    |
    */

    let totalSessionSeconds = 0;

    if (careerId) {
      const studyTimeResult = await LearningSession.aggregate([
        {
          $match: {
            user: user._id,
            careerId,
            status: "completed",
          },
        },
        {
          $group: {
            _id: null,
            totalSeconds: {
              $sum: "$durationSeconds",
            },
          },
        },
      ]);

      totalSessionSeconds = studyTimeResult[0]?.totalSeconds || 0;
    }

    const sessionStudyHours = Number((totalSessionSeconds / 3600).toFixed(2));

    /*
    |--------------------------------------------------------------------------
    | 6. Learning Progress Data
    |--------------------------------------------------------------------------
    */

    const completedTopics = learningProgress?.completedTopics || [];
    const pendingTopics = learningProgress?.pendingTopics || [];

    const overallCompletion =
      learningProgress?.overallCompletion ??
      user.progress?.overallProgress ??
      0;

    const currentPhase = learningProgress?.currentPhase || 1;

    const currentStreak = learningProgress?.currentStreak || 0;

    const totalStudyHours =
      learningProgress?.totalStudyHours > 0
        ? learningProgress.totalStudyHours
        : sessionStudyHours;

    /*
    |--------------------------------------------------------------------------
    | 7. Recently Completed Sessions
    |--------------------------------------------------------------------------
    */

    const recentCompletedSessions = completedSessions.map((session) => ({
      id: session._id,
      topic: session.topic,
      phase: session.phase,
      phaseTitle: session.phaseTitle,
      type: session.type,
      durationMinutes: session.durationMinutes,
      durationSeconds: session.durationSeconds,
      progress: session.progress,
      completedAt: session.completedAt,
      resourceTitle: session.resourceTitle,
      resourceProvider: session.resourceProvider,
    }));

    /*
    |--------------------------------------------------------------------------
    | 8. Active Learning Session
    |--------------------------------------------------------------------------
    */

    let activeLearningSession = null;

    if (activeSession) {
      activeLearningSession = {
        id: activeSession._id,
        topic: activeSession.topic,
        phase: activeSession.phase,
        phaseTitle: activeSession.phaseTitle,
        type: activeSession.type,
        status: activeSession.status,
        progress: activeSession.progress,
        durationSeconds: activeSession.durationSeconds,
        durationMinutes: activeSession.durationMinutes,
        plannedDurationMinutes: activeSession.plannedDurationMinutes,
        learningStyle: activeSession.learningStyle,
        resourceTitle: activeSession.resourceTitle,
        resourceProvider: activeSession.resourceProvider,
        resourceUrl: activeSession.resourceUrl,
        startedAt: activeSession.startedAt,
        updatedAt: activeSession.updatedAt,
      };
    }

    /*
    |--------------------------------------------------------------------------
    | 9. Dashboard Response
    |--------------------------------------------------------------------------
    */

    return {
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        profileImage: user.profileImage,
        learningStyle: user.learningStyle,
        careerStatus: user.careerStatus,
      },

      career: user.selectedCareer
        ? {
            id: user.selectedCareer._id,
            name: user.selectedCareer.name || user.selectedCareer.title || "",
            slug: user.selectedCareer.slug || "",
          }
        : null,

      onboarding: {
        completed: user.onboardingCompleted,
        currentSituation: user.onboarding?.currentSituation || "",
        careerGoal: user.onboarding?.careerGoal || "",
        interests: user.onboarding?.interests || [],
      },

      learning: {
        overallCompletion,
        currentPhase,
        completedTopics,
        pendingTopics,
        completedProjects: learningProgress?.completedProjects || [],
        currentStreak,
        totalStudyHours,
        nextMilestone:
          learningProgress?.nextMilestone || "Continue your learning journey",
        lastStudyDate: learningProgress?.lastStudyDate || null,
        status: learningProgress?.status || "Active",
      },

      sessions: {
        totalCompleted: completedSessions.length,
        active: activeLearningSession,
        recentCompleted: recentCompletedSessions,
        totalSessionStudyHours: sessionStudyHours,
      },

      placement: {
        targetRole: user.placement?.targetRole || "",
        dreamCompany: user.placement?.dreamCompany || "",
        interviewReadiness: user.placement?.interviewReadiness || 0,
      },

      profileProgress: {
        overallProgress: user.progress?.overallProgress || 0,
        careerReadiness: user.progress?.careerReadiness || 0,
        portfolioScore: user.progress?.portfolioScore || 0,
        completedRoadmaps: user.progress?.completedRoadmaps || 0,
      },

      aiProfile: {
        preferredLanguage: user.aiProfile?.preferredLanguage || "English",
        dailyStudyHours: user.aiProfile?.dailyStudyHours || 2,
        careerGoal: user.aiProfile?.careerGoal || "",
        interests: user.aiProfile?.interests || [],
      },

      achievements: user.achievements || [],
    };
  }
}

module.exports = new DashboardService();
