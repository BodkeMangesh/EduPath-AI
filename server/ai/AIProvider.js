const GeminiProvider = require("./GeminiProvider");

class AIProvider {
  constructor() {
    this.provider = new GeminiProvider();
  }

  async generate(feature, context) {
    return await this.provider.generate(feature, context);
  }
}

module.exports = new AIProvider();
