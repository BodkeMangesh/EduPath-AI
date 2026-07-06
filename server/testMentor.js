require("dotenv").config();

const AIProvider = require("./ai/AIProvider");

async function test() {
  try {
    const response = await AIProvider.generate("mentor", {
      career: "Backend Developer",
      completion: 42,
      streak: 6,
      studyHours: 38,
      readiness: 55,
      nextTopic: "Spring Boot REST API",
    });

    console.log(response);
  } catch (err) {
    console.error(err.message);
  }
}

test();
