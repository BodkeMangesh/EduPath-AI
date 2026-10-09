const LearningProgressService = require("./LearningProgressService");

class LearningService {
  /*
  |--------------------------------------------------------------------------
  | GET PROGRESS
  |--------------------------------------------------------------------------
  */

  async getProgress(userId, careerId) {
    if (!userId) {
      throw new Error("User ID is required.");
    }

    if (!careerId) {
      throw new Error("Career ID is required.");
    }

    const progress = await LearningProgressService.getProgress(
      userId,
      careerId,
    );

    if (!progress) {
      throw new Error("Learning progress not found.");
    }

    return progress;
  }

  /*
  |--------------------------------------------------------------------------
  | COMPLETE TOPIC
  |--------------------------------------------------------------------------
  */

  async completeTopic(userId, careerId, topic) {
    if (!userId) {
      throw new Error("User ID is required.");
    }

    if (!careerId) {
      throw new Error("Career ID is required.");
    }

    if (!topic) {
      throw new Error("Topic is required.");
    }

    return await LearningProgressService.completeTopic(userId, careerId, topic);
  }

  /*
  |--------------------------------------------------------------------------
  | COMPLETE TODAY PLAN
  |--------------------------------------------------------------------------
  */

  async completeTodayPlan(userId, careerId) {
    if (!userId) {
      throw new Error("User ID is required.");
    }

    if (!careerId) {
      throw new Error("Career ID is required.");
    }

    return await LearningProgressService.completeTodayPlan(userId, careerId);
  }

  /*
|--------------------------------------------------------------------------
| UPDATE STUDY HOURS
|--------------------------------------------------------------------------
*/

  async updateStudyHours(userId, careerId, hours) {
    if (!userId) {
      throw new Error("User ID is required.");
    }

    if (!careerId) {
      throw new Error("Career ID is required.");
    }

    const studyHours = Number(hours);

    if (!Number.isFinite(studyHours) || studyHours < 0) {
      throw new Error("Valid study hours are required.");
    }

    return await LearningProgressService.updateStudyHours(
      userId,
      careerId,
      studyHours,
    );
  }
}

module.exports = new LearningService();
