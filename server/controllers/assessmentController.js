const AssessmentService = require("../services/AssessmentService");
const asyncHandler = require("../middleware/asyncHandler");

class AssessmentController {
  /**
   * Start Assessment
   */
  startAssessment = asyncHandler(async (req, res) => {
    const assessment = await AssessmentService.startAssessment(
      req.user._id,
      req.body,
    );

    res.status(201).json({
      success: true,
      message: "Assessment started successfully.",
      data: assessment,
    });
  });

  /**
   * Submit Assessment
   */
  submitAssessment = asyncHandler(async (req, res) => {
    const assessment = await AssessmentService.submitAssessment(
      req.params.id,
      req.user._id,
      req.body,
    );

    res.status(200).json({
      success: true,
      message: "Assessment submitted successfully.",
      data: assessment,
    });
  });
}

module.exports = new AssessmentController();
