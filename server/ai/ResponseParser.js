class ResponseParser {
  parse(response) {
    try {
      /*
       * ------------------------------------------------------
       * Validate Response
       * ------------------------------------------------------
       */

      if (!response || typeof response !== "string") {
        throw new Error("Invalid AI response.");
      }

      let cleaned = response.trim();

      /*
       * ------------------------------------------------------
       * Remove Markdown Code Fences
       * ------------------------------------------------------
       */

      cleaned = cleaned
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      /*
       * ------------------------------------------------------
       * Find JSON Object
       * ------------------------------------------------------
       *
       * AI should return JSON only.
       * Still, this protects us if the model adds
       * a small amount of unwanted text.
       */

      const start = cleaned.indexOf("{");
      const end = cleaned.lastIndexOf("}");

      if (start === -1 || end === -1 || end <= start) {
        throw new Error("No valid JSON object found in AI response.");
      }

      const jsonString = cleaned.substring(start, end + 1);

      /*
       * ------------------------------------------------------
       * Parse JSON
       * ------------------------------------------------------
       */

      const parsed = JSON.parse(jsonString);

      /*
       * ------------------------------------------------------
       * Validate Parsed Response
       * ------------------------------------------------------
       */

      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("AI response is not a valid JSON object.");
      }

      return parsed;
    } catch (error) {
      console.error("ResponseParser Error:", error.message);

      return {
        error: true,

        message: "Unable to parse AI response.",

        rawResponse:
          typeof response === "string" ? response : String(response || ""),
      };
    }
  }
}

module.exports = new ResponseParser();
