import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getLearningProgress } from "../../services/learningService";
import { getRoadmap } from "../../services/roadmapService";
import "./Learning.css";

function Learning() {
  const navigate = useNavigate();

  const [progress, setProgress] = useState(null);
  const [roadmap, setRoadmap] = useState(null);

  const [loading, setLoading] = useState(true);
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [error, setError] = useState("");
  const [roadmapError, setRoadmapError] = useState("");

  /*
   * ---------------------------------------------------------
   * Helpers
   * ---------------------------------------------------------
   */

  const getCareerId = useCallback(() => {
    return localStorage.getItem("selectedCareerId");
  }, []);

  const normalizeNumber = (value, fallback = 0) => {
    const number = Number(value);

    return Number.isFinite(number) ? number : fallback;
  };

  const normalizeArray = (value) => {
    return Array.isArray(value) ? value : [];
  };

  const normalizeRoadmap = (rawRoadmap) => {
    if (!rawRoadmap) {
      return null;
    }

    const phases = normalizeArray(rawRoadmap.phases);

    const normalizedPhases = phases.map((phase, index) => {
      const phaseNumber = normalizeNumber(
        phase?.phase ?? phase?.phaseNumber ?? phase?.number,
        index + 1,
      );

      const topics = normalizeArray(phase?.topics)
        .map((topic) => {
          if (typeof topic === "string") {
            return topic;
          }

          if (topic?.title) {
            return topic.title;
          }

          if (topic?.name) {
            return topic.name;
          }

          if (topic?.topic) {
            return topic.topic;
          }

          return "";
        })
        .filter(Boolean);

      const projects = normalizeArray(phase?.projects)
        .map((project) => {
          if (typeof project === "string") {
            return project;
          }

          return project?.title || project?.name || project?.project || "";
        })
        .filter(Boolean);

      return {
        ...phase,
        phase: phaseNumber,
        title: phase?.title || phase?.phaseTitle || `Phase ${phaseNumber}`,
        duration: phase?.duration || "",
        topics,
        projects,
        interviewTopics: normalizeArray(phase?.interviewTopics),
      };
    });

    return {
      ...rawRoadmap,
      phases: normalizedPhases,
    };
  };

  /*
   * ---------------------------------------------------------
   * Load Learning Workspace
   * ---------------------------------------------------------
   */

  const loadLearningWorkspace = useCallback(async () => {
    const careerId = getCareerId();

    console.log("=================================");
    console.log("        LEARNING WORKSPACE");
    console.log("=================================");
    console.log("Selected Career ID:", careerId);

    if (!careerId) {
      setLoading(false);
      setError(
        "No selected career found. Please select a career before starting your learning journey.",
      );
      return;
    }

    try {
      setLoading(true);
      setError("");
      setRoadmapError("");

      /*
       * Load both APIs together.
       *
       * Progress is the primary data.
       * Roadmap is additional workspace information.
       */

      const [progressResult, roadmapResult] = await Promise.allSettled([
        getLearningProgress(careerId),
        getRoadmap(careerId),
      ]);

      /*
       * -------------------------
       * Learning Progress
       * -------------------------
       */

      if (progressResult.status === "fulfilled") {
        const progressResponse = progressResult.value;

        console.log("Learning Progress Response:", progressResponse?.data);

        const learningData =
          progressResponse?.data?.data || progressResponse?.data || null;

        if (learningData) {
          setProgress(learningData);
        } else {
          setProgress(null);
          setError("Learning progress data was not found.");
        }
      } else {
        console.error("Learning progress API error:", progressResult.reason);

        const message =
          progressResult.reason?.response?.data?.message ||
          "Unable to load your learning progress.";

        setError(message);
      }

      /*
       * -------------------------
       * Roadmap
       * -------------------------
       */

      setRoadmapLoading(true);

      if (roadmapResult.status === "fulfilled") {
        const roadmapResponse = roadmapResult.value;

        console.log("Roadmap Response:", roadmapResponse?.data);

        const roadmapData =
          roadmapResponse?.data?.data || roadmapResponse?.data || null;

        if (roadmapData) {
          setRoadmap(normalizeRoadmap(roadmapData));
        } else {
          setRoadmap(null);
          setRoadmapError("Roadmap data was not found.");
        }
      } else {
        console.error("Roadmap API error:", roadmapResult.reason);

        setRoadmap(null);

        setRoadmapError(
          roadmapResult.reason?.response?.data?.message ||
            "Roadmap is currently unavailable.",
        );
      }
    } catch (err) {
      console.error("Unable to load learning workspace:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to load your learning workspace.",
      );
    } finally {
      setLoading(false);
      setRoadmapLoading(false);
    }
  }, [getCareerId]);

  useEffect(() => {
    loadLearningWorkspace();
  }, [loadLearningWorkspace]);

  /*
   * ---------------------------------------------------------
   * Progress Data
   * ---------------------------------------------------------
   */

  const completedTopics = useMemo(() => {
    return normalizeArray(progress?.completedTopics);
  }, [progress]);

  const pendingTopics = useMemo(() => {
    return normalizeArray(progress?.pendingTopics);
  }, [progress]);

  const completedProjects = useMemo(() => {
    return normalizeArray(progress?.completedProjects);
  }, [progress]);

  const overallCompletion = useMemo(() => {
    return Math.min(
      100,
      Math.max(0, normalizeNumber(progress?.overallCompletion)),
    );
  }, [progress]);

  const currentPhase = useMemo(() => {
    return Math.max(1, normalizeNumber(progress?.currentPhase, 1));
  }, [progress]);

  const currentStreak = useMemo(() => {
    return Math.max(0, normalizeNumber(progress?.currentStreak));
  }, [progress]);

  const totalStudyHours = useMemo(() => {
    return Math.max(0, normalizeNumber(progress?.totalStudyHours));
  }, [progress]);

  const nextMilestone = progress?.nextMilestone || "";

  /*
   * ---------------------------------------------------------
   * Roadmap Data
   * ---------------------------------------------------------
   */

  const phases = useMemo(() => {
    return normalizeArray(roadmap?.phases);
  }, [roadmap]);

  const todayPlan = roadmap?.todayPlan || null;

  const userProfile = roadmap?.userProfile || null;

  /*
   * ---------------------------------------------------------
   * Find Current Phase
   *
   * IMPORTANT:
   * currentPhaseData is declared BEFORE nextTopic.
   * This prevents:
   *
   * Cannot access 'currentPhaseData'
   * before initialization
   * ---------------------------------------------------------
   */

  const currentPhaseData = useMemo(() => {
    if (!phases.length) {
      return null;
    }

    return (
      phases.find((phase) => normalizeNumber(phase?.phase) === currentPhase) ||
      null
    );
  }, [phases, currentPhase]);

  /*
   * ---------------------------------------------------------
   * Next Learning Topic
   * ---------------------------------------------------------
   */

  const nextTopic = useMemo(() => {
    /*
     * 1. Primary source:
     * Learning Progress pending topics
     */
    const progressNextTopic = pendingTopics.find(Boolean);

    if (progressNextTopic) {
      return progressNextTopic;
    }

    /*
     * 2. Fallback:
     * Roadmap-level nextTopic
     */
    const roadmapNextTopic =
      roadmap?.nextTopic || roadmap?.progress?.nextTopic || "";

    if (roadmapNextTopic) {
      return roadmapNextTopic;
    }

    /*
     * 3. Fallback:
     * Current phase pending topics
     */
    const phasePendingTopics = normalizeArray(
      currentPhaseData?.pendingTopics,
    ).filter(Boolean);

    if (phasePendingTopics.length > 0) {
      return phasePendingTopics[0];
    }

    /*
     * 4. Fallback:
     * First incomplete topic in current phase
     */
    const phaseTopics = normalizeArray(currentPhaseData?.topics);

    const firstIncompleteTopic = phaseTopics.find(
      (topic) =>
        !completedTopics.some(
          (completed) =>
            String(completed).trim().toLowerCase() ===
            String(topic).trim().toLowerCase(),
        ),
    );

    if (firstIncompleteTopic) {
      return firstIncompleteTopic;
    }

    /*
     * 5. Final fallback:
     * First current phase topic
     */
    return phaseTopics[0] || "";
  }, [pendingTopics, roadmap, currentPhaseData, completedTopics]);

  const isJourneyCompleted =
    pendingTopics.length === 0 && overallCompletion >= 100;

  /*
   * ---------------------------------------------------------
   * Phase Status
   * ---------------------------------------------------------
   */

  const getPhaseStatus = useCallback(
    (phase) => {
      const phaseNumber = normalizeNumber(phase?.phase, 1);

      /*
       * If backend explicitly provides status,
       * respect it.
       */

      if (phase?.status) {
        const status = String(phase.status).toLowerCase();

        if (status === "completed") {
          return "completed";
        }

        if (status === "locked") {
          return "locked";
        }

        if (
          status === "active" ||
          status === "current" ||
          status === "in-progress"
        ) {
          return "current";
        }
      }

      /*
       * Otherwise calculate using current phase.
       */

      if (phaseNumber < currentPhase) {
        return "completed";
      }

      if (phaseNumber === currentPhase) {
        return "current";
      }

      return "locked";
    },
    [currentPhase],
  );

  /*
   * ---------------------------------------------------------
   * Navigation
   * ---------------------------------------------------------
   */

  const handleOpenResources = useCallback(
    ({
      topic = "",
      phase = currentPhase,
      phaseTitle = "",
      topics = [],
      learningAction = "continue",
    } = {}) => {
      const careerId = getCareerId();

      if (!careerId) {
        setError("Selected career not found.");
        return;
      }

      /*
       * Resolve the topic one final time before navigation.
       *
       * This protects Resources.jsx from receiving
       * an empty topic.
       */

      const resolvedTopic =
        topic ||
        pendingTopics.find(Boolean) ||
        roadmap?.nextTopic ||
        roadmap?.progress?.nextTopic ||
        currentPhaseData?.pendingTopics?.find(Boolean) ||
        currentPhaseData?.topics?.find(
          (item) =>
            !completedTopics.some(
              (completed) =>
                String(completed).trim().toLowerCase() ===
                String(item).trim().toLowerCase(),
            ),
        ) ||
        currentPhaseData?.topics?.[0] ||
        "";

      if (!resolvedTopic) {
        setError(
          "No learning topic is currently available. Please return to your roadmap and select a learning topic.",
        );

        return;
      }

      const resolvedTopics =
        Array.isArray(topics) && topics.length > 0
          ? topics
          : normalizeArray(currentPhaseData?.topics);

      const resolvedPendingTopics =
        pendingTopics.length > 0 ? pendingTopics : [resolvedTopic];

      console.log("Opening Resources with:", {
        careerId,
        phase,
        phaseTitle,
        topic: resolvedTopic,
        topics: resolvedTopics,
        pendingTopics: resolvedPendingTopics,
        learningAction,
      });

      navigate("/resources", {
        state: {
          careerId,
          phase,
          phaseTitle,
          topic: resolvedTopic,
          topics: resolvedTopics,
          pendingTopics: resolvedPendingTopics,
          learningAction,
        },
      });
    },
    [
      currentPhase,
      getCareerId,
      navigate,
      pendingTopics,
      roadmap,
      currentPhaseData,
      completedTopics,
    ],
  );

  /*
   * ---------------------------------------------------------
   * Continue Learning
   * ---------------------------------------------------------
   */

  const handleContinueLearning = () => {
    if (!nextTopic) {
      if (isJourneyCompleted) {
        return;
      }

      setError("No pending learning topic is available.");

      return;
    }

    handleOpenResources({
      topic: nextTopic,
      phase: currentPhase,
      phaseTitle: currentPhaseData?.title || "",
      topics: currentPhaseData?.topics || [],
      learningAction: "continue",
    });
  };

  /*
   * ---------------------------------------------------------
   * Open Specific Topic
   * ---------------------------------------------------------
   */

  const handleTopicClick = (
    topic,
    phase = currentPhase,
    phaseTitle = "",
    phaseTopics = [],
  ) => {
    if (!topic) {
      return;
    }

    handleOpenResources({
      topic,
      phase,
      phaseTitle,
      topics: phaseTopics,
      learningAction: "topic",
    });
  };

  /*
   * ---------------------------------------------------------
   * Open Phase
   * ---------------------------------------------------------
   */

  const handlePhaseClick = (phase) => {
    if (!phase) {
      return;
    }

    const phaseStatus = getPhaseStatus(phase);

    if (phaseStatus === "locked") {
      setError(
        `Phase ${phase.phase} is locked. Complete the current phase first.`,
      );

      return;
    }

    const phaseTopics = normalizeArray(phase?.topics);

    const firstPendingTopic =
      phaseTopics.find(
        (topic) =>
          !completedTopics.some(
            (completed) =>
              String(completed).toLowerCase() === String(topic).toLowerCase(),
          ),
      ) ||
      phaseTopics[0] ||
      "";

    handleOpenResources({
      topic: firstPendingTopic,
      phase: normalizeNumber(phase?.phase, 1),
      phaseTitle: phase?.title || `Phase ${phase?.phase || 1}`,
      topics: phaseTopics,
      learningAction: phaseStatus === "completed" ? "review" : "continue",
    });
  };

  /*
   * ---------------------------------------------------------
   * Today's Plan
   * ---------------------------------------------------------
   */

  const getTodayPlanTopic = () => {
    if (!todayPlan) {
      return nextTopic;
    }

    return (
      todayPlan?.topic ||
      todayPlan?.focusTopic ||
      todayPlan?.focus ||
      todayPlan?.nextTopic ||
      nextTopic
    );
  };

  const getTodayPlanPhase = () => {
    return normalizeNumber(todayPlan?.phase, currentPhase);
  };

  const getTodayPlanPhaseTitle = () => {
    return (
      todayPlan?.phaseTitle ||
      currentPhaseData?.title ||
      `Phase ${getTodayPlanPhase()}`
    );
  };

  const handleTodayPlan = () => {
    const topic = getTodayPlanTopic();

    if (!topic) {
      handleContinueLearning();
      return;
    }

    const phase = getTodayPlanPhase();

    const phaseData =
      phases.find((item) => normalizeNumber(item?.phase) === phase) ||
      currentPhaseData;

    handleOpenResources({
      topic,
      phase,
      phaseTitle: getTodayPlanPhaseTitle(),
      topics: phaseData?.topics || [],
      learningAction: "today-plan",
    });
  };

  /*
   * ---------------------------------------------------------
   * Retry
   * ---------------------------------------------------------
   */

  const handleRetry = () => {
    loadLearningWorkspace();
  };

  /*
   * ---------------------------------------------------------
   * Loading State
   * ---------------------------------------------------------
   */

  if (loading) {
    return (
      <div className="learning-page">
        <div className="learning-loading">
          <div className="learning-loading-spinner"></div>

          <h2>Loading your learning journey...</h2>

          <p>Preparing your roadmap, progress and next learning steps.</p>
        </div>
      </div>
    );
  }

  /*
   * ---------------------------------------------------------
   * Critical Error
   * ---------------------------------------------------------
   */

  if (error && !progress) {
    return (
      <div className="learning-page">
        <div className="learning-error">
          <div className="learning-error-icon">!</div>

          <h2>Unable to load Learning</h2>

          <p>{error}</p>

          <button
            type="button"
            className="learning-primary-button"
            onClick={handleRetry}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /*
   * ---------------------------------------------------------
   * Main UI
   * ---------------------------------------------------------
   */

  return (
    <div className="learning-page">
      {/* =====================================================
          TOP MAIN FLOW NAVIGATION
      ====================================================== */}

      <nav
        className="learning-flow-navigation"
        aria-label="Learning journey navigation"
      >
        <button
          type="button"
          className="learning-flow-button learning-flow-back"
          onClick={() => navigate("/roadmap")}
        >
          ← Back to Roadmap
        </button>

        <div className="learning-flow-current">Learning</div>

        <button
          type="button"
          className="learning-flow-button learning-flow-next"
          onClick={() => navigate("/progress")}
        >
          Continue to Progress →
        </button>
      </nav>

      {/* =====================================================
          HEADER
      ====================================================== */}

      <section className="learning-header">
        <div>
          <span className="learning-eyebrow">YOUR LEARNING JOURNEY</span>

          <h1>Keep Learning, Keep Growing 🚀</h1>

          <p>
            Follow your personalized roadmap and build the skills needed for
            your career goal.
          </p>
        </div>

        <button
          type="button"
          className="learning-refresh-button"
          onClick={handleRetry}
        >
          ↻ Refresh
        </button>
      </section>

      {/* =====================================================
          INLINE ERROR
      ====================================================== */}

      {error && progress && (
        <div className="learning-inline-error">
          <span>{error}</span>

          <button type="button" onClick={() => setError("")}>
            ×
          </button>
        </div>
      )}

      {/* =====================================================
          PROGRESS OVERVIEW
      ====================================================== */}

      <section className="learning-overview-grid">
        <div className="learning-stat-card">
          <div className="learning-stat-icon">📈</div>

          <div>
            <span>Overall Progress</span>

            <strong>{Math.round(overallCompletion)}%</strong>
          </div>
        </div>

        <div className="learning-stat-card">
          <div className="learning-stat-icon">📚</div>

          <div>
            <span>Completed Topics</span>

            <strong>{completedTopics.length}</strong>
          </div>
        </div>

        <div className="learning-stat-card">
          <div className="learning-stat-icon">⏳</div>

          <div>
            <span>Pending Topics</span>

            <strong>{pendingTopics.length}</strong>
          </div>
        </div>

        <div className="learning-stat-card">
          <div className="learning-stat-icon">🔥</div>

          <div>
            <span>Current Streak</span>

            <strong>
              {currentStreak} day
              {currentStreak === 1 ? "" : "s"}
            </strong>
          </div>
        </div>
      </section>

      {/* =====================================================
          PROGRESS BAR
      ====================================================== */}

      <section className="learning-progress-card">
        <div className="learning-progress-top">
          <div>
            <span>Your overall learning progress</span>

            <h2>{Math.round(overallCompletion)}% completed</h2>
          </div>

          <strong>Phase {currentPhase}</strong>
        </div>

        <div className="learning-progress-track">
          <div
            className="learning-progress-fill"
            style={{
              width: `${overallCompletion}%`,
            }}
          ></div>
        </div>

        <div className="learning-progress-footer">
          <span>{completedTopics.length} topics completed</span>

          <span>{pendingTopics.length} topics remaining</span>
        </div>
      </section>

      {/* =====================================================
          CONTINUE LEARNING + TODAY PLAN
      ====================================================== */}

      <section className="learning-main-grid">
        {/* Continue Learning */}

        <div className="learning-card learning-continue-card">
          <div className="learning-card-header">
            <div>
              <span className="learning-card-label">CONTINUE LEARNING</span>

              <h2>
                {isJourneyCompleted
                  ? "Journey Completed 🎉"
                  : nextTopic || "Ready to learn"}
              </h2>
            </div>

            <div className="learning-card-icon">🎯</div>
          </div>

          {isJourneyCompleted ? (
            <div className="learning-completed-message">
              <div className="learning-success-icon">✓</div>

              <p>
                Amazing work! You have completed all available learning topics
                for this career journey.
              </p>
            </div>
          ) : (
            <>
              <p className="learning-card-description">
                Continue from your next pending topic and explore personalized
                resources.
              </p>

              <div className="learning-next-topic">
                <span>Next topic</span>

                <strong>{nextTopic || "No topic available"}</strong>
              </div>

              <button
                type="button"
                className="learning-primary-button"
                onClick={handleContinueLearning}
                disabled={!nextTopic}
              >
                Continue Learning →
              </button>
            </>
          )}
        </div>

        {/* Today's Plan */}

        <div className="learning-card learning-today-card">
          <div className="learning-card-header">
            <div>
              <span className="learning-card-label">TODAY'S PLAN</span>

              <h2>{todayPlan?.title || "Your next learning session"}</h2>
            </div>

            <div className="learning-card-icon">📅</div>
          </div>

          {roadmapLoading ? (
            <p className="learning-muted-text">Loading today's plan...</p>
          ) : todayPlan ? (
            <>
              <div className="learning-today-meta">
                <span>Phase {getTodayPlanPhase()}</span>

                <span>
                  {todayPlan?.totalMinutes || todayPlan?.duration || 30} min
                </span>
              </div>

              <p className="learning-card-description">
                {todayPlan?.description ||
                  todayPlan?.focus ||
                  `Focus on ${getTodayPlanTopic() || "your next topic"} today.`}
              </p>

              <div className="learning-today-focus">
                <span>Today's focus</span>

                <strong>
                  {getTodayPlanTopic() || "Continue your roadmap"}
                </strong>
              </div>

              <button
                type="button"
                className="learning-secondary-button"
                onClick={handleTodayPlan}
              >
                Start Today's Plan →
              </button>
            </>
          ) : (
            <>
              <p className="learning-card-description">
                Your automated daily plan is not available right now. You can
                continue directly from your next topic.
              </p>

              <button
                type="button"
                className="learning-secondary-button"
                onClick={handleContinueLearning}
                disabled={!nextTopic}
              >
                Start Learning →
              </button>
            </>
          )}
        </div>
      </section>

      {/* =====================================================
          CURRENT PHASE
      ====================================================== */}

      <section className="learning-card learning-current-phase-card">
        <div className="learning-section-header">
          <div>
            <span className="learning-card-label">CURRENT PHASE</span>

            <h2>{currentPhaseData?.title || `Phase ${currentPhase}`}</h2>
          </div>

          <span className="learning-phase-badge">Phase {currentPhase}</span>
        </div>

        {currentPhaseData?.duration && (
          <p className="learning-phase-duration">
            Duration: {currentPhaseData.duration}
          </p>
        )}

        {currentPhaseData?.topics?.length ? (
          <div className="learning-topic-grid">
            {currentPhaseData.topics.map((topic, index) => {
              const isCompleted = completedTopics.some(
                (completed) =>
                  String(completed).trim().toLowerCase() ===
                  String(topic).trim().toLowerCase(),
              );

              return (
                <button
                  type="button"
                  key={`${topic}-${index}`}
                  className={`learning-topic-item ${
                    isCompleted ? "completed" : ""
                  }`}
                  onClick={() =>
                    handleTopicClick(
                      topic,
                      currentPhase,
                      currentPhaseData?.title || `Phase ${currentPhase}`,
                      currentPhaseData?.topics || [],
                    )
                  }
                >
                  <span className="learning-topic-check">
                    {isCompleted ? "✓" : "○"}
                  </span>

                  <span>{topic}</span>

                  <span className="learning-topic-arrow">→</span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="learning-empty-state">
            <p>Current phase topics are not available yet.</p>
          </div>
        )}
      </section>

      {/* =====================================================
          ROADMAP
      ====================================================== */}

      <section className="learning-card learning-roadmap-card">
        <div className="learning-section-header">
          <div>
            <span className="learning-card-label">PERSONALIZED ROADMAP</span>

            <h2>Your Career Learning Path</h2>
          </div>

          <span className="learning-roadmap-count">
            {phases.length} phase
            {phases.length === 1 ? "" : "s"}
          </span>
        </div>

        {roadmapError && (
          <div className="learning-roadmap-warning">
            <span>Roadmap is currently unavailable.</span>
          </div>
        )}

        {!phases.length ? (
          <div className="learning-empty-state">
            <p>No roadmap phases are available for your selected career yet.</p>

            {roadmapError && (
              <button
                type="button"
                className="learning-secondary-button"
                onClick={handleRetry}
              >
                Reload Roadmap
              </button>
            )}
          </div>
        ) : (
          <div className="learning-roadmap-list">
            {phases.map((phase, index) => {
              const status = getPhaseStatus(phase);

              const phaseNumber = normalizeNumber(phase?.phase, index + 1);

              const phaseTopics = normalizeArray(phase?.topics);

              const completedInPhase = phaseTopics.filter((topic) =>
                completedTopics.some(
                  (completed) =>
                    String(completed).trim().toLowerCase() ===
                    String(topic).trim().toLowerCase(),
                ),
              ).length;

              const phaseCompletion =
                phaseTopics.length > 0
                  ? Math.round((completedInPhase / phaseTopics.length) * 100)
                  : status === "completed"
                    ? 100
                    : 0;

              return (
                <div
                  key={`phase-${phaseNumber}`}
                  className={`learning-roadmap-phase ${status}`}
                >
                  <div className="learning-phase-number">
                    {status === "completed" ? "✓" : phaseNumber}
                  </div>

                  <div className="learning-phase-content">
                    <div className="learning-phase-top">
                      <div>
                        <span className="learning-phase-status">
                          {status === "completed"
                            ? "COMPLETED"
                            : status === "current"
                              ? "CURRENT PHASE"
                              : "LOCKED"}
                        </span>

                        <h3>{phase?.title || `Phase ${phaseNumber}`}</h3>
                      </div>

                      {phase?.duration && (
                        <span className="learning-phase-time">
                          {phase.duration}
                        </span>
                      )}
                    </div>

                    {phaseTopics.length > 0 && (
                      <>
                        <div className="learning-phase-progress">
                          <div className="learning-phase-progress-track">
                            <div
                              className="learning-phase-progress-fill"
                              style={{
                                width: `${phaseCompletion}%`,
                              }}
                            ></div>
                          </div>

                          <span>
                            {completedInPhase}/{phaseTopics.length} topics
                          </span>
                        </div>

                        <div className="learning-phase-topics">
                          {phaseTopics.map((topic, topicIndex) => {
                            const topicCompleted = completedTopics.some(
                              (completed) =>
                                String(completed).trim().toLowerCase() ===
                                String(topic).trim().toLowerCase(),
                            );

                            return (
                              <button
                                type="button"
                                key={`${topic}-${topicIndex}`}
                                className={`learning-roadmap-topic ${
                                  topicCompleted ? "completed" : ""
                                }`}
                                disabled={status === "locked"}
                                onClick={() =>
                                  handleTopicClick(
                                    topic,
                                    phaseNumber,
                                    phase?.title || `Phase ${phaseNumber}`,
                                    phaseTopics,
                                  )
                                }
                              >
                                <span>{topicCompleted ? "✓" : "○"}</span>

                                <span>{topic}</span>
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}

                    {phase?.projects?.length > 0 && (
                      <div className="learning-projects">
                        <span>Projects:</span>

                        <div>
                          {phase.projects.map((project, projectIndex) => (
                            <span key={`${project}-${projectIndex}`}>
                              {project}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      className="learning-phase-action"
                      onClick={() => handlePhaseClick(phase)}
                      disabled={status === "locked"}
                    >
                      {status === "completed"
                        ? "Review Phase"
                        : status === "current"
                          ? "Continue Phase"
                          : "Locked"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* =====================================================
          LEARNING SUMMARY
      ====================================================== */}

      <section className="learning-summary-grid">
        <div className="learning-card learning-summary-card">
          <div className="learning-card-header">
            <div>
              <span className="learning-card-label">LEARNING SUMMARY</span>

              <h2>Your Progress</h2>
            </div>

            <div className="learning-card-icon">📊</div>
          </div>

          <div className="learning-summary-list">
            <div>
              <span>Current Phase</span>

              <strong>Phase {currentPhase}</strong>
            </div>

            <div>
              <span>Topics Completed</span>

              <strong>{completedTopics.length}</strong>
            </div>

            <div>
              <span>Topics Remaining</span>

              <strong>{pendingTopics.length}</strong>
            </div>

            <div>
              <span>Projects Completed</span>

              <strong>{completedProjects.length}</strong>
            </div>

            <div>
              <span>Total Study Hours</span>

              <strong>{totalStudyHours.toFixed(1)} hrs</strong>
            </div>

            <div>
              <span>Current Streak</span>

              <strong>{currentStreak} days</strong>
            </div>
          </div>
        </div>

        {/* Next Milestone */}

        <div className="learning-card learning-milestone-card">
          <div className="learning-card-header">
            <div>
              <span className="learning-card-label">NEXT MILESTONE</span>

              <h2>{nextMilestone || "Keep progressing"}</h2>
            </div>

            <div className="learning-card-icon">🏆</div>
          </div>

          <p className="learning-card-description">
            {nextMilestone
              ? "Complete the next learning activities to reach your milestone."
              : "Continue completing your pending topics to unlock the next milestone."}
          </p>

          {!isJourneyCompleted && (
            <button
              type="button"
              className="learning-secondary-button"
              onClick={handleContinueLearning}
              disabled={!nextTopic}
            >
              Work Toward Milestone →
            </button>
          )}

          {isJourneyCompleted && (
            <div className="learning-milestone-complete">
              ✓ Journey completed
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          PROFILE SNAPSHOT
      ====================================================== */}

      {userProfile && (
        <section className="learning-card learning-profile-card">
          <div className="learning-section-header">
            <div>
              <span className="learning-card-label">LEARNING PROFILE</span>

              <h2>Your Personalized Learning Context</h2>
            </div>
          </div>

          <div className="learning-profile-grid">
            {userProfile?.careerGoal && (
              <div>
                <span>Career Goal</span>

                <strong>{userProfile.careerGoal}</strong>
              </div>
            )}

            {userProfile?.learningStyle && (
              <div>
                <span>Learning Style</span>

                <strong>{userProfile.learningStyle}</strong>
              </div>
            )}

            {userProfile?.dailyStudyHours && (
              <div>
                <span>Daily Study</span>

                <strong>{userProfile.dailyStudyHours} hrs/day</strong>
              </div>
            )}
          </div>
        </section>
      )}

      {/* =====================================================
          QUICK ACTIONS
      ====================================================== */}

      <section className="learning-quick-actions">
        <button
          type="button"
          className="learning-quick-action"
          onClick={handleContinueLearning}
          disabled={!nextTopic}
        >
          <span>📚</span>

          <div>
            <strong>Continue Learning</strong>

            <small>Open your next topic</small>
          </div>
        </button>

        <button
          type="button"
          className="learning-quick-action"
          onClick={handleTodayPlan}
        >
          <span>📅</span>

          <div>
            <strong>Today's Plan</strong>

            <small>Follow today's learning tasks</small>
          </div>
        </button>

        <button
          type="button"
          className="learning-quick-action"
          onClick={() => navigate("/progress")}
        >
          <span>📈</span>

          <div>
            <strong>View Progress</strong>

            <small>Track your learning activity</small>
          </div>
        </button>

        <button
          type="button"
          className="learning-quick-action"
          onClick={() => navigate("/profile")}
        >
          <span>👤</span>

          <div>
            <strong>My Profile</strong>

            <small>Manage your learning profile</small>
          </div>
        </button>
      </section>

      {/* =====================================================
          BOTTOM MAIN FLOW NAVIGATION
      ====================================================== */}

      <nav
        className="learning-flow-navigation learning-flow-navigation-bottom"
        aria-label="Learning journey navigation"
      >
        <button
          type="button"
          className="learning-flow-button learning-flow-back"
          onClick={() => navigate("/roadmap")}
        >
          ← Back to Roadmap
        </button>

        <div className="learning-flow-current">Learning</div>

        <button
          type="button"
          className="learning-flow-button learning-flow-next"
          onClick={() => navigate("/progress")}
        >
          Continue to Progress →
        </button>
      </nav>
    </div>
  );
}

export default Learning;
