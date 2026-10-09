const StudyScheduler = require("./algorithms/StudyScheduler");
const SkillGapAnalyzer = require("./algorithms/SkillGapAnalyzer");
const CareerMatcher = require("./algorithms/CareerMatcher");
const LearningPathPlanner = require("./algorithms/LearningPathPlanner");
const ProgressAnalyzer = require("./algorithms/ProgressAnalyzer");
const AdaptiveLearningEngine = require("./algorithms/AdaptiveLearningEngine");
const ResourceRecommendationEngine = require("./algorithms/ResourceRecommendationEngine");

class CareerIntelligenceEngine {
  async analyze(user) {
    /*
     * ----------------------------------------------------
     * Validate User
     * ----------------------------------------------------
     */

    if (!user) {
      throw new Error("User profile is required.");
    }

    /*
     * ----------------------------------------------------
     * Skill Analysis
     * ----------------------------------------------------
     */

    const skillAnalysis = await SkillGapAnalyzer.analyze(user);

    /*
     * ----------------------------------------------------
     * Career Matching
     * ----------------------------------------------------
     */

    const careerAnalysis = await CareerMatcher.match(user, skillAnalysis);

    /*
     * ----------------------------------------------------
     * Personalized Learning Path
     * ----------------------------------------------------
     */

    const learningPath = await LearningPathPlanner.generate(
      user,
      careerAnalysis,
    );

    /*
     * ----------------------------------------------------
     * Personalized Study Plan
     * ----------------------------------------------------
     */

    const studyPlan = await StudyScheduler.generate(learningPath, {
      dailyStudyHours: user?.aiProfile?.dailyStudyHours || 2,
    });

    /*
     * ----------------------------------------------------
     * Progress Analysis
     * ----------------------------------------------------
     */

    const progress = await ProgressAnalyzer.analyze(careerAnalysis);

    /*
     * ----------------------------------------------------
     * Adaptive Learning
     * ----------------------------------------------------
     */

    const adaptiveLearning = await AdaptiveLearningEngine.adapt(
      learningPath,
      studyPlan,
      progress,
    );

    /*
     * ----------------------------------------------------
     * AI Resource Recommendation
     * ----------------------------------------------------
     */

    const resources = await ResourceRecommendationEngine.recommend(
      user,
      careerAnalysis,
      null,
    );

    /*
     * ----------------------------------------------------
     * Final Intelligence Result
     * ----------------------------------------------------
     */

    return {
      skillAnalysis,

      careerAnalysis,

      learningPath,

      studyPlan,

      progress,

      adaptiveLearning,

      resources,
    };
  }
}

module.exports = new CareerIntelligenceEngine();
