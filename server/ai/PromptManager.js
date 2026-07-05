const mentorPrompt = require("./prompts/mentorPrompt");
const assessmentPrompt = require("./prompts/assessmentPrompt");
const learningPathPrompt = require("./prompts/learningPathPrompt");
const careerChatPrompt = require("./prompts/careerChatPrompt");

class PromptManager {
  getPrompt(feature, context) {
    switch (feature) {
      case "mentor":
        return mentorPrompt(context);

      case "assessment":
        return assessmentPrompt(context);

      case "learning-path":
        return learningPathPrompt(context);

      case "career-chat":
        return careerChatPrompt(context);

      default:
        throw new Error("Unknown AI feature.");
    }
  }
}

module.exports = new PromptManager();
