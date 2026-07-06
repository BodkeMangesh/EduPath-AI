class ResponseParser {
  parse(response) {
    try {
      return JSON.parse(response);
    } catch (error) {
      return {
        motivation: response,
      };
    }
  }
}

module.exports = new ResponseParser();
