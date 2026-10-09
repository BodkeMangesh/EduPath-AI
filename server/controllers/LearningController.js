const LearningService = require("../services/LearningService");
const LearningSessionService = require("../services/LearningSessionService");
const asyncHandler = require("../middleware/asyncHandler");

class LearningController {
  /*
  |--------------------------------------------------------------------------
  | GET LEARNING PROGRESS
  |--------------------------------------------------------------------------
  */

  getProgress = asyncHandler(async (req, res) => {
    const { careerId } = req.query;

    const progress = await LearningService.getProgress(req.user._id, careerId);

    res.status(200).json({
      success: true,
      data: progress,
    });
  });

  /*
  |--------------------------------------------------------------------------
  | COMPLETE TOPIC
  |--------------------------------------------------------------------------
  */

  completeTopic = asyncHandler(async (req, res) => {
    const { careerId, topic } = req.body;

    const progress = await LearningService.completeTopic(
      req.user._id,
      careerId,
      topic,
    );

    res.status(200).json({
      success: true,
      message: "Topic completed successfully.",
      data: progress,
    });
  });

  /*
  |--------------------------------------------------------------------------
  | COMPLETE TODAY'S PLAN
  |--------------------------------------------------------------------------
  */

  completeTodayPlan = asyncHandler(async (req, res) => {
    const { careerId } = req.body;

    const progress = await LearningService.completeTodayPlan(
      req.user._id,
      careerId,
    );

    res.status(200).json({
      success: true,
      message: "Today's learning plan completed successfully.",
      data: progress,
    });
  });

  /*
  |--------------------------------------------------------------------------
  | START LEARNING SESSION
  |--------------------------------------------------------------------------
  */

  startSession = asyncHandler(async (req, res) => {
    const {
      careerId,
      phase,
      phaseTitle,
      topic,
      type,
      plannedDurationMinutes,
      learningStyle,
      resourceTitle,
      resourceProvider,
      resourceUrl,
      source,
    } = req.body;

    const session = await LearningSessionService.startSession({
      userId: req.user._id,
      careerId,
      phase,
      phaseTitle,
      topic,
      type,
      plannedDurationMinutes,
      learningStyle,
      resourceTitle,
      resourceProvider,
      resourceUrl,
      source,
    });

    res.status(201).json({
      success: true,
      message: "Learning session started successfully.",
      data: session,
    });
  });

  /*
  |--------------------------------------------------------------------------
  | GET SESSION BY ID
  |--------------------------------------------------------------------------
  */

  getSession = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;

    const session = await LearningSessionService.getSession(
      sessionId,
      req.user._id,
    );

    res.status(200).json({
      success: true,
      data: LearningSessionService.decorateSession(session),
    });
  });

  /*
  |--------------------------------------------------------------------------
  | PAUSE SESSION
  |--------------------------------------------------------------------------
  */

  pauseSession = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;

    const session = await LearningSessionService.pauseSession(
      sessionId,
      req.user._id,
    );

    res.status(200).json({
      success: true,
      message: "Learning session paused.",
      data: session,
    });
  });

  /*
  |--------------------------------------------------------------------------
  | RESUME SESSION
  |--------------------------------------------------------------------------
  */

  resumeSession = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;

    const session = await LearningSessionService.resumeSession(
      sessionId,
      req.user._id,
    );

    res.status(200).json({
      success: true,
      message: "Learning session resumed.",
      data: session,
    });
  });

  /*
  |--------------------------------------------------------------------------
  | UPDATE SESSION PROGRESS
  |--------------------------------------------------------------------------
  */

  updateSessionProgress = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;
    const { progress } = req.body;

    const session = await LearningSessionService.updateProgress(
      sessionId,
      req.user._id,
      progress,
    );

    res.status(200).json({
      success: true,
      message: "Learning session progress updated.",
      data: session,
    });
  });

  /*
  |--------------------------------------------------------------------------
  | UPDATE SESSION NOTES
  |--------------------------------------------------------------------------
  */

  updateSessionNotes = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;
    const { notes } = req.body;

    const session = await LearningSessionService.updateNotes(
      sessionId,
      req.user._id,
      notes,
    );

    res.status(200).json({
      success: true,
      message: "Learning session notes updated.",
      data: session,
    });
  });

  /*
  |--------------------------------------------------------------------------
  | UPDATE LEARNING INTELLIGENCE
  |--------------------------------------------------------------------------
  */

  updateLearningIntelligence = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;

    const {
      understandingScore,
      confidenceScore,
      focusScore,
      focusLevel,
      difficultyLevel,
      aiCoachInsights,
      aiRecommendation,
      aiRevisionRequired,
      revisionRecommended,
      revisionReason,
      xpEarned,
    } = req.body;

    const session = await LearningSessionService.updateLearningIntelligence(
      sessionId,
      req.user._id,
      {
        understandingScore,
        confidenceScore,
        focusScore,
        focusLevel,
        difficultyLevel,
        aiCoachInsights,
        aiRecommendation,
        aiRevisionRequired,
        revisionRecommended,
        revisionReason,
        xpEarned,
      },
    );

    res.status(200).json({
      success: true,
      message: "Learning intelligence updated successfully.",
      data: session,
    });
  });

  /*
  |--------------------------------------------------------------------------
  | UPDATE UNDERSTANDING CHECK
  |--------------------------------------------------------------------------
  */

  updateUnderstandingCheck = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;

    const {
      question,
      options,
      correctAnswer,
      userAnswer,
      isCorrect,
      feedback,
      questionsAttempted,
      questionsCorrect,
      assessmentScore,
    } = req.body;

    const session = await LearningSessionService.updateUnderstandingCheck(
      sessionId,
      req.user._id,
      {
        question,
        options,
        correctAnswer,
        userAnswer,
        isCorrect,
        feedback,
        questionsAttempted,
        questionsCorrect,
        assessmentScore,
      },
    );

    res.status(200).json({
      success: true,
      message: "Understanding check updated successfully.",
      data: session,
    });
  });

  /*
  |--------------------------------------------------------------------------
  | UPDATE NEXT TOPIC RECOMMENDATION
  |--------------------------------------------------------------------------
  */

  updateNextTopicRecommendation = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;

    const { nextTopic, revisionRecommended, revisionReason } = req.body;

    const session = await LearningSessionService.updateNextTopicRecommendation(
      sessionId,
      req.user._id,
      {
        nextTopic,
        revisionRecommended,
        revisionReason,
      },
    );

    res.status(200).json({
      success: true,
      message: "Next topic recommendation updated successfully.",
      data: session,
    });
  });

  /*
  |--------------------------------------------------------------------------
  | UPDATE SESSION DURATION
  |--------------------------------------------------------------------------
  */

  updateSessionDuration = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;

    const { durationSeconds, durationMinutes } = req.body;

    const session = await LearningSessionService.updateDuration(
      sessionId,
      req.user._id,
      {
        durationSeconds,
        durationMinutes,
      },
    );

    res.status(200).json({
      success: true,
      message: "Learning session duration updated successfully.",
      data: session,
    });
  });

  /*
  |--------------------------------------------------------------------------
  | COMPLETE SESSION
  |--------------------------------------------------------------------------
  */

  completeSession = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;

    const { topicCompleted = false } = req.body;

    const existingSession = await LearningSessionService.getSession(
      sessionId,
      req.user._id,
    );

    const wasAlreadyCompleted = existingSession.status === "completed";

    let topicWasAlreadyCompleted = false;

    if (topicCompleted === true) {
      const existingProgress = await LearningService.getProgress(
        req.user._id,
        existingSession.careerId,
      );

      topicWasAlreadyCompleted = (existingProgress?.completedTopics || []).some(
        (completedTopic) =>
          String(completedTopic).trim().toLowerCase() ===
          String(existingSession.topic).trim().toLowerCase(),
      );
    }

    const session = await LearningSessionService.completeSession(
      sessionId,
      req.user._id,
      {
        topicCompleted: topicCompleted === true,
      },
    );

    /*
    |--------------------------------------------------------------------------
    | UPDATE STUDY HOURS
    |--------------------------------------------------------------------------
    */

    if (!wasAlreadyCompleted) {
      const durationSeconds = Number(session?.durationSeconds) || 0;

      const studyHours = durationSeconds / 3600;

      if (studyHours > 0) {
        await LearningService.updateStudyHours(
          req.user._id,
          session.careerId,
          studyHours,
        );
      }
    }

    /*
    |--------------------------------------------------------------------------
    | COMPLETE TOPIC
    |--------------------------------------------------------------------------
    */

    if (topicCompleted === true && !topicWasAlreadyCompleted) {
      await LearningService.completeTopic(
        req.user._id,
        session.careerId,
        session.topic,
      );
    }

    /*
    |--------------------------------------------------------------------------
    | GET UPDATED PROGRESS
    |--------------------------------------------------------------------------
    */

    const updatedProgress = await LearningService.getProgress(
      req.user._id,
      session.careerId,
    );

    res.status(200).json({
      success: true,
      message: "Learning session completed successfully.",
      data: {
        session,
        progress: updatedProgress,
      },
    });
  });

  /*
  |--------------------------------------------------------------------------
  | ABANDON SESSION
  |--------------------------------------------------------------------------
  */

  abandonSession = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;

    const session = await LearningSessionService.abandonSession(
      sessionId,
      req.user._id,
    );

    res.status(200).json({
      success: true,
      message: "Learning session abandoned.",
      data: session,
    });
  });

  /*
  |--------------------------------------------------------------------------
  | GET ACTIVE SESSION
  |--------------------------------------------------------------------------
  */

  getActiveSession = asyncHandler(async (req, res) => {
    const { careerId, topic } = req.query;

    const session = await LearningSessionService.getActiveSession(
      req.user._id,
      careerId,
      topic,
    );

    res.status(200).json({
      success: true,
      data: session,
    });
  });

  /*
  |--------------------------------------------------------------------------
  | GET LEARNING HISTORY
  |--------------------------------------------------------------------------
  */

  getHistory = asyncHandler(async (req, res) => {
    const { careerId, limit } = req.query;

    const sessions = await LearningSessionService.getHistory(
      req.user._id,
      careerId,
      {
        limit,
      },
    );

    res.status(200).json({
      success: true,
      data: sessions,
    });
  });

  /*
  |--------------------------------------------------------------------------
  | GET TOPIC STATISTICS
  |--------------------------------------------------------------------------
  */

  getTopicStatistics = asyncHandler(async (req, res) => {
    const { careerId, topic } = req.query;

    const statistics = await LearningSessionService.getTopicStatistics(
      req.user._id,
      careerId,
      topic,
    );

    res.status(200).json({
      success: true,
      data: statistics,
    });
  });

  /*
  |--------------------------------------------------------------------------
  | GET LEARNING SUMMARY
  |--------------------------------------------------------------------------
  */

  getLearningSummary = asyncHandler(async (req, res) => {
    const { careerId } = req.query;

    const summary = await LearningSessionService.getLearningSummary(
      req.user._id,
      careerId,
    );

    res.status(200).json({
      success: true,
      data: summary,
    });
  });
}

module.exports = new LearningController();
