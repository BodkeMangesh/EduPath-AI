const Groq = require("groq-sdk");

const PromptManager = require("./PromptManager");
const ResponseParser = require("./ResponseParser");

class GroqProvider {
  constructor() {
    const apiKey = process.env.GROQ_API_KEY;
    this.client = apiKey ? new Groq({ apiKey }) : null;

    if (this.client) {
      this.listModels().catch((error) => {
        console.warn("Groq Models Warning:", error.message);
      });
    }
  }

  async listModels() {
    if (!this.client) {
      return [];
    }

    try {
      const models = await this.client.models.list();

      console.log(
        "AVAILABLE GROQ MODELS:",
        models.data.map((model) => ({
          id: model.id,
          active: model.active,
        })),
      );

      return models.data;
    } catch (error) {
      console.error("Groq Models Error:", error);
      throw error;
    }
  }

  async generate(feature, context) {
    if (!this.client) {
      throw new Error(
        "Groq AI is unavailable because GROQ_API_KEY is not configured.",
      );
    }

    try {
      // Generate prompt
      const prompt = PromptManager.getPrompt(feature, context);

      console.log("Feature:", feature);
      console.log(prompt);

      // Call Groq
      const completion = await this.client.chat.completions.create({
        model: "openai/gpt-oss-120b",

        messages: [
          {
            role: "system",
            content:
              "Return your response in json object only . Do not include  markdown, code fences, or any text outside the JSON object.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],

        temperature: 0.7,

        reasoning_effort: "medium",

        max_tokens: 4096,

        response_format: {
          type: "json_object",
        },
      });

      console.log("===== GROQ COMPLETION INFO =====");
      console.log("Finish Reason:", completion.choices?.[0]?.finish_reason);
      console.log("Usage:", completion.usage);
      console.log("================================");

      const rawResponse = completion.choices[0].message.content;

      console.log("RAW RESPONSE:");
      console.log(rawResponse);

      // Chat returns plain text
      if (feature === "career-chat" || feature === "chat") {
        return rawResponse;
      }

      // Parse JSON
      return ResponseParser.parse(rawResponse);
    } catch (error) {
      console.error("Groq Error:", error.message);

      throw new Error("Groq AI is currently unavailable.");
    }
  }
}

module.exports = GroqProvider;
