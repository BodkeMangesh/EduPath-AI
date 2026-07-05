require("dotenv").config();

const OpenAIService = require("./ai/OpenAIService");

async function test() {
  try {
    const response = await OpenAIService.chat([
      {
        role: "user",
        content: "Say Hello from EduPath AI.",
      },
    ]);

    console.log(response);
  } catch (err) {
    console.error(err.message);
  }
}

test();
