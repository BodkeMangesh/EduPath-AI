const OpenAI = require("openai");

class OpenAIService {
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async chat(messages, options = {}) {
    try {
      const response = await this.client.chat.completions.create({
        model: options.model || "gpt-4.1-mini",
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 1000,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error("OpenAI Error:", error.message);
      throw new Error("AI service is currently unavailable.");
    }
  }
}

module.exports = new OpenAIService();
