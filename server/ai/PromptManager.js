const mentorPrompt = require("./prompts/mentorPrompt");
const assessmentPrompt = require("./prompts/assessmentPrompt");
const learningPathPrompt = require("./prompts/learningPathPrompt");
const careerChatPrompt = require("./prompts/careerChatPrompt");
const resourcePrompt = require("./prompts/resourcePrompt");
const chatPrompt = require("./prompts/chatPrompt");

class PromptManager {
  getPrompt(feature, context) {
    switch (feature) {
      case "mentor":
        return mentorPrompt(context);

      case "assessment":
        return assessmentPrompt(context);

      case "learningPath":
        return learningPathPrompt(context);

      case "career-chat":
        return careerChatPrompt(context);

      case "resources":
        return resourcePrompt(context);

      case "chat":
        return chatPrompt(context);

      default:
        throw new Error("Unknown AI feature.");
    }
  }
}

module.exports = new PromptManager();
