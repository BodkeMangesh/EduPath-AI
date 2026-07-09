const Assessment = require("../models/Assessment");
const LearningProgressService = require("./LearningProgressService");
const CareerIntelligenceEngine = require("../intelligence/CareerIntelligenceEngine");
const AIProvider = require("../ai/AIProvider");

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

    const assessmentContext = {
      education: assessment.education,
      interests: assessment.interests,
      skills: assessment.skills,
      strengths: assessment.strengths,
      weaknesses: assessment.weaknesses,
      preferredLearningStyle: assessment.preferredLearningStyle,
      dailyStudyHours: assessment.dailyStudyHours,
      careerGoal: assessment.careerGoal,
    };

    // AI career analysis
    let aiAnalysis;

    try {
      aiAnalysis = await AIProvider.generate("assessment", assessmentContext);
    } catch {
      console.log("Using Career Intelligence fallback...");

      aiAnalysis = await CareerIntelligenceEngine.analyze(assessment);
    }

    // Existing engine still builds learning path

    await LearningProgressService.initializeProgress(
      assessment.user,
      aiAnalysis.learningPath,
      aiAnalysis.recommendedCareer.careerId,
    );

    const learningProgress = await LearningProgressService.getProgress(
      assessment.user,
      aiAnalysis.recommendedCareer.careerId,
    );

    return {
      assessment,
      learningProgress,
      aiAnalysis,
    };
  }
}

module.exports = new AssessmentService();
