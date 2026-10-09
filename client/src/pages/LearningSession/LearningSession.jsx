import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./LearningSession.css";

import {
  startLearningSession,
  getActiveLearningSession,
  pauseLearningSession,
  resumeLearningSession,
  updateLearningSessionProgress,
  updateLearningSessionNotes,
  updateLearningIntelligence,
  updateUnderstandingCheck,
  updateNextTopicRecommendation,
  updateLearningSessionDuration,
  completeLearningSession,
  abandonLearningSession,
} from "../../services/learningService";

function LearningSession() {
  const location = useLocation();
  const navigate = useNavigate();

  const sessionData = location.state || {};

  const {
    careerId: stateCareerId,
    phase,
    phaseTitle,
    topic,
    learningAction,
    resource = null,
    sessionType = "learn",
    plannedDurationMinutes = 30,
    learningStyle = "mixed",
    topics = [],
    pendingTopics = [],
  } = sessionData;

  const careerId = stateCareerId || localStorage.getItem("selectedCareerId");

  const [session, setSession] = useState(null);

  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(
    Math.max(0, Number(plannedDurationMinutes || 30) * 60),
  );
  const [sessionProgress, setSessionProgress] = useState(0);

  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  const [understandingLoading, setUnderstandingLoading] = useState(false);
  const [understandingAnswer, setUnderstandingAnswer] = useState("");
  const [understandingFeedback, setUnderstandingFeedback] = useState("");

  const [coachLoading, setCoachLoading] = useState(false);
  const [nextTopicLoading, setNextTopicLoading] = useState(false);

  const [focusScore, setFocusScore] = useState(null);
  const [focusLevel, setFocusLevel] = useState("");
  const [coachInsights, setCoachInsights] = useState([]);
  const [aiRecommendation, setAiRecommendation] = useState("");

  const [revisionRecommended, setRevisionRecommended] = useState(false);
  const [revisionReason, setRevisionReason] = useState("");

  const [nextTopic, setNextTopic] = useState("");

  const timerRef = useRef(null);
  const progressUpdateRef = useRef(null);
  const intelligenceRef = useRef(null);

  const extractData = (response) => {
    if (!response) return null;

    if (response.data?.data !== undefined) {
      return response.data.data;
    }

    if (response.data !== undefined) {
      return response.data;
    }

    return response;
  };

  const getSessionId = (currentSession = session) =>
    currentSession?._id || currentSession?.id;

  const formatTime = (seconds) => {
    const total = Math.max(0, Number(seconds) || 0);

    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const secs = total % 60;

    if (hours > 0) {
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
        2,
        "0",
      )}:${String(secs).padStart(2, "0")}`;
    }

    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(
      2,
      "0",
    )}`;
  };

  const normalizedTopics = useMemo(() => {
    if (!Array.isArray(topics)) return [];

    return topics
      .map((item) => {
        if (typeof item === "string") return item;

        return item?.title || item?.topic || item?.name || item?.label || "";
      })
      .filter(Boolean);
  }, [topics]);

  const calculatedFocusScore = useMemo(() => {
    if (!session) return null;

    const planned =
      Number(
        session.plannedDurationSeconds ??
          Number(session.plannedDurationMinutes || plannedDurationMinutes) * 60,
      ) || 1800;

    const elapsed = Math.max(0, Number(elapsedSeconds) || 0);

    const timeScore = Math.min(100, (elapsed / planned) * 100);

    const progressScore = Math.min(
      100,
      Math.max(0, Number(sessionProgress) || 0),
    );

    const understandingScore =
      Number(session.understandingScore) >= 0
        ? Number(session.understandingScore)
        : 50;

    const pausePenalty = session.status === "paused" ? 10 : 0;

    return Math.round(
      Math.max(
        0,
        Math.min(
          100,
          timeScore * 0.25 +
            progressScore * 0.35 +
            understandingScore * 0.3 +
            (100 - pausePenalty) * 0.1,
        ),
      ),
    );
  }, [session, elapsedSeconds, sessionProgress, plannedDurationMinutes]);

  const displayedFocusScore =
    Number(focusScore) >= 0 ? Number(focusScore) : calculatedFocusScore;

  const getFocusLevel = (score) => {
    if (score === null || score === undefined) return "";

    if (score >= 80) return "high";
    if (score >= 50) return "moderate";

    return "low";
  };

  const currentStatus = session?.status || "started";

  const isStarted = currentStatus === "started";
  const isPaused = currentStatus === "paused";
  const isCompleted = currentStatus === "completed";
  const isAbandoned = currentStatus === "abandoned";

  const assessmentScore =
    session?.assessmentScore ?? session?.understandingScore ?? null;

  /*
   * =========================
   * TIMER / SESSION CLEANUP
   * =========================
   */

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const clearProgressUpdater = () => {
    if (progressUpdateRef.current) {
      clearInterval(progressUpdateRef.current);
      progressUpdateRef.current = null;
    }
  };

  const clearIntelligenceUpdater = () => {
    if (intelligenceRef.current) {
      clearInterval(intelligenceRef.current);
      intelligenceRef.current = null;
    }
  };

  /*
   * =========================
   * SESSION STATE SYNC
   * =========================
   */

  const syncSessionState = (currentSession) => {
    if (!currentSession) return;

    const elapsed = Number(
      currentSession.elapsedSeconds ?? currentSession.durationSeconds ?? 0,
    );

    const planned =
      Number(
        currentSession.plannedDurationSeconds ??
          (Number(currentSession.plannedDurationMinutes) || 0) * 60,
      ) || Number(plannedDurationMinutes || 30) * 60;

    const remaining = Number(
      currentSession.remainingSeconds ?? Math.max(0, planned - elapsed),
    );

    const progress = Number(
      currentSession.progress ?? currentSession.calculatedProgress ?? 0,
    );

    setElapsedSeconds(Math.max(0, Math.floor(elapsed)));
    setRemainingSeconds(Math.max(0, Math.floor(remaining)));
    setSessionProgress(Math.min(100, Math.max(0, Math.round(progress))));
  };

  const startTimer = (currentSession) => {
    clearTimer();

    if (!currentSession) return;
    if (currentSession.status !== "started") return;

    let localElapsed = Number(
      currentSession.elapsedSeconds ?? currentSession.durationSeconds ?? 0,
    );

    const plannedSeconds =
      Number(
        currentSession.plannedDurationSeconds ??
          Number(currentSession.plannedDurationMinutes || 30) * 60,
      ) || 1800;

    let localRemaining = Math.max(
      0,
      Number(currentSession.remainingSeconds ?? plannedSeconds - localElapsed),
    );

    let localProgress = Number(currentSession.progress ?? 0);

    setElapsedSeconds(Math.floor(localElapsed));
    setRemainingSeconds(Math.floor(localRemaining));
    setSessionProgress(Math.min(100, Math.max(0, localProgress)));

    timerRef.current = setInterval(() => {
      localElapsed += 1;

      if (localRemaining > 0) {
        localRemaining -= 1;
      }

      localProgress = Math.min(
        100,
        Math.round((localElapsed / plannedSeconds) * 100),
      );

      setElapsedSeconds(Math.floor(localElapsed));
      setRemainingSeconds(Math.floor(localRemaining));
      setSessionProgress(localProgress);

      if (localProgress >= 100) {
        clearTimer();
      }
    }, 1000);
  };

  /*
   * =========================
   * INITIALIZE SESSION
   * =========================
   */

  useEffect(() => {
    initializeSession();

    return () => {
      clearTimer();
      clearProgressUpdater();
      clearIntelligenceUpdater();
    };
  }, []);

  useEffect(() => {
    if (!session) return;

    setNotes(session.notes || "");

    if (session.focusScore !== null && session.focusScore !== undefined) {
      setFocusScore(Number(session.focusScore));
    }

    if (session.focusLevel) {
      setFocusLevel(session.focusLevel);
    }

    if (Array.isArray(session.aiCoachInsights)) {
      setCoachInsights(session.aiCoachInsights);
    }

    if (session.aiRecommendation) {
      setAiRecommendation(session.aiRecommendation);
    }

    if (session.revisionRecommended !== undefined) {
      setRevisionRecommended(Boolean(session.revisionRecommended));
    }

    if (session.revisionReason) {
      setRevisionReason(session.revisionReason);
    }

    if (session.nextTopic) {
      setNextTopic(session.nextTopic);
    }

    syncSessionState(session);
  }, [session?._id]);

  const initializeSession = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      if (!careerId) {
        throw new Error("Career information is missing.");
      }

      if (!topic) {
        throw new Error("Learning topic is missing.");
      }

      const activeResponse = await getActiveLearningSession({
        careerId,
        topic,
      });

      const activeSession = extractData(activeResponse);

      if (activeSession) {
        setSession(activeSession);
        syncSessionState(activeSession);

        if (activeSession.status === "started") {
          startTimer(activeSession);
        }

        return;
      }

      await createSession();
    } catch (err) {
      console.error("Learning session initialization error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to start learning session.",
      );
    } finally {
      setLoading(false);
    }
  };

  const createSession = async () => {
    try {
      setStarting(true);
      setError("");

      const response = await startLearningSession({
        careerId,
        phase,
        phaseTitle,
        topic,
        type: sessionType,
        plannedDurationMinutes: Number(plannedDurationMinutes) || 30,
        learningStyle,
        resourceTitle: resource?.title || resource?.name || "",
        resourceProvider: resource?.provider || resource?.source || "",
        resourceUrl: resource?.url || resource?.link || "",
        source: "resources",
      });

      const newSession = extractData(response);

      if (!newSession) {
        throw new Error("Session could not be created.");
      }

      setSession(newSession);
      syncSessionState(newSession);

      if (newSession.status === "started") {
        startTimer(newSession);
      }
    } catch (err) {
      console.error("Create session error:", err);

      if (err?.response?.status === 409) {
        try {
          const activeResponse = await getActiveLearningSession({
            careerId,
            topic,
          });

          const activeSession = extractData(activeResponse);

          if (activeSession) {
            setSession(activeSession);
            syncSessionState(activeSession);

            if (activeSession.status === "started") {
              startTimer(activeSession);
            }

            return;
          }
        } catch (activeError) {
          console.error("Unable to recover active session:", activeError);
        }
      }

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to create learning session.",
      );
    } finally {
      setStarting(false);
    }
  };

  /*
   * =========================
   * PERIODIC PROGRESS SYNC
   * =========================
   */

  useEffect(() => {
    if (!session) return;

    if (session.status !== "started") {
      clearProgressUpdater();
      return;
    }

    clearProgressUpdater();

    progressUpdateRef.current = setInterval(async () => {
      try {
        const sessionId = getSessionId();

        if (!sessionId) return;

        const response = await updateLearningSessionProgress(
          sessionId,
          sessionProgress,
        );

        const updatedSession = extractData(response);

        if (updatedSession) {
          setSession((previous) => ({
            ...previous,
            ...updatedSession,
          }));
        }
      } catch (err) {
        console.error("Progress sync failed:", err);
      }
    }, 30000);

    return () => {
      clearProgressUpdater();
    };
  }, [session?._id, session?.status, sessionProgress]);

  /*
   * =========================
   * PAUSE / RESUME
   * =========================
   */

  const handlePause = async () => {
    if (!session) return;

    try {
      setActionLoading(true);
      setError("");
      setMessage("");

      const response = await pauseLearningSession(getSessionId());

      const updatedSession = extractData(response);

      if (updatedSession) {
        setSession(updatedSession);
        syncSessionState(updatedSession);
      }

      clearTimer();

      setMessage("Learning session paused.");
    } catch (err) {
      console.error("Pause session error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to pause session.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleResume = async () => {
    if (!session) return;

    try {
      setActionLoading(true);
      setError("");
      setMessage("");

      const response = await resumeLearningSession(getSessionId());

      const updatedSession = extractData(response);

      if (updatedSession) {
        setSession(updatedSession);
        syncSessionState(updatedSession);

        if (updatedSession.status === "started") {
          startTimer(updatedSession);
        }
      }

      setMessage("Learning session resumed.");
    } catch (err) {
      console.error("Resume session error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to resume session.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  /*
   * =========================
   * PROGRESS
   * =========================
   */

  const handleProgressChange = async (value) => {
    const normalized = Math.min(100, Math.max(0, Number(value) || 0));

    setSessionProgress(normalized);

    if (!session || !getSessionId()) return;

    try {
      const response = await updateLearningSessionProgress(
        getSessionId(),
        normalized,
      );

      const updatedSession = extractData(response);

      if (updatedSession) {
        setSession((previous) => ({
          ...previous,
          ...updatedSession,
        }));
      }
    } catch (err) {
      console.error("Manual progress update failed:", err);
    }
  };

  /*
   * =========================
   * NOTES
   * =========================
   */

  const handleSaveNotes = async () => {
    if (!session) return;

    try {
      setSavingNotes(true);
      setError("");

      const response = await updateLearningSessionNotes(getSessionId(), notes);

      const updatedSession = extractData(response);

      if (updatedSession) {
        setSession((previous) => ({
          ...previous,
          ...updatedSession,
        }));
      }

      setMessage("Session notes saved.");
    } catch (err) {
      console.error("Save notes error:", err);

      setError(
        err?.response?.data?.message || err?.message || "Unable to save notes.",
      );
    } finally {
      setSavingNotes(false);
    }
  };

  /*
   * =========================
   * FOCUS COACH
   * =========================
   */

  const handleFocusCoach = async () => {
    if (!session) return;

    try {
      setCoachLoading(true);
      setError("");

      const score = displayedFocusScore === null ? 50 : displayedFocusScore;

      const level = getFocusLevel(score);

      const insights = [];

      if (score >= 80) {
        insights.push(
          "Your focus is strong. Keep your current learning rhythm.",
        );
      } else if (score >= 50) {
        insights.push(
          "Your focus is moderate. Reduce distractions and stay with one concept.",
        );
      } else {
        insights.push(
          "Your focus is low. Take a short reset and return to the current topic.",
        );
      }

      if (sessionProgress < 40) {
        insights.push(
          "Try completing one small section before switching tasks.",
        );
      }

      if (
        session.understandingScore !== null &&
        Number(session.understandingScore) < 60
      ) {
        insights.push(
          "Your understanding score suggests that this topic may need another explanation or revision.",
        );
      }

      const recommendation =
        score >= 80
          ? "Continue learning and start applying the concept with practice."
          : score >= 50
            ? "Stay on this topic and complete one focused learning block before taking a break."
            : "Take a short break, remove distractions, and restart with one small learning goal.";

      const response = await updateLearningIntelligence(getSessionId(), {
        focusScore: score,
        focusLevel: level,
        aiCoachInsights: insights,
        aiRecommendation: recommendation,
      });

      const updatedSession = extractData(response);

      setFocusScore(score);
      setFocusLevel(level);
      setCoachInsights(insights);
      setAiRecommendation(recommendation);

      if (updatedSession) {
        setSession((previous) => ({
          ...previous,
          ...updatedSession,
        }));
      }

      setMessage("Focus Coach updated.");
    } catch (err) {
      console.error("Focus coach error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to update Focus Coach.",
      );
    } finally {
      setCoachLoading(false);
    }
  };

  /*
   * =========================
   * UNDERSTANDING CHECK
   * =========================
   */

  const generateUnderstandingQuestion = () => {
    const questions = {
      learn: {
        question: `What is the most important thing you should understand about ${topic}?`,
        options: [
          "The core concept and why it works",
          "Only the topic name",
          "Only memorized definitions",
          "Nothing needs to be understood",
        ],
        correctAnswer: "The core concept and why it works",
      },

      practice: {
        question: `What should you do after learning ${topic}?`,
        options: [
          "Apply the concept in practice",
          "Stop learning immediately",
          "Ignore mistakes",
          "Memorize without practice",
        ],
        correctAnswer: "Apply the concept in practice",
      },

      revision: {
        question: `What is the main purpose of revising ${topic}?`,
        options: [
          "Strengthen understanding and recall",
          "Forget previous knowledge",
          "Avoid practice",
          "Skip difficult concepts",
        ],
        correctAnswer: "Strengthen understanding and recall",
      },
    };

    return questions[sessionType] || questions.learn;
  };

  const understandingQuestion = useMemo(() => {
    if (!topic) return null;

    if (session?.understandingCheck?.question) {
      return session.understandingCheck;
    }

    return generateUnderstandingQuestion();
  }, [topic, session?.understandingCheck?.question]);

  const handleUnderstandingCheck = async () => {
    if (!session) return;

    if (!understandingAnswer) {
      setUnderstandingFeedback("Please select an answer first.");
      return;
    }

    try {
      setUnderstandingLoading(true);
      setError("");

      const question = understandingQuestion;

      const isCorrect = understandingAnswer === question.correctAnswer;

      const feedback = isCorrect
        ? "Correct! You understood the key idea."
        : `Not quite. Focus again on the core concept of ${topic}.`;

      const response = await updateUnderstandingCheck(getSessionId(), {
        question: question.question,
        options: question.options,
        correctAnswer: question.correctAnswer,
        userAnswer: understandingAnswer,
        isCorrect,
        feedback,
      });

      const updatedSession = extractData(response);

      setUnderstandingFeedback(feedback);

      if (updatedSession) {
        setSession((previous) => ({
          ...previous,
          ...updatedSession,
        }));

        if (updatedSession.understandingScore !== null) {
          setFocusScore(Number(updatedSession.focusScore ?? focusScore ?? 0));
        }

        if (updatedSession.revisionRecommended !== undefined) {
          setRevisionRecommended(Boolean(updatedSession.revisionRecommended));
        }

        if (updatedSession.revisionReason) {
          setRevisionReason(updatedSession.revisionReason);
        }
      }

      if (!isCorrect) {
        setRevisionRecommended(true);

        setRevisionReason(
          `Your answer suggests that ${topic} needs another revision.`,
        );

        await updateNextTopicRecommendation(getSessionId(), {
          nextTopic: topic,
          revisionRecommended: true,
          revisionReason: `Your understanding check suggests that ${topic} needs another revision.`,
        });
      }

      setMessage(
        isCorrect
          ? "Understanding check completed successfully."
          : "Understanding check completed. Revision is recommended.",
      );
    } catch (err) {
      console.error("Understanding check error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to complete understanding check.",
      );
    } finally {
      setUnderstandingLoading(false);
    }
  };

  /*
   * =========================
   * NEXT TOPIC
   * =========================
   */

  const handleNextTopic = async () => {
    if (!session) return;

    try {
      setNextTopicLoading(true);
      setError("");

      const completedTopic = topic ? topic.trim().toLowerCase() : "";

      const candidate =
        normalizedTopics.find(
          (item) => item.trim().toLowerCase() !== completedTopic,
        ) ||
        pendingTopics.find(
          (item) =>
            typeof item === "string" &&
            item.trim().toLowerCase() !== completedTopic,
        ) ||
        "";

      if (!candidate) {
        setNextTopic("");
        setMessage("No next topic is available yet.");
        return;
      }

      const reason = `Continue with ${candidate} after completing ${topic}.`;

      const response = await updateNextTopicRecommendation(getSessionId(), {
        nextTopic: candidate,
        revisionRecommended,
        revisionReason: revisionRecommended ? revisionReason : "",
      });

      const updatedSession = extractData(response);

      setNextTopic(candidate);

      if (updatedSession) {
        setSession((previous) => ({
          ...previous,
          ...updatedSession,
        }));
      }

      setMessage(reason);
    } catch (err) {
      console.error("Next topic recommendation error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to get next topic.",
      );
    } finally {
      setNextTopicLoading(false);
    }
  };

  /*
   * =========================
   * DURATION
   * =========================
   */

  const handleUpdateDuration = async () => {
    if (!session) return;

    try {
      const response = await updateLearningSessionDuration(getSessionId());

      const updatedSession = extractData(response);

      if (updatedSession) {
        setSession((previous) => ({
          ...previous,
          ...updatedSession,
        }));

        syncSessionState(updatedSession);
      }
    } catch (err) {
      console.error("Duration update error:", err);
    }
  };

  /*
   * =========================
   * COMPLETE SESSION
   * =========================
   */

  const handleComplete = async (topicCompleted = true) => {
    if (!session) return;

    try {
      setActionLoading(true);
      setError("");
      setMessage("");

      clearTimer();
      clearProgressUpdater();
      clearIntelligenceUpdater();

      await handleUpdateDuration();

      const finalFocusScore =
        displayedFocusScore === null ? 50 : displayedFocusScore;

      await updateLearningIntelligence(getSessionId(), {
        focusScore: finalFocusScore,
        focusLevel: getFocusLevel(finalFocusScore),
        understandingScore: session.understandingScore,
        confidenceScore: session.confidenceScore,
        difficultyLevel: session.difficultyLevel || "medium",
        aiCoachInsights: coachInsights,
        aiRecommendation,
        aiRevisionRequired: revisionRecommended,
        revisionRecommended,
        revisionReason,
        nextTopic,
        xpEarned: Math.max(10, Math.round(elapsedSeconds / 60)),
      });

      const response = await completeLearningSession(
        getSessionId(),
        topicCompleted,
      );

      const result = extractData(response);

      const completedSession = result?.session || result;

      if (completedSession) {
        setSession(completedSession);
        syncSessionState(completedSession);
      }

      setSessionProgress(100);

      setMessage(
        topicCompleted
          ? "Great work! Topic completed successfully 🎉"
          : "Learning session completed successfully.",
      );
    } catch (err) {
      console.error("Complete session error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to complete learning session.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  /*
   * =========================
   * ABANDON SESSION
   * =========================
   */

  const handleAbandon = async () => {
    if (!session) return;

    const confirmed = window.confirm(
      "Are you sure you want to leave this learning session?",
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setError("");
      setMessage("");

      clearTimer();
      clearProgressUpdater();
      clearIntelligenceUpdater();

      const response = await abandonLearningSession(getSessionId());

      const abandonedSession = extractData(response);

      if (abandonedSession) {
        setSession(abandonedSession);
        syncSessionState(abandonedSession);
      }

      setMessage("Learning session ended.");
    } catch (err) {
      console.error("Abandon session error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to end session.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  /*
   * =========================
   * RESOURCE
   * =========================
   */

  const handleOpenResource = () => {
    const url = resource?.url || resource?.link;

    if (!url) return;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  /*
   * =========================
   * NAVIGATION
   * =========================
   *
   * Learning Session is a child flow of Learning/Resources.
   *
   * Active session:
   * Session -> Resources
   *
   * Completed session:
   * Session -> Next Topic / Progress
   *
   * Abandoned session:
   * Session -> Learning
   */

  const buildLearningContext = (overrides = {}) => ({
    careerId,
    phase,
    phaseTitle,
    topic,
    topics,
    pendingTopics,
    learningAction,
    resource,
    sessionType,
    plannedDurationMinutes,
    learningStyle,
    learningSessionId: getSessionId(),
    learningSessionStatus: session?.status || "",
    topicCompleted: isCompleted,
    ...overrides,
  });

  const handleBackToResources = () => {
    navigate("/resources", {
      state: buildLearningContext({
        learningAction: "back",
      }),
    });
  };

  const handleBackToLearning = () => {
    navigate("/learning", {
      state: buildLearningContext({
        learningAction: "session",
      }),
    });
  };

  const handleBackNavigation = () => {
    if (isCompleted || isAbandoned) {
      handleBackToLearning();
      return;
    }

    handleBackToResources();
  };

  const handleNextToResources = () => {
    navigate("/resources", {
      state: buildLearningContext({
        topic: nextTopic || topic,
        learningAction: nextTopic ? "continue" : "completed",
        completedTopic: topic,
      }),
    });
  };

  const handleViewProgress = () => {
    navigate("/progress", {
      state: {
        careerId,
        learningSessionId: getSessionId(),
        topic,
        topicCompleted: isCompleted,
      },
    });
  };

  const handleContinueNextTopic = () => {
    if (!nextTopic) return;

    handleNextToResources();
  };

  const handleCompletionNavigation = () => {
    if (nextTopic) {
      handleContinueNextTopic();
      return;
    }

    handleViewProgress();
  };

  /*
   * =========================
   * LOADING STATE
   * =========================
   */

  if (loading || starting) {
    return (
      <div className="learning-session-page">
        <div className="learning-session-loading">
          <div className="loading-spinner" />

          <h2>Preparing your learning session...</h2>

          <p>Please wait.</p>
        </div>
      </div>
    );
  }

  /*
   * =========================
   * ERROR STATE
   * =========================
   */

  if (error && !session) {
    return (
      <div className="learning-session-page">
        <div className="learning-session-error">
          <div className="error-icon">⚠️</div>

          <h2>Unable to start learning session</h2>

          <p>{error}</p>

          <div className="session-error-actions">
            <button
              type="button"
              className="primary-btn"
              onClick={initializeSession}
            >
              Try Again
            </button>

            <button
              type="button"
              className="secondary-btn"
              onClick={handleBackToResources}
            >
              Back to Resources
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="learning-session-page">
      <div className="learning-session-container">
        {/* =========================
            TOP FLOW NAVIGATION
        ========================== */}
        <nav
          className="learning-session-flow-navigation"
          aria-label="Learning session navigation"
        >
          <button
            type="button"
            className="learning-session-flow-button learning-session-flow-back"
            onClick={handleBackNavigation}
          >
            {isCompleted || isAbandoned
              ? "← Back to Learning"
              : "← Back to Resources"}
          </button>

          <span className="learning-session-flow-current">
            {isCompleted
              ? "Learning Completed"
              : isAbandoned
                ? "Session Ended"
                : "Current Learning"}
          </span>

          <button
            type="button"
            className="learning-session-flow-button learning-session-flow-next"
            onClick={
              isCompleted ? handleCompletionNavigation : handleNextToResources
            }
          >
            {isCompleted
              ? nextTopic
                ? "Next Topic →"
                : "View Progress →"
              : "Resources →"}
          </button>
        </nav>

        {/* =========================
            HEADER
        ========================== */}
        <header className="learning-session-header">
          <div>
            <button
              type="button"
              className="back-btn"
              onClick={handleBackNavigation}
            >
              {isCompleted || isAbandoned
                ? "← Back to Learning"
                : "← Back to Resources"}
            </button>

            <div className="session-breadcrumb">
              {phaseTitle && <span>{phaseTitle}</span>}

              {phaseTitle && topic && <span> / </span>}

              {topic && <strong>{topic}</strong>}
            </div>
          </div>

          <div className="session-status">
            <span className={`status-dot ${currentStatus}`} />

            <span>{currentStatus}</span>
          </div>
        </header>

        {error && <div className="session-alert error-alert">{error}</div>}

        {message && (
          <div className="session-alert success-alert">{message}</div>
        )}

        <main className="learning-session-content">
          {/* =========================
              TOPIC
          ========================== */}
          <section className="topic-card">
            <div className="topic-card-content">
              <span className="topic-label">
                {sessionType === "practice"
                  ? "Practice Session"
                  : sessionType === "revision"
                    ? "Revision Session"
                    : "Learning Session"}
              </span>

              <h1>{topic}</h1>

              {phaseTitle && <p className="phase-title">{phaseTitle}</p>}

              {resource?.title && (
                <div className="resource-info">
                  <span>📚</span>

                  <div>
                    <small>Learning Resource</small>

                    <strong>{resource.title}</strong>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* =========================
              TIMER
          ========================== */}
          <section className="timer-card">
            <div className="timer-label">
              {isPaused
                ? "Session Paused"
                : isCompleted
                  ? "Session Completed"
                  : isAbandoned
                    ? "Session Ended"
                    : "Time Spent"}
            </div>

            <div className="timer-value">{formatTime(elapsedSeconds)}</div>

            <div className="timer-target">
              Planned:{" "}
              {formatTime(
                Number(
                  session?.plannedDurationSeconds ??
                    Number(
                      session?.plannedDurationMinutes ||
                        plannedDurationMinutes ||
                        30,
                    ) * 60,
                ),
              )}
            </div>

            {!isCompleted && !isAbandoned && (
              <div className="remaining-time">
                {remainingSeconds > 0
                  ? `${formatTime(remainingSeconds)} remaining`
                  : "Planned time reached"}
              </div>
            )}
          </section>

          {/* =========================
              SESSION PROGRESS
          ========================== */}
          <section className="session-progress-card">
            <div className="progress-heading">
              <span>Session Progress</span>

              <strong>{sessionProgress}%</strong>
            </div>

            <div className="progress-track">
              <div
                className="progress-fill"
                style={{
                  width: `${sessionProgress}%`,
                }}
              />
            </div>

            {isStarted && (
              <input
                type="range"
                min="0"
                max="100"
                value={sessionProgress}
                onChange={(event) => handleProgressChange(event.target.value)}
                className="session-progress-slider"
              />
            )}

            <p>
              {isCompleted
                ? "This learning session is complete."
                : isPaused
                  ? "Resume when you're ready to continue."
                  : "Keep going. Consistent learning builds progress."}
            </p>
          </section>

          {/* =========================
              FOCUS COACH
          ========================== */}
          <section className="focus-score-card">
            <div className="focus-score-header">
              <div>
                <span className="section-label">AI FOCUS COACH</span>

                <h2>
                  {displayedFocusScore === null
                    ? "Focus Score"
                    : `${displayedFocusScore}/100`}
                </h2>
              </div>

              {focusLevel && (
                <span className={`focus-level ${focusLevel}`}>
                  {focusLevel}
                </span>
              )}
            </div>

            <p>
              Your focus score combines session progress, active learning time
              and understanding signals.
            </p>

            <button
              type="button"
              className="secondary-btn"
              onClick={handleFocusCoach}
              disabled={coachLoading || isCompleted || isAbandoned}
            >
              {coachLoading ? "Analyzing..." : "Get Focus Coach"}
            </button>

            {coachInsights.length > 0 && (
              <div className="coach-insights">
                {coachInsights.map((insight, index) => (
                  <div key={`${insight}-${index}`} className="coach-insight">
                    💡 {insight}
                  </div>
                ))}
              </div>
            )}

            {aiRecommendation && (
              <div className="ai-recommendation">
                <strong>AI Recommendation</strong>

                <p>{aiRecommendation}</p>
              </div>
            )}
          </section>

          {/* =========================
              RESOURCE
          ========================== */}
          {resource && (
            <section className="resource-card">
              <div className="resource-card-header">
                <div>
                  <span className="resource-label">RESOURCE</span>

                  <h2>
                    {resource.title || resource.name || "Learning Resource"}
                  </h2>
                </div>

                {(resource.url || resource.link) && (
                  <button
                    type="button"
                    className="resource-open-btn"
                    onClick={handleOpenResource}
                  >
                    Open Resource ↗
                  </button>
                )}
              </div>

              {resource.description && <p>{resource.description}</p>}

              <div className="resource-meta">
                {resource.provider && (
                  <span>Provider: {resource.provider}</span>
                )}

                {resource.type && <span>Type: {resource.type}</span>}
              </div>
            </section>
          )}

          {/* =========================
              GUIDANCE
          ========================== */}
          <section className="learning-guidance-card">
            <div className="guidance-icon">💡</div>

            <div>
              <h2>Focus on this session</h2>

              <p>
                Stay focused on <strong>{topic}</strong>. Understand the concept
                first, then practice what you learned.
              </p>
            </div>
          </section>

          {/* =========================
              UNDERSTANDING CHECK
          ========================== */}
          <section className="understanding-card">
            <div className="section-header">
              <div>
                <span className="section-label">UNDERSTANDING CHECK</span>

                <h2>Quick knowledge check</h2>
              </div>

              {assessmentScore !== null && (
                <strong className="assessment-score">{assessmentScore}%</strong>
              )}
            </div>

            <p className="understanding-question">
              {understandingQuestion?.question}
            </p>

            <div className="understanding-options">
              {(understandingQuestion?.options || []).map((option) => (
                <label key={option} className="understanding-option">
                  <input
                    type="radio"
                    name="understanding-answer"
                    value={option}
                    checked={understandingAnswer === option}
                    onChange={(event) =>
                      setUnderstandingAnswer(event.target.value)
                    }
                    disabled={understandingLoading || isCompleted}
                  />

                  <span>{option}</span>
                </label>
              ))}
            </div>

            <button
              type="button"
              className="primary-btn"
              onClick={handleUnderstandingCheck}
              disabled={understandingLoading || isCompleted || isAbandoned}
            >
              {understandingLoading ? "Checking..." : "Check My Understanding"}
            </button>

            {understandingFeedback && (
              <div className="understanding-feedback">
                {understandingFeedback}
              </div>
            )}
          </section>

          {/* =========================
              REVISION
          ========================== */}
          {revisionRecommended && (
            <section className="revision-card">
              <div className="revision-icon">🔄</div>

              <div>
                <span className="section-label">SMART REVISION</span>

                <h2>Revision recommended</h2>

                <p>
                  {revisionReason ||
                    `Consider revising ${topic} before moving ahead.`}
                </p>
              </div>
            </section>
          )}

          {/* =========================
              NEXT TOPIC
          ========================== */}
          <section className="next-topic-card">
            <div className="section-header">
              <div>
                <span className="section-label">NEXT TOPIC INTELLIGENCE</span>

                <h2>What's next?</h2>
              </div>
            </div>

            {nextTopic ? (
              <>
                <p>Recommended next topic:</p>

                <strong className="next-topic-name">{nextTopic}</strong>

                <button
                  type="button"
                  className="primary-btn"
                  onClick={handleContinueNextTopic}
                >
                  Continue to Next Topic →
                </button>
              </>
            ) : (
              <>
                <p>Get a recommendation based on your current roadmap.</p>

                <button
                  type="button"
                  className="secondary-btn"
                  onClick={handleNextTopic}
                  disabled={nextTopicLoading || isCompleted || isAbandoned}
                >
                  {nextTopicLoading
                    ? "Finding Next Topic..."
                    : "Find Next Topic"}
                </button>
              </>
            )}
          </section>

          {/* =========================
              NOTES
          ========================== */}
          <section className="session-notes-card">
            <div className="section-header">
              <div>
                <span className="section-label">SESSION NOTES</span>

                <h2>What did you learn?</h2>
              </div>
            </div>

            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Write important points, doubts or things you want to remember..."
              maxLength={2000}
              disabled={isCompleted}
            />

            <div className="notes-footer">
              <span>{notes.length}/2000</span>

              <button
                type="button"
                className="secondary-btn"
                onClick={handleSaveNotes}
                disabled={savingNotes || isCompleted || isAbandoned}
              >
                {savingNotes ? "Saving..." : "Save Notes"}
              </button>
            </div>
          </section>

          {/* =========================
              STATS
          ========================== */}
          <section className="session-stats-card">
            <div className="stat-item">
              <span>⏱</span>

              <strong>{formatTime(elapsedSeconds)}</strong>

              <small>Study Time</small>
            </div>

            <div className="stat-item">
              <span>🎯</span>

              <strong>{displayedFocusScore ?? "--"}</strong>

              <small>Focus Score</small>
            </div>

            <div className="stat-item">
              <span>🧠</span>

              <strong>
                {assessmentScore ?? "--"}
                {assessmentScore !== null && "%"}
              </strong>

              <small>Understanding</small>
            </div>

            <div className="stat-item">
              <span>⚡</span>

              <strong>{session?.xpEarned || 0}</strong>

              <small>XP Earned</small>
            </div>
          </section>

          {/* =========================
              SESSION CONTROLS
          ========================== */}
          <section className="session-controls">
            {isStarted && (
              <>
                <button
                  type="button"
                  className="pause-btn"
                  onClick={handlePause}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Please wait..." : "⏸ Pause"}
                </button>

                <button
                  type="button"
                  className="complete-btn"
                  onClick={() => handleComplete(true)}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Completing..." : "✓ Complete Session"}
                </button>
              </>
            )}

            {isPaused && (
              <>
                <button
                  type="button"
                  className="resume-btn"
                  onClick={handleResume}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Please wait..." : "▶ Resume"}
                </button>

                <button
                  type="button"
                  className="complete-btn"
                  onClick={() => handleComplete(true)}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Completing..." : "✓ Complete Session"}
                </button>
              </>
            )}

            {isCompleted && (
              <div className="completed-message">
                <span>🎉</span>

                <div>
                  <strong>Session completed!</strong>

                  <p>Your learning activity has been recorded.</p>
                </div>
              </div>
            )}

            {isAbandoned && (
              <div className="abandoned-message">
                <span>ℹ️</span>

                <div>
                  <strong>Session ended</strong>

                  <p>You can start another session whenever you're ready.</p>
                </div>
              </div>
            )}
          </section>

          {/* =========================
              SECONDARY ACTIONS
          ========================== */}
          <section className="secondary-actions">
            {!isCompleted && !isAbandoned && (
              <button
                type="button"
                className="abandon-btn"
                onClick={handleAbandon}
                disabled={actionLoading}
              >
                End Session
              </button>
            )}

            <button
              type="button"
              className="progress-btn"
              onClick={handleViewProgress}
            >
              View My Progress →
            </button>
          </section>

          {/* =========================
              COMPLETION ACTION
          ========================== */}
          {isCompleted && (
            <section className="next-topic-card">
              <div className="section-header">
                <div>
                  <span className="section-label">SESSION COMPLETE</span>

                  <h2>Great work on {topic}</h2>
                </div>
              </div>

              <p>
                {nextTopic
                  ? `Your next recommended topic is ${nextTopic}.`
                  : "Your learning activity has been recorded. You can continue from your learning progress."}
              </p>

              <button
                type="button"
                className="primary-btn"
                onClick={handleCompletionNavigation}
              >
                {nextTopic
                  ? "Continue to Next Topic →"
                  : "Continue to Progress →"}
              </button>
            </section>
          )}

          {/* =========================
              BOTTOM FLOW NAVIGATION
          ========================== */}
          <nav
            className="learning-session-flow-navigation learning-session-flow-navigation-bottom"
            aria-label="Learning session navigation"
          >
            <button
              type="button"
              className="learning-session-flow-button learning-session-flow-back"
              onClick={handleBackNavigation}
            >
              {isCompleted || isAbandoned
                ? "← Back to Learning"
                : "← Back to Resources"}
            </button>

            <span className="learning-session-flow-current">
              {isCompleted
                ? "Learning Completed"
                : isAbandoned
                  ? "Session Ended"
                  : "Current Learning"}
            </span>

            <button
              type="button"
              className="learning-session-flow-button learning-session-flow-next"
              onClick={
                isCompleted ? handleCompletionNavigation : handleNextToResources
              }
            >
              {isCompleted
                ? nextTopic
                  ? "Next Topic →"
                  : "Progress →"
                : "Resources →"}
            </button>
          </nav>
        </main>
      </div>
    </div>
  );
}

export default LearningSession;
