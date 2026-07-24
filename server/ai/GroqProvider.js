const Groq = require("groq-sdk");

const PromptManager = require("./PromptManager");
const ResponseParser = require("./ResponseParser");

class GroqProvider {
  constructor() {
    this.client = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  async generate(feature, context) {
    try {
      // Generate prompt
      const prompt = PromptManager.getPrompt(feature, context);

      console.log("Feature:", feature);
      console.log(prompt);

      // Call Groq
      const completion = await this.client.chat.completions.create({
        model: "llama-3.3-70b-versatile",

        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],

        temperature: 0.7,
        max_tokens: 2048,
      });

      const rawResponse = completion.choices[0].message.content;

      console.log("RAW RESPONSE:");
      console.log(rawResponse);

      // Parse JSON
      return ResponseParser.parse(rawResponse);
    } catch (error) {
      console.error("Groq Error:", error.message);

      throw new Error("Groq AI is currently unavailable.");
    }
  }
}

module.exports = GroqProvider;
