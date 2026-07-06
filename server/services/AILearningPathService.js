const AIProvider = require("../ai/AIProvider");

class AILearningPathService {
  /**
   * Generate AI Learning Path
   */
  async generate(aiAnalysis, assessment = {}) {
    try {
      const context = {
        career:
          aiAnalysis?.recommendedCareer?.careerName ||
          assessment.careerGoal ||
          "Software Developer",

        strengths: aiAnalysis?.strengths || [],

        weaknesses: aiAnalysis?.weaknesses || [],

        skillGaps: aiAnalysis?.skillGaps || [],

        dailyStudyHours:
          assessment.dailyStudyHours || 2,

        learningStyle:
          assessment.preferredLearningStyle ||
          assessment.learningStyle ||
          "Project Based",
      };

      const learningPath = await AIProvider.generate(
        "learningPath",
        context
      );

      return learningPath;
    } catch (error) {
      console.error(
        "AI Learning Path Error:",
        error.message
      );

      throw new Error(
        "Unable to generate AI learning path."
      );
    }
  }
}

module.exports = new AILearningPathService();