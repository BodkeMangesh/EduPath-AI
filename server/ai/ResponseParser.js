class ResponseParser {
  try {
    return JSON.parse(response);
} catch {
    return {
        motivation: response
    };
}
}

module.exports = new ResponseParser();
