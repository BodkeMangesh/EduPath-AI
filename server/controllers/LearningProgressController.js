const LearningProgressService = require("../services/LearningProgressService");

class LearningProgressController {
  /*
  |--------------------------------------------------------------------------
  | GET BASIC LEARNING PROGRESS
  |--------------------------------------------------------------------------
  | GET /api/v1/learning-progress?careerId=backend-developer
  */

  async getProgress(req, res) {
    try {
      const userId = req.user._id;
      const { careerId } = req.query;

      if (!careerId) {
        return res.status(400).json({
          success: false,
          message: "careerId is required.",
        });
      }

      const progress = await LearningProgressService.getProgress(
        userId,
        careerId,
      );

      if (!progress) {
        return res.status(404).json({
          success: false,
          message: "Learning progress not found.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Learning progress retrieved successfully.",
        data: progress,
      });
    } catch (error) {
      console.error("Get Learning Progress Error:", error);

      return res.status(500).json({
        success: false,
        message: error.message || "Unable to retrieve learning progress.",
      });
    }
  }

  /*
  |--------------------------------------------------------------------------
  | GET COMPLETE PROGRESS DASHBOARD
  |--------------------------------------------------------------------------
  | GET /api/v1/learning-progress/dashboard?careerId=backend-developer
  */

  async getDashboard(req, res) {
    try {
      const userId = req.user._id;
      const { careerId } = req.query;

      if (!careerId) {
        return res.status(400).json({
          success: false,
          message: "careerId is required.",
        });
      }

      const dashboard = await LearningProgressService.getDashboard(
        userId,
        careerId,
      );

      return res.status(200).json({
        success: true,
        message: "Learning progress dashboard retrieved successfully.",
        data: dashboard,
      });
    } catch (error) {
      console.error("Get Progress Dashboard Error:", error);

      return res.status(500).json({
        success: false,
        message: error.message || "Unable to retrieve progress dashboard.",
      });
    }
  }

  /*
  |--------------------------------------------------------------------------
  | GET PROGRESS OVERVIEW
  |--------------------------------------------------------------------------
  | GET /api/v1/learning-progress/overview?careerId=backend-developer
  */

  async getOverview(req, res) {
    try {
      const userId = req.user._id;
      const { careerId } = req.query;

      if (!careerId) {
        return res.status(400).json({
          success: false,
          message: "careerId is required.",
        });
      }

      const overview = await LearningProgressService.getOverview(
        userId,
        careerId,
      );

      return res.status(200).json({
        success: true,
        message: "Learning progress overview retrieved successfully.",
        data: overview,
      });
    } catch (error) {
      console.error("Get Progress Overview Error:", error);

      return res.status(500).json({
        success: false,
        message: error.message || "Unable to retrieve progress overview.",
      });
    }
  }

  /*
  |--------------------------------------------------------------------------
  | GET SESSION ANALYTICS
  |--------------------------------------------------------------------------
  | GET /api/v1/learning-progress/sessions?careerId=backend-developer
  */

  async getSessionAnalytics(req, res) {
    try {
      const userId = req.user._id;
      const { careerId } = req.query;

      if (!careerId) {
        return res.status(400).json({
          success: false,
          message: "careerId is required.",
        });
      }

      const analytics = await LearningProgressService.getSessionAnalytics(
        userId,
        careerId,
      );

      return res.status(200).json({
        success: true,
        message: "Learning session analytics retrieved successfully.",
        data: analytics,
      });
    } catch (error) {
      console.error("Get Session Analytics Error:", error);

      return res.status(500).json({
        success: false,
        message: error.message || "Unable to retrieve session analytics.",
      });
    }
  }

  /*
  |--------------------------------------------------------------------------
  | GET TOPIC ANALYTICS
  |--------------------------------------------------------------------------
  | GET /api/v1/learning-progress/topics?careerId=backend-developer
  */

  async getTopicAnalytics(req, res) {
    try {
      const userId = req.user._id;
      const { careerId } = req.query;

      if (!careerId) {
        return res.status(400).json({
          success: false,
          message: "careerId is required.",
        });
      }

      const topics = await LearningProgressService.getTopicAnalytics(
        userId,
        careerId,
      );

      return res.status(200).json({
        success: true,
        message: "Topic progress analytics retrieved successfully.",
        data: topics,
      });
    } catch (error) {
      console.error("Get Topic Analytics Error:", error);

      return res.status(500).json({
        success: false,
        message: error.message || "Unable to retrieve topic analytics.",
      });
    }
  }

  /*
  |--------------------------------------------------------------------------
  | GET LEARNING QUALITY
  |--------------------------------------------------------------------------
  | GET /api/v1/learning-progress/quality?careerId=backend-developer
  */

  async getLearningQuality(req, res) {
    try {
      const userId = req.user._id;
      const { careerId } = req.query;

      if (!careerId) {
        return res.status(400).json({
          success: false,
          message: "careerId is required.",
        });
      }

      const quality = await LearningProgressService.getLearningQuality(
        userId,
        careerId,
      );

      return res.status(200).json({
        success: true,
        message: "Learning quality analytics retrieved successfully.",
        data: quality,
      });
    } catch (error) {
      console.error("Get Learning Quality Error:", error);

      return res.status(500).json({
        success: false,
        message: error.message || "Unable to retrieve learning quality.",
      });
    }
  }

  /*
  |--------------------------------------------------------------------------
  | GET ACTIVITY ANALYTICS
  |--------------------------------------------------------------------------
  | GET /api/v1/learning-progress/activity
  |
  | Query:
  | ?careerId=backend-developer&days=30
  */

  async getActivityAnalytics(req, res) {
    try {
      const userId = req.user._id;
      const { careerId, days = 30 } = req.query;

      if (!careerId) {
        return res.status(400).json({
          success: false,
          message: "careerId is required.",
        });
      }

      const numericDays = Number(days);

      if (
        !Number.isFinite(numericDays) ||
        numericDays < 7 ||
        numericDays > 365
      ) {
        return res.status(400).json({
          success: false,
          message: "days must be a number between 7 and 365.",
        });
      }

      const activity = await LearningProgressService.getActivityAnalytics(
        userId,
        careerId,
        numericDays,
      );

      return res.status(200).json({
        success: true,
        message: "Learning activity analytics retrieved successfully.",
        data: activity,
      });
    } catch (error) {
      console.error("Get Activity Analytics Error:", error);

      return res.status(500).json({
        success: false,
        message: error.message || "Unable to retrieve learning activity.",
      });
    }
  }

  /*
  |--------------------------------------------------------------------------
  | GET AI-READY PROGRESS INSIGHTS
  |--------------------------------------------------------------------------
  | GET /api/v1/learning-progress/insights
  */

  async getProgressInsights(req, res) {
    try {
      const userId = req.user._id;
      const { careerId } = req.query;

      if (!careerId) {
        return res.status(400).json({
          success: false,
          message: "careerId is required.",
        });
      }

      const insights = await LearningProgressService.getProgressInsights(
        userId,
        careerId,
      );

      return res.status(200).json({
        success: true,
        message: "Learning progress insights retrieved successfully.",
        data: insights,
      });
    } catch (error) {
      console.error("Get Progress Insights Error:", error);

      return res.status(500).json({
        success: false,
        message: error.message || "Unable to generate progress insights.",
      });
    }
  }

  /*
  |--------------------------------------------------------------------------
  | GET LEARNING FORECAST
  |--------------------------------------------------------------------------
  | GET /api/v1/learning-progress/forecast
  */

  async getLearningForecast(req, res) {
    try {
      const userId = req.user._id;
      const { careerId } = req.query;

      if (!careerId) {
        return res.status(400).json({
          success: false,
          message: "careerId is required.",
        });
      }

      const forecast = await LearningProgressService.getLearningForecast(
        userId,
        careerId,
      );

      return res.status(200).json({
        success: true,
        message: "Learning completion forecast retrieved successfully.",
        data: forecast,
      });
    } catch (error) {
      console.error("Get Learning Forecast Error:", error);

      return res.status(500).json({
        success: false,
        message: error.message || "Unable to generate learning forecast.",
      });
    }
  }

  /*
  |--------------------------------------------------------------------------
  | COMPLETE TOPIC
  |--------------------------------------------------------------------------
  | POST /api/v1/learning-progress/complete-topic
  */

  async completeTopic(req, res) {
    try {
      const userId = req.user._id;
      const { careerId, topic } = req.body;

      if (!careerId) {
        return res.status(400).json({
          success: false,
          message: "careerId is required.",
        });
      }

      if (!topic || !String(topic).trim()) {
        return res.status(400).json({
          success: false,
          message: "topic is required.",
        });
      }

      const progress = await LearningProgressService.completeTopic(
        userId,
        careerId,
        topic,
      );

      return res.status(200).json({
        success: true,
        message: `Topic "${String(topic).trim()}" completed successfully.`,
        data: progress,
      });
    } catch (error) {
      console.error("Complete Topic Error:", error);

      return res.status(400).json({
        success: false,
        message: error.message || "Unable to complete topic.",
      });
    }
  }

  /*
  |--------------------------------------------------------------------------
  | COMPLETE TODAY'S LEARNING PLAN
  |--------------------------------------------------------------------------
  | POST /api/v1/learning-progress/complete-today
  */

  async completeTodayPlan(req, res) {
    try {
      const userId = req.user._id;
      const { careerId } = req.body;

      if (!careerId) {
        return res.status(400).json({
          success: false,
          message: "careerId is required.",
        });
      }

      const progress = await LearningProgressService.completeTodayPlan(
        userId,
        careerId,
      );

      return res.status(200).json({
        success: true,
        message: "Today's learning plan completed successfully.",
        data: progress,
      });
    } catch (error) {
      console.error("Complete Today's Plan Error:", error);

      return res.status(400).json({
        success: false,
        message: error.message || "Unable to complete today's learning plan.",
      });
    }
  }

  /*
  |--------------------------------------------------------------------------
  | UPDATE STUDY HOURS
  |--------------------------------------------------------------------------
  | PATCH /api/v1/learning-progress/study-hours
  */

  async updateStudyHours(req, res) {
    try {
      const userId = req.user._id;
      const { careerId, hours } = req.body;

      if (!careerId) {
        return res.status(400).json({
          success: false,
          message: "careerId is required.",
        });
      }

      if (hours === undefined || hours === null) {
        return res.status(400).json({
          success: false,
          message: "hours is required.",
        });
      }

      const numericHours = Number(hours);

      if (!Number.isFinite(numericHours) || numericHours <= 0) {
        return res.status(400).json({
          success: false,
          message: "hours must be a valid number greater than 0.",
        });
      }

      const progress = await LearningProgressService.updateStudyHours(
        userId,
        careerId,
        numericHours,
      );

      return res.status(200).json({
        success: true,
        message: "Study hours updated successfully.",
        data: progress,
      });
    } catch (error) {
      console.error("Update Study Hours Error:", error);

      return res.status(400).json({
        success: false,
        message: error.message || "Unable to update study hours.",
      });
    }
  }

  /*
  |--------------------------------------------------------------------------
  | UPDATE LEARNING STREAK
  |--------------------------------------------------------------------------
  | PATCH /api/v1/learning-progress/streak
  */

  async updateStreak(req, res) {
    try {
      const userId = req.user._id;
      const { careerId } = req.body;

      if (!careerId) {
        return res.status(400).json({
          success: false,
          message: "careerId is required.",
        });
      }

      const progress = await LearningProgressService.updateStreak(
        userId,
        careerId,
      );

      return res.status(200).json({
        success: true,
        message: "Learning streak updated successfully.",
        data: progress,
      });
    } catch (error) {
      console.error("Update Streak Error:", error);

      return res.status(400).json({
        success: false,
        message: error.message || "Unable to update learning streak.",
      });
    }
  }
}

module.exports = new LearningProgressController();
