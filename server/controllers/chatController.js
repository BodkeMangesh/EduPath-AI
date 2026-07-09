const ChatService = require("../services/ChatService");
const LearningProgress = require("../models/LearningProgress");
const Assessment = require("../models/Assessment");

const asyncHandler = require("../middleware/asyncHandler");
const ApiError = require("../utils/ApiError");

exports.chat = asyncHandler(async (req, res) => {
  const { message, careerId } = req.body;

  if (!message) {
    throw new ApiError(400, "Message is required.");
  }

  const progress = await LearningProgress.findOne({
    user: req.user.id,
    careerId,
  });

  if (!progress) {
    throw new ApiError(404, "Learning progress not found.");
  }

  const assessment = await Assessment.findOne({
    user: req.user.id,
    status: "completed",
  }).sort({ completedAt: -1 });

  const reply = await ChatService.ask(progress, assessment, message);

  res.status(200).json({
    success: true,
    data: {
      reply,
    },
  });
});
