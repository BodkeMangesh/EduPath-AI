const Assessment = require("../models/Assessment");
const LearningProgressService = require("./LearningProgressService");
const CareerIntelligenceEngine = require("../intelligence/CareerIntelligenceEngine");

class AssessmentService {
  /*
    |--------------------------------------------------------------------------
    | Start Assessment
    |--------------------------------------------------------------------------
    */

  async startAssessment(userId, data) {
    const assessment = await Assessment.create({
      user: userId,
      ...data,
      status: "in_progress",
    });

    return assessment;
  }

  async submitAssessment(assessmentId, userId, data) {
    const assessment = await Assessment.findOne({
      _id: assessmentId,
      user: userId,
    });

    if (!assessment) {
      throw new Error("Assessment not found.");
    }

    Object.assign(assessment, data);

    assessment.status = "completed";
    assessment.completedAt = new Date();

    await assessment.save();

    // Run AI only once
    const intelligence = await CareerIntelligenceEngine.analyze(assessment);

    await LearningProgressService.initializeProgress(
      assessment.user,
      intelligence.learningPath,
      intelligence.careerAnalysis.recommendedCareer.careerId,
    );

    const learningProgress = await LearningProgressService.getProgress(
      assessment.user,
      intelligence.careerAnalysis.recommendedCareer.careerId,
    );

    return {
      assessment,
      learningProgress,
      intelligence,
    };
  }
}

module.exports = new AssessmentService();
