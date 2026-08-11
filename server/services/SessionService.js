const StudySession = require("../models/StudySession");
const LearningProgress = require("../models/LearningProgress");

class StudySessionService {
  /**
   * Save completed study session
   */
  async saveSession(userId, sessionData) {
    const { duration, topic, careerId } = sessionData;

    // Save study session
    const session = await StudySession.create({
      user: userId,
      duration,
      topic,
      careerId,
      sessionType: "Pomodoro",
      completed: true,
    });

    // Update Learning Progress study hours
    const progress = await LearningProgress.findOne({
      user: userId,
      careerId,
    });

    if (progress) {
      progress.totalStudyHours += duration / 60; // convert minutes → hours
      await progress.save();
    }

    return {
      session,
      totalStudyHours: progress ? progress.totalStudyHours : 0,
    };
  }
}

module.exports = new StudySessionService();
