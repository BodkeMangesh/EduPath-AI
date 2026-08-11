const AIProvider = require("../ai/AIProvider");

class ChatService {
  async ask(progress, assessment, message) {
    const context = {
      career: progress?.careerId,

      currentTopic: progress?.nextMilestone,

      completedTopics: progress?.completedTopics || [],

      pendingTopics: progress?.pendingTopics || [],

      learningStyle: assessment?.preferredLearningStyle,

      dailyStudyHours: assessment?.dailyStudyHours,

      message,
    };

    try {
      const aiResponse = await AIProvider.generate("chat", context);

      console.log("AI Provider Response:", aiResponse);

      // AI Provider returned parser error object
      if (aiResponse && typeof aiResponse === "object" && aiResponse.error) {
        console.log("AI response invalid. Using fallback...");

        return this.generateFallbackResponse(progress, assessment, message);
      }

      // Normal AI response
      if (typeof aiResponse === "string") {
        return {
          reply: aiResponse,
        };
      }

      if (aiResponse?.reply) {
        if (typeof aiResponse.reply === "string") {
          return {
            reply: aiResponse.reply,
          };
        }

        if (typeof aiResponse.reply === "object") {
          return {
            reply:
              aiResponse.reply.rawResponse ||
              "Sorry, I could not generate a response.",
          };
        }
      }

      return this.generateFallbackResponse(progress, assessment, message);
    } catch (error) {
      console.log("Using fallback chat response...");
      console.error(error);

      return this.generateFallbackResponse(progress, assessment, message);
    }
  }

  generateFallbackResponse(progress, assessment, message) {
    const question = (message || "").toLowerCase();

    const currentTopic =
      progress?.nextMilestone || "your current learning topic";

    const studyHours = assessment?.dailyStudyHours || 2;

    if (
      question.includes("backend") ||
      question.includes("back-end") ||
      question.includes("server")
    ) {
      return {
        reply: `To become a backend developer, follow these steps:

1. Learn programming fundamentals.
2. Learn Node.js and Express.js.
3. Understand HTTP and REST APIs.
4. Learn MongoDB or MySQL.
5. Learn authentication using JWT.
6. Learn validation and error handling.
7. Learn Git and GitHub.
8. Build practical backend projects.
9. Learn deployment and basic cloud concepts.

Your current learning topic is "${currentTopic}".

Study for ${studyHours} hours today and complete one practical coding exercise.`,
      };
    }

    if (
      question.includes("frontend") ||
      question.includes("front-end") ||
      question.includes("react")
    ) {
      return {
        reply: `To become a frontend developer, follow these steps:

1. Learn HTML.
2. Learn CSS and responsive design.
3. Learn JavaScript.
4. Learn DOM and APIs.
5. Learn React.
6. Learn Git and GitHub.
7. Build responsive projects.
8. Connect frontend applications with APIs.
9. Deploy your projects.

Your current learning topic is "${currentTopic}".

Study for ${studyHours} hours today and build one practical UI feature.`,
      };
    }

    if (
      question.includes("java") ||
      question.includes("oops") ||
      question.includes("oop")
    ) {
      return {
        reply: `For Java development, follow this order:

1. Learn Java fundamentals.
2. Learn OOP concepts.
3. Learn Collections.
4. Learn Exception Handling.
5. Learn JDBC.
6. Learn SQL.
7. Learn Spring Boot.
8. Build backend projects.

Your current learning topic is "${currentTopic}".

Spend ${studyHours} hours today writing and practicing Java code.`,
      };
    }

    if (
      question.includes("dsa") ||
      question.includes("data structure") ||
      question.includes("algorithm")
    ) {
      return {
        reply: `For DSA preparation, follow this order:

1. Arrays
2. Strings
3. Searching
4. Sorting
5. Linked Lists
6. Stack and Queue
7. Recursion
8. Trees
9. Graphs
10. Dynamic Programming

Learn one topic at a time and solve problems after each concept.

Your current learning topic is "${currentTopic}".`,
      };
    }

    return {
      reply: `I could not reach the AI service right now.

Your current learning topic is "${currentTopic}".

For today:

1. Complete your current topic.
2. Practice what you learned.
3. Build one small feature.
4. Revise previous topics.
5. Continue to your next milestone.

Try to study for ${studyHours} hours today.`,
    };
  }
}

module.exports = new ChatService();
