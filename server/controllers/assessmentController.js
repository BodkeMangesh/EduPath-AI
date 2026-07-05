const AssessmentService = require("../services/AssessmentService");

class AssessmentController {
  /**
   * Start Assessment
   */
  async startAssessment(req, res, next) {
    try {
      const assessment = await AssessmentService.startAssessment(
        req.user._id,
        req.body,
      );

      return res.status(201).json({
        success: true,
        message: "Assessment started successfully.",
        data: assessment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Submit Assessment
   */
  async submitAssessment(req, res, next) {
    try {
      const assessment = await AssessmentService.submitAssessment(
        req.params.id,
        req.user._id,
        req.body,
      );

      return res.status(200).json({
        success: true,
        message: "Assessment submitted successfully.",
        data: assessment,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AssessmentController();
