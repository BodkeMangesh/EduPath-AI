require("dotenv").config();

const AILearningPathService = require("./services/AILearningPathService");

async function test() {
  const aiAnalysis = {
    recommendedCareer: {
      careerName: "Backend Developer",
    },
    strengths: ["Java", "Problem Solving"],
    weaknesses: ["Spring Boot"],
    skillGaps: ["REST API", "Authentication", "Docker"],
  };

  const assessment = {
    dailyStudyHours: 2,
    preferredLearningStyle: "Project Based",
  };

  const result = await AILearningPathService.generate(aiAnalysis, assessment);

  console.log(JSON.stringify(result, null, 2));
}

test();
