const ChatService = require("../services/ChatService");
const LearningProgress = require("../models/LearningProgress");
const Assessment = require("../models/Assessment");

const asyncHandler = require("../middleware/asyncHandler");
const ApiError = require("../utils/ApiError");
const User = require("../models/User");

exports.chat = asyncHandler(async (req, res) => {
  const { message, conversation = [] } = req.body;

  if (!message) {
    throw new ApiError(400, "Message is required.");
  }

  const progress = await LearningProgress.findOne({
    user: req.user.id,
    status: "Active",
  });

  if (!progress) {
    throw new ApiError(404, "Learning progress not found.");
  }

  const assessment = await Assessment.findOne({
    user: req.user.id,
    status: "completed",
  }).sort({ completedAt: -1 });

  const user = await User.findById(req.user.id);

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  const result = await ChatService.ask(
    user,
    progress,
    assessment,
    message,
    conversation,
  );

  res.status(200).json({
    success: true,
    data: { result },
  });
});
