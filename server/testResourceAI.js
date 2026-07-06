require("dotenv").config();

const AIResourceService = require("./services/AIResourceService");

async function test() {
  const progress = {
    careerId: "Backend Developer",
    nextMilestone: "Spring Boot",
    completedTopics: ["Java", "OOP", "Collections"],
    pendingTopics: ["Spring Boot", "REST API", "Authentication"],
  };

  const assessment = {
    preferredLearningStyle: "Project Based",
    dailyStudyHours: 2,
  };

  const result = await AIResourceService.generate(progress, assessment);

  console.log(JSON.stringify(result, null, 2));
}

test();
