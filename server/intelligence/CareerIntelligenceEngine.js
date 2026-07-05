const StudyScheduler = require("./algorithms/StudyScheduler");
const SkillGapAnalyzer = require("./algorithms/SkillGapAnalyzer");
const CareerMatcher = require("./algorithms/CareerMatcher");
const LearningPathPlanner = require("./algorithms/LearningPathPlanner");
const ProgressAnalyzer = require("./algorithms/ProgressAnalyzer");
const AdaptiveLearningEngine = require("./algorithms/AdaptiveLearningEngine");
const ResourceRecommendationEngine = require("./algorithms/ResourceRecommendationEngine");

class CareerIntelligenceEngine {
  async analyze(assessment) {
    const skillAnalysis = await SkillGapAnalyzer.analyze(assessment);

    const careerAnalysis = await CareerMatcher.match(assessment, skillAnalysis);

    const learningPath = await LearningPathPlanner.generate(
      assessment,
      careerAnalysis,
    );

    const studyPlan = await StudyScheduler.generate(learningPath, {
      dailyStudyHours: assessment?.aiProfile?.dailyStudyHours || 2,
    });

    const progress = await ProgressAnalyzer.analyze(
      learningPath,
      careerAnalysis,
    );

    const adaptiveLearning = await AdaptiveLearningEngine.adapt(
      learningPath,
      studyPlan,
      progress,
    );

    const resources = await ResourceRecommendationEngine.recommend(
      assessment,
      careerAnalysis,
    );

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
