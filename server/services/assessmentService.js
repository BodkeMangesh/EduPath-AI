const Assessment = require("../models/Assessment");
const LearningProgressService = require("./LearningProgressService");
const CareerIntelligenceEngine = require("../intelligence/CareerIntelligenceEngine");
const AIProvider = require("../ai/AIProvider");
const NotificationService = require("./NotificationService");

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

  /*
  |--------------------------------------------------------------------------
  | Submit Assessment
  |--------------------------------------------------------------------------
  */

  async submitAssessment(assessmentId, userId, data) {
    const assessment = await Assessment.findOne({
      _id: assessmentId,
      user: userId,
    });

    if (!assessment) {
      throw new Error("Assessment not found.");
    }

    // Update assessment data
    Object.assign(assessment, data);

    assessment.status = "completed";
    assessment.completedAt = new Date();

    await assessment.save();

    /*
     * ----------------------------------------------------
     * Assessment Context
     * ----------------------------------------------------
     */

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

    /*
     * ----------------------------------------------------
     * AI Career Analysis
     * ----------------------------------------------------
     */

    let aiAnalysis;

    try {
      aiAnalysis = await AIProvider.generate("assessment", assessmentContext);
    } catch (error) {
      console.log("Using Career Intelligence fallback...");

      aiAnalysis = await CareerIntelligenceEngine.analyze(assessment);
    }

    console.log("===== AI ANALYSIS =====");

    console.log("Recommended Career:", aiAnalysis.recommendedCareer);

    console.log("Learning Path:", aiAnalysis.learningPath);

    /*
     * ----------------------------------------------------
     * Validate AI Analysis
     * ----------------------------------------------------
     */

    if (!aiAnalysis?.recommendedCareer?.careerId) {
      throw new Error("AI analysis did not return a recommended career.");
    }

    /*
     * ----------------------------------------------------
     * Initialize Learning Progress
     * ----------------------------------------------------
     *
     * IMPORTANT:
     * learningPath is an object.
     * Do NOT convert learningPath to String().
     */

    const careerId = String(aiAnalysis.recommendedCareer.careerId);

    await LearningProgressService.initializeProgress(
      assessment.user,
      careerId,
      aiAnalysis.learningPath,
    );

    /*
     * ----------------------------------------------------
     * Get Learning Progress
     * ----------------------------------------------------
     */

    const learningProgress = await LearningProgressService.getProgress(
      assessment.user,
      careerId,
    );

    /*
     * ----------------------------------------------------
     * Create Assessment Completed Notification
     * ----------------------------------------------------
     */

    try {
      await NotificationService.createNotification({
        userId: assessment.user,
        type: "assessment_completed",
        title: "Assessment Completed 🎯",
        message: "Your skill assessment has been completed successfully.",
      });

      console.log("Assessment completion notification created.");
    } catch (error) {
      /*
       * Notification failure should not
       * break the assessment flow.
       */
      console.error("Assessment notification failed:", error.message);
    }

    /*
     * ----------------------------------------------------
     * Create Learning Path Ready Notification
     * ----------------------------------------------------
     */

    try {
      await NotificationService.createNotification({
        userId: assessment.user,
        type: "learning_path_ready",
        title: "Learning Path Ready 📚",
        message:
          "Your personalized learning path has been created. Start learning to move toward your career goal.",
        relatedCareer: careerId,
      });

      console.log("Learning path notification created.");
    } catch (error) {
      /*
       * Notification failure should not
       * break the assessment flow.
       */
      console.error("Learning path notification failed:", error.message);
    }

    /*
     * ----------------------------------------------------
     * Final Response
     * ----------------------------------------------------
     */

    return {
      assessment,
      learningProgress,
      aiAnalysis,
    };
  }
}

module.exports = new AssessmentService();
