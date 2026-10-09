const GroqProvider = require("./GroqProvider");

class AIProvider {
  constructor() {
    this.provider = new GroqProvider();
  }

  async generate(feature, context) {
    if (!this.provider?.client) {
      throw new Error("AI provider is unavailable because no valid API key is configured.");
    }

    return await this.provider.generate(feature, context);
  }
}

module.exports = new AIProvider();
