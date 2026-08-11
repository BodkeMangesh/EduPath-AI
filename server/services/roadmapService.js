const Assessment = require("../models/Assessment");
const LearningProgressService = require("./LearningProgressService");
const CareerIntelligenceEngine = require("../intelligence/CareerIntelligenceEngine");

class RoadmapService {
  async getRoadmap(userId, careerId) {
    if (!userId) {
      throw new Error("User ID is required.");
    }

    if (!careerId) {
      throw new Error("Career ID is required.");
    }

    // ==========================================
    // Get latest completed assessment
    // ==========================================

    const assessment = await Assessment.findOne({
      user: userId,
      status: "completed",
    }).sort({ completedAt: -1 });

    if (!assessment) {
      throw new Error("Completed assessment not found.");
    }

    // ==========================================
    // Get current learning progress
    // ==========================================

    const progress = await LearningProgressService.getProgress(
      userId,
      careerId,
    );

    if (!progress) {
      throw new Error("Learning progress not found.");
    }

    // ==========================================
    // Generate dynamic learning path
    // ==========================================

    const aiAnalysis = await CareerIntelligenceEngine.analyze(assessment);

    const learningPath = aiAnalysis.learningPath;

    if (!learningPath || !Array.isArray(learningPath.phases)) {
      throw new Error("Learning roadmap is not available.");
    }

    // ==========================================
    // Actual completed topics from progress
    // ==========================================

    const completedTopics = progress.completedTopics || [];

    // ==========================================
    // Build dynamic phases
    // ==========================================

    const phases = learningPath.phases.map((phase) => {
      const topics = Array.isArray(phase.topics) ? phase.topics : [];

      const phaseCompletedTopics = topics.filter((topic) =>
        completedTopics.includes(topic),
      );

      const phasePendingTopics = topics.filter(
        (topic) => !completedTopics.includes(topic),
      );

      const totalTopics = topics.length;

      const completion =
        totalTopics === 0
          ? 0
          : Math.round((phaseCompletedTopics.length / totalTopics) * 100);

      return {
        phase: phase.phase,
        title: phase.title,
        duration: phase.duration,

        topics,

        completedTopics: phaseCompletedTopics,

        pendingTopics: phasePendingTopics,

        completion,
      };
    });

    // ==========================================
    // Calculate overall roadmap progress
    // ==========================================

    const allTopics = phases.flatMap((phase) => phase.topics);

    const roadmapCompletedTopics = phases.flatMap(
      (phase) => phase.completedTopics,
    );

    const roadmapPendingTopics = phases.flatMap((phase) => phase.pendingTopics);

    const totalTopics = allTopics.length;

    const overallCompletion =
      totalTopics === 0
        ? 0
        : Math.round((roadmapCompletedTopics.length / totalTopics) * 100);

    // ==========================================
    // Find current phase
    // ==========================================

    let currentPhase = 1;

    const incompletePhase = phases.find((phase) => phase.completion < 100);

    if (incompletePhase) {
      currentPhase = incompletePhase.phase;
    } else if (phases.length > 0) {
      currentPhase = phases[phases.length - 1].phase;
    }

    // ==========================================
    // Find next topic
    // ==========================================

    const nextTopic =
      roadmapPendingTopics.length > 0 ? roadmapPendingTopics[0] : null;

    // ==========================================
    // Next milestone
    // ==========================================

    const nextMilestone = nextTopic || "Learning Path Completed";

    // ==========================================
    // Status
    // ==========================================

    const status = roadmapPendingTopics.length === 0 ? "Completed" : "Active";

    // ==========================================
    // Return roadmap
    // ==========================================

    return {
      career: learningPath.career,

      estimatedDuration: learningPath.estimatedDuration,

      phases,

      currentPhase,

      overallCompletion,

      completedTopics: roadmapCompletedTopics,

      pendingTopics: roadmapPendingTopics,

      nextMilestone,

      status,

      nextTopic,

      nextProject: learningPath.nextProject || null,
    };
  }
}

module.exports = new RoadmapService();
