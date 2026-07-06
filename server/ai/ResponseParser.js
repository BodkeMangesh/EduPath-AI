class ResponseParser {
  parse(response) {
    try {
      let cleaned = response.trim();

      // Remove markdown fences
      cleaned = cleaned.replace(/```json/g, "");
      cleaned = cleaned.replace(/```/g, "").trim();

      // Extract first JSON object only
      const start = cleaned.indexOf("{");
      const end = cleaned.lastIndexOf("}");

      if (start === -1 || end === -1) {
        throw new Error("No JSON found in AI response.");
      }

      const jsonString = cleaned.substring(start, end + 1);

      return JSON.parse(jsonString);
    } catch (error) {
      console.error("ResponseParser Error:", error.message);

      return {
        error: true,
        rawResponse: response,
      };
    }
  }
}

module.exports = new ResponseParser();
