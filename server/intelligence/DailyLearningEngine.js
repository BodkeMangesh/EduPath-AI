class DailyLearningEngine {
  async generate(progress) {
    const todayTopic = progress.pendingTopics[0] || null;

    return {
      todayGoal: todayTopic ? `Study ${todayTopic}` : "Learning Path Completed",

      studyDuration: "2 Hours",

      practiceTask: todayTopic
        ? `Solve 5 coding questions on ${todayTopic}`
        : "Practice interviews",

      projectTask:
        progress.currentPhase >= 3
          ? "Continue your portfolio project."
          : "No project today",

      revision: progress.completedTopics.length
        ? progress.completedTopics[progress.completedTopics.length - 1]
        : "Revise Java Basics",

      motivation: "Small daily progress creates extraordinary results.",
    };
  }
}

module.exports = new DailyLearningEngine();
