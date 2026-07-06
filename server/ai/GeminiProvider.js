const { GoogleGenAI } = require("@google/genai");

const PromptManager = require("./PromptManager");
const ResponseParser = require("./ResponseParser");

class GeminiProvider {
  constructor() {
    this.ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }

  async generate(feature, context) {
    try {
      const prompt = PromptManager.getPrompt(feature, context);

      console.log("Feature:", feature);
      console.log(prompt);

      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      console.log("RAW RESPONSE:");
      console.log(response.text);

      return ResponseParser.parse(response.text);
    } catch (error) {
      console.error("Gemini Error:", error.message);
      throw new Error("Gemini AI is currently unavailable.");
    }
  }
}

module.exports = GeminiProvider;
