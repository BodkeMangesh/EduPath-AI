require("dotenv").config();

const ChatService = require("./services/ChatService");

async function test() {
  const progress = {
    careerId: "Backend Developer",

    nextMilestone: "Spring Boot",

    completedTopics: ["Java", "OOP"],

    pendingTopics: ["Spring Boot", "REST API"],
  };

  const assessment = {
    preferredLearningStyle: "Project Based",

    dailyStudyHours: 2,
  };

  const answer = await ChatService.ask(
    progress,

    assessment,

    "How should I learn Spring Boot?",
  );

  console.log(answer);
}

test();
