const PromptManager = require("./PromptManager");
const ResponseParser = require("./ResponseParser");

class GeminiProvider {
  async generate(feature, context) {
    const prompt = PromptManager.getPrompt(feature, context);

    console.log("Prompt:");
    console.log(prompt);

    // Gemini API will be added next

    return ResponseParser.parse("Gemini integration coming next.");
  }
}

module.exports = GeminiProvider;
