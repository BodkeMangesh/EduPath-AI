const AIProvider = require("../ai/AIProvider");

class ChatService {
  async ask(progress, assessment, message) {
    const context = {
      career: progress.careerId,

      currentTopic: progress.nextMilestone,

      completedTopics: progress.completedTopics,

      pendingTopics: progress.pendingTopics,

      learningStyle: assessment?.preferredLearningStyle,

      dailyStudyHours: assessment?.dailyStudyHours,

      message,
    };

    try {
      return await AIProvider.generate("chat", context);
    } catch (error) {
      console.log("Using fallback chat response...");

      return {
        reply: `I couldn't reach the AI service right now.

  Based on your learning progress, I recommend focusing on "    {progress.nextMilestone}" next.

  Study for ${assessment?.dailyStudyHours || 2} hours today and complete one practical coding exercise.`,
      };
    }
  }
}

module.exports = new ChatService();
