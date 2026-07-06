require("dotenv").config();

const AIProvider = require("./ai/AIProvider");

async function test() {
  try {
    const result = await AIProvider.generate("learningPath", {
      career: "Backend Developer",
      strengths: ["Java", "HTML", "CSS"],
      weaknesses: ["Spring Boot", "SQL"],
      skillGaps: ["REST API", "Authentication", "Docker"],
      dailyStudyHours: 2,
      learningStyle: "Project Based",
    });

    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error(err.message);
  }
}

test();
