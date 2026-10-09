const AIProvider = require("../ai/AIProvider");
const User = require("../models/User");

class ChatService {
  async ask(user, progress, assessment, message, conversation = []) {
    // const user = await User.findById(userId).select(
    //   "fullName email role education professional aiProfile placement learningStyle",
    // );

    // if (!user) {
    //   throw new Error("User not found.");
    // }

    const context = {
      user: {
        fullName: user.fullName,
        role: user.role,

        education: user.education,

        experienceLevel: user.professional?.experienceLevel || "beginner",

        skills: user.professional?.skills || [],

        certifications: user.professional?.certifications || [],

        projects: user.professional?.projects || [],

        interests: user.aiProfile?.interests || [],

        careerGoal: user.aiProfile?.careerGoal || "",

        preferredLanguage: user.aiProfile?.preferredLanguage || "English",

        dailyStudyHours: user.aiProfile?.dailyStudyHours || 2,

        targetRole: user.placement?.targetRole || "",

        dreamCompany: user.placement?.dreamCompany || "",

        dsaLevel: user.placement?.dsaLevel || "",

        learningStyle: user.learningStyle || "mixed",
      },

      career: {
        careerId: progress?.careerId || "",
      },

      learningProgress: {
        currentPhase: progress?.currentPhase || 1,

        overallCompletion: progress?.overallCompletion || 0,

        currentStreak: progress?.currentStreak || 0,

        totalStudyHours: progress?.totalStudyHours || 0,

        completedTopics: progress?.completedTopics || [],

        pendingTopics: progress?.pendingTopics || [],

        nextMilestone: progress?.nextMilestone || "",

        status: progress?.status || "Active",
      },

      assessment: {
        learningStyle:
          assessment?.preferredLearningStyle ||
          assessment?.learningStyle ||
          user.learningStyle ||
          "mixed",

        dailyStudyHours:
          assessment?.dailyStudyHours || user.aiProfile?.dailyStudyHours || 2,
      },

      conversation: Array.isArray(conversation) ? conversation : [],

      message,
    };

    console.log("CHAT AI CONTEXT:", JSON.stringify(context, null, 2));

    try {
      const aiResponse = await AIProvider.generate("chat", context);

      console.log("AI Provider Response:", aiResponse);

      if (typeof aiResponse === "string") {
        return {
          reply: aiResponse,
        };
      }

      if (aiResponse?.reply) {
        return {
          reply:
            typeof aiResponse.reply === "string"
              ? aiResponse.reply
              : aiResponse.reply.rawResponse ||
                "Sorry, I could not generate a response.",
        };
      }

      return {
        reply: "Sorry, I could not generate a response.",
      };
    } catch (error) {
      console.error("Chat AI Error:", error);

      return {
        reply:
          "I'm having trouble connecting to EduPath AI right now. Please try again.",
      };
    }
  }
}

module.exports = new ChatService();
