require("dotenv").config();

const AIProvider = require("./ai/AIProvider");

async function test() {
  try {
    const result = await AIProvider.generate("assessment", {
      user: {
        name: "Mangesh",
        education: "BCA",
      },
      interests: ["Backend Development", "Artificial Intelligence"],
      skills: {
        java: 8,
        javascript: 7,
        html: 8,
        css: 7,
        sql: 5,
        springBoot: 3,
      },
      learningStyle: "Project Based",
      dailyStudyHours: 2,
      goal: "Become a Backend Developer",
    });

    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(error.message);
  }
}

test();
