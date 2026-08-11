const asyncHandler = require("../utils/asyncHandler");
const StudySessionService = require("../services/SessionService");

class StudySessionController {
  /**
   * Save Pomodoro Session
   */
  saveSession = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const session = await StudySessionService.saveSession(userId, req.body);

    res.status(200).json({
      success: true,
      message: "Study session saved successfully.",
      data: session,
    });
  });
}

module.exports = new StudySessionController();
