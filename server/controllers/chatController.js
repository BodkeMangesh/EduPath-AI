const ChatService = require("../services/ChatService");
const LearningProgress = require("../models/LearningProgress");
const Assessment = require("../models/Assessment");

exports.chat = async (req, res) => {
  try {
    const { message, careerId } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required.",
      });
    }

    const progress = await LearningProgress.findOne({
      user: req.user.id,
      careerId,
    });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Learning progress not found.",
      });
    }

    const assessment = await Assessment.findOne({
      user: req.user.id,
      status: "completed",
    }).sort({ completedAt: -1 });

    const reply = await ChatService.ask(progress, assessment, message);

    return res.status(200).json({
      success: true,
      data: {
        reply,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
