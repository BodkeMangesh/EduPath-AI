const GroqProvider = require("./GroqProvider");

class AIProvider {
  constructor() {
    this.provider = new GroqProvider();
  }

  async generate(feature, context) {
    return await this.provider.generate(feature, context);
  }
}

module.exports = new AIProvider();
