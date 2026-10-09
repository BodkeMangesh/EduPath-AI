import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Progress.css";

import { getProgress } from "../../services/progressService";

import ProgressCard from "../../components/ProgressCard/ProgressCard";
import ProgressChart from "../../components/ProgressChart/ProgressChart";

function Progress() {
  const navigate = useNavigate();

  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [activeActivityRange, setActiveActivityRange] = useState("7");

  const careerId = localStorage.getItem("selectedCareerId");

  const fetchProgress = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        if (!careerId) {
          throw new Error("No career selected.");
        }

        const response = await getProgress(careerId);

        const data = response?.data?.data || response?.data || response || null;

        setProgress(data);
      } catch (err) {
        console.error("Progress fetch error:", err);

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load your learning progress.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [careerId],
  );

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  /*
   * ---------------------------------------------------------
   * MAIN FLOW NAVIGATION
   * ---------------------------------------------------------
   */

  const goToLearning = () => {
    navigate("/learning");
  };

  const goToPlacement = () => {
    navigate("/placement");
  };

  /*
   * ---------------------------------------------------------
   * SAFE DATA NORMALIZATION
   * ---------------------------------------------------------
   * The backend can gradually evolve from basic progress data
   * to dashboard/analytics data without breaking this page.
   */

  const overview = useMemo(() => {
    const source = progress?.overview || progress?.progress || progress || {};

    return {
      overallCompletion: Number(source.overallCompletion) || 0,
      currentStreak: Number(source.currentStreak) || 0,
      totalStudyHours: Number(source.totalStudyHours) || 0,
      currentPhase: Number(source.currentPhase) || 1,
      status: source.status || "Active",
      nextMilestone: source.nextMilestone || "",
      careerId: source.careerId || careerId || "",
      completedTopics: Array.isArray(source.completedTopics)
        ? source.completedTopics
        : [],
      pendingTopics: Array.isArray(source.pendingTopics)
        ? source.pendingTopics
        : [],
      completedProjects: Array.isArray(source.completedProjects)
        ? source.completedProjects
        : [],
    };
  }, [progress, careerId]);

  const sessions =
    progress?.sessions ||
    progress?.sessionAnalytics ||
    progress?.analytics?.sessions ||
    {};

  const topics =
    progress?.topics ||
    progress?.topicAnalytics ||
    progress?.analytics?.topics ||
    [];

  const quality =
    progress?.quality ||
    progress?.learningQuality ||
    progress?.analytics?.quality ||
    {};

  const activity =
    progress?.activity ||
    progress?.activityAnalytics ||
    progress?.analytics?.activity ||
    {};

  const insights =
    progress?.insights ||
    progress?.aiInsights ||
    progress?.analytics?.insights ||
    [];

  const forecast =
    progress?.forecast ||
    progress?.learningForecast ||
    progress?.analytics?.forecast ||
    {};

  const milestones = progress?.milestones || progress?.achievements || [];

  const nextAction =
    progress?.nextAction ||
    progress?.nextBestAction ||
    progress?.recommendation ||
    null;

  /*
   * ---------------------------------------------------------
   * DERIVED VALUES
   * ---------------------------------------------------------
   */

  const completedTopicsCount = overview.completedTopics.length;

  const pendingTopicsCount = overview.pendingTopics.length;

  const completedProjectsCount = overview.completedProjects.length;

  const totalTopics = completedTopicsCount + pendingTopicsCount;

  const topicCompletion =
    totalTopics > 0
      ? Math.round((completedTopicsCount / totalTopics) * 100)
      : overview.overallCompletion;

  const totalSessions =
    Number(sessions.totalSessions || sessions.total || sessions.totalCount) ||
    0;

  const completedSessions =
    Number(
      sessions.completedSessions ||
        sessions.completed ||
        sessions.completedCount,
    ) || 0;

  const averageSessionMinutes =
    Number(
      sessions.averageSessionMinutes ||
        sessions.averageDurationMinutes ||
        sessions.averageDuration,
    ) || 0;

  const sessionCompletionRate =
    totalSessions > 0
      ? Math.round((completedSessions / totalSessions) * 100)
      : 0;

  const understanding =
    Number(
      quality.understanding ||
        quality.averageUnderstanding ||
        quality.understandingScore,
    ) || 0;

  const confidence =
    Number(
      quality.confidence ||
        quality.averageConfidence ||
        quality.confidenceScore,
    ) || 0;

  const focus =
    Number(quality.focus || quality.averageFocus || quality.focusScore) || 0;

  const assessment =
    Number(
      quality.assessment ||
        quality.averageAssessment ||
        quality.assessmentScore,
    ) || 0;

  const learningQualityScore =
    Number(
      quality.overall || quality.overallQuality || quality.learningQuality,
    ) ||
    Math.round((understanding + confidence + focus + assessment) / 4) ||
    0;

  const consistencyRate =
    Number(activity.consistencyRate || activity.consistency || 0) || 0;

  const activeDays = Number(activity.activeDays) || 0;

  const activityData = Array.isArray(activity.dailyActivity)
    ? activity.dailyActivity
    : Array.isArray(activity.activity)
      ? activity.activity
      : [];

  const filteredActivity = useMemo(() => {
    const limit = Number(activeActivityRange);

    if (!Array.isArray(activityData)) {
      return [];
    }

    return activityData.slice(-limit);
  }, [activityData, activeActivityRange]);

  /*
   * ---------------------------------------------------------
   * HELPERS
   * ---------------------------------------------------------
   */

  const formatHours = (hours) => {
    const value = Number(hours) || 0;

    if (value < 1) {
      return `${Math.round(value * 60)} min`;
    }

    return `${value.toFixed(1)} hrs`;
  };

  const formatMinutes = (minutes) => {
    const value = Number(minutes) || 0;

    if (value < 60) {
      return `${Math.round(value)} min`;
    }

    const hours = Math.floor(value / 60);
    const remainingMinutes = Math.round(value % 60);

    return remainingMinutes ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const getQualityLabel = (score) => {
    if (score >= 85) return "Excellent";
    if (score >= 70) return "Strong";
    if (score >= 50) return "Moderate";
    if (score > 0) return "Needs Improvement";

    return "Not enough data";
  };

  const getStatusClass = (status) => {
    const normalized = String(status).toLowerCase().replace(/\s+/g, "-");

    return `status-${normalized}`;
  };

  const getTopicStatus = (topic) => {
    if (
      topic?.completed ||
      topic?.status === "completed" ||
      topic?.isCompleted
    ) {
      return "Completed";
    }

    if (
      topic?.inProgress ||
      topic?.status === "in-progress" ||
      topic?.status === "active"
    ) {
      return "In Progress";
    }

    return "Not Started";
  };

  const getTopicStatusClass = (topic) => {
    return getTopicStatus(topic).toLowerCase().replace(/\s+/g, "-");
  };

  /*
   * ---------------------------------------------------------
   * LOADING
   * ---------------------------------------------------------
   */

  if (loading) {
    return (
      <div className="progress-page">
        <div className="progress-loading">
          <div className="loading-spinner"></div>

          <h2>Loading Your Progress...</h2>

          <p>We're preparing your learning analytics.</p>
        </div>
      </div>
    );
  }

  /*
   * ---------------------------------------------------------
   * ERROR
   * ---------------------------------------------------------
   */

  if (error) {
    return (
      <div className="progress-page">
        <div className="progress-error">
          <span className="error-icon">⚠️</span>

          <h2>Unable to Load Progress</h2>

          <p>{error}</p>

          {!careerId && (
            <p className="error-hint">Please select a career roadmap first.</p>
          )}

          <button
            type="button"
            className="progress-retry-button"
            onClick={() => fetchProgress()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /*
   * ---------------------------------------------------------
   * EMPTY STATE
   * ---------------------------------------------------------
   */

  if (!progress) {
    return (
      <div className="progress-page">
        <div className="progress-empty">
          <div className="empty-icon">📊</div>

          <h2>No Progress Data Yet</h2>

          <p>
            Start your first learning session to begin tracking your progress.
          </p>
        </div>
      </div>
    );
  }

  /*
   * ---------------------------------------------------------
   * MAIN PROGRESS DASHBOARD
   * ---------------------------------------------------------
   */

  return (
    <div className="progress-page">
      {/* =====================================================
          TOP MAIN FLOW NAVIGATION
      ====================================================== */}

      <nav className="progress-flow-navigation" aria-label="Main learning flow">
        <button
          type="button"
          className="progress-flow-button progress-flow-back"
          onClick={goToLearning}
        >
          ← Back to Learning
        </button>

        <span className="progress-flow-current">Progress</span>

        <button
          type="button"
          className="progress-flow-button progress-flow-next"
          onClick={goToPlacement}
        >
          Continue to Placement →
        </button>
      </nav>

      {/* =====================================================
          HEADER
      ====================================================== */}

      <section className="progress-header">
        <div className="progress-header-content">
          <span className="progress-label">📈 Your Learning Journey</span>

          <h1>Learning Progress</h1>

          <p>
            Track your learning performance, consistency, quality and career
            roadmap progress.
          </p>
        </div>

        <div className="progress-header-actions">
          <div className="career-badge">
            🎯 {overview.careerId ? overview.careerId : "Selected Career"}
          </div>

          <button
            type="button"
            className="progress-refresh-button"
            onClick={() => fetchProgress(true)}
            disabled={refreshing}
          >
            {refreshing ? "Refreshing..." : "↻ Refresh"}
          </button>
        </div>
      </section>

      {/* =====================================================
          STATUS / MOMENTUM BAR
      ====================================================== */}

      <section className="progress-status-strip">
        <div className="status-item">
          <span>Current Status</span>

          <strong className={getStatusClass(overview.status)}>
            {overview.status}
          </strong>
        </div>

        <div className="status-item">
          <span>Current Phase</span>

          <strong>Phase {overview.currentPhase}</strong>
        </div>

        <div className="status-item">
          <span>Learning Momentum</span>

          <strong>
            {overview.currentStreak > 0
              ? `🔥 ${overview.currentStreak} day streak`
              : "Start your streak"}
          </strong>
        </div>

        <div className="status-item">
          <span>Next Milestone</span>

          <strong>{overview.nextMilestone || "Keep learning"}</strong>
        </div>
      </section>

      {/* =====================================================
          LEARNING ANALYTICS
      ====================================================== */}

      <ProgressChart progress={overview} />

      {/* =====================================================
          LEARNING MOMENTUM
      ====================================================== */}

      <section className="progress-section momentum-section">
        <div className="section-heading">
          <div>
            <span className="section-label">⚡ Performance</span>

            <h2>Learning Momentum</h2>

            <p>
              Understand how consistently you are progressing toward your goal.
            </p>
          </div>
        </div>

        <div className="momentum-grid">
          <div className="momentum-card">
            <div className="momentum-icon">🔥</div>

            <div>
              <span>Current Streak</span>

              <strong>{overview.currentStreak} days</strong>

              <small>
                {overview.currentStreak >= 7
                  ? "Excellent consistency"
                  : "Build your daily habit"}
              </small>
            </div>
          </div>

          <div className="momentum-card">
            <div className="momentum-icon">📅</div>

            <div>
              <span>Active Days</span>

              <strong>{activeDays}</strong>

              <small>Learning days tracked</small>
            </div>
          </div>

          <div className="momentum-card">
            <div className="momentum-icon">🎯</div>

            <div>
              <span>Consistency</span>

              <strong>{consistencyRate}%</strong>

              <small>
                {consistencyRate >= 75 ? "Very consistent" : "Room to improve"}
              </small>
            </div>
          </div>

          <div className="momentum-card">
            <div className="momentum-icon">⏱️</div>

            <div>
              <span>Average Session</span>

              <strong>{formatMinutes(averageSessionMinutes)}</strong>

              <small>Average focused learning</small>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          TOPIC PROGRESS
      ====================================================== */}

      <section className="progress-section topic-section">
        <div className="section-heading">
          <div>
            <span className="section-label">📚 Roadmap</span>

            <h2>Topic Progress</h2>

            <p>
              See which roadmap topics you have completed and where you need
              attention.
            </p>
          </div>

          <div className="section-stat">
            <strong>{topicCompletion}%</strong>

            <span>Topic Completion</span>
          </div>
        </div>

        {Array.isArray(topics) && topics.length > 0 ? (
          <div className="topic-list">
            {topics.map((topic, index) => {
              const status = getTopicStatus(topic);

              const topicProgress =
                Number(
                  topic?.completion ??
                    topic?.progress ??
                    (status === "Completed" ? 100 : 0),
                ) || 0;

              return (
                <div
                  className="topic-row"
                  key={topic?._id || topic?.topicId || topic?.title || index}
                >
                  <div className="topic-main">
                    <div className="topic-number">{index + 1}</div>

                    <div className="topic-details">
                      <h3>
                        {topic?.title ||
                          topic?.topic ||
                          topic?.name ||
                          "Learning Topic"}
                      </h3>

                      <span>Phase {topic?.phase || overview.currentPhase}</span>
                    </div>
                  </div>

                  <div className="topic-progress">
                    <div className="topic-progress-header">
                      <span>{topicProgress}%</span>

                      <span
                        className={`topic-status ${getTopicStatusClass(topic)}`}
                      >
                        {status}
                      </span>
                    </div>

                    <div className="topic-progress-bar">
                      <div
                        className="topic-progress-fill"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(0, topicProgress),
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="section-empty">
            <span>📚</span>

            <p>
              Detailed topic analytics will appear after roadmap learning data
              is available.
            </p>
          </div>
        )}
      </section>

      {/* =====================================================
          LEARNING QUALITY
      ====================================================== */}

      <section className="progress-section quality-section">
        <div className="section-heading">
          <div>
            <span className="section-label">🧠 Intelligence</span>

            <h2>Learning Quality</h2>

            <p>
              Measure how effectively you are learning, not just how much you
              complete.
            </p>
          </div>

          <div className="quality-score">
            <strong>{learningQualityScore}</strong>

            <span>{getQualityLabel(learningQualityScore)}</span>
          </div>
        </div>

        <div className="quality-grid">
          {[
            {
              label: "Understanding",
              value: understanding,
              icon: "💡",
            },
            {
              label: "Confidence",
              value: confidence,
              icon: "💪",
            },
            {
              label: "Focus",
              value: focus,
              icon: "🎯",
            },
            {
              label: "Assessment",
              value: assessment,
              icon: "📝",
            },
          ].map((item) => (
            <div className="quality-card" key={item.label}>
              <div className="quality-card-top">
                <span>
                  {item.icon} {item.label}
                </span>

                <strong>{item.value}%</strong>
              </div>

              <div className="quality-bar">
                <div
                  className="quality-fill"
                  style={{
                    width: `${Math.min(100, Math.max(0, item.value))}%`,
                  }}
                />
              </div>

              <small>{getQualityLabel(item.value)}</small>
            </div>
          ))}
        </div>
      </section>

      {/* =====================================================
          SESSION ANALYTICS
      ====================================================== */}

      <section className="progress-section session-section">
        <div className="section-heading">
          <div>
            <span className="section-label">⏱️ Sessions</span>

            <h2>Session Analytics</h2>

            <p>Analyse your actual learning behaviour across sessions.</p>
          </div>
        </div>

        <div className="session-grid">
          <div className="session-stat-card">
            <span>📚</span>

            <small>Total Sessions</small>

            <strong>{totalSessions}</strong>
          </div>

          <div className="session-stat-card">
            <span>✅</span>

            <small>Completed</small>

            <strong>{completedSessions}</strong>
          </div>

          <div className="session-stat-card">
            <span>📊</span>

            <small>Completion Rate</small>

            <strong>{sessionCompletionRate}%</strong>
          </div>

          <div className="session-stat-card">
            <span>⏱️</span>

            <small>Average Duration</small>

            <strong>{formatMinutes(averageSessionMinutes)}</strong>
          </div>

          <div className="session-stat-card">
            <span>⏸️</span>

            <small>Paused</small>

            <strong>
              {Number(sessions.pausedSessions || sessions.paused || 0)}
            </strong>
          </div>

          <div className="session-stat-card">
            <span>❌</span>

            <small>Abandoned</small>

            <strong>
              {Number(sessions.abandonedSessions || sessions.abandoned || 0)}
            </strong>
          </div>
        </div>
      </section>

      {/* =====================================================
          LEARNING ACTIVITY
      ====================================================== */}

      <section className="progress-section activity-section">
        <div className="section-heading">
          <div>
            <span className="section-label">📈 Activity</span>

            <h2>Learning Activity</h2>

            <p>Monitor your learning consistency over time.</p>
          </div>

          <div className="activity-range-switcher">
            {["7", "30", "90"].map((range) => (
              <button
                key={range}
                type="button"
                className={activeActivityRange === range ? "active" : ""}
                onClick={() => setActiveActivityRange(range)}
              >
                {range}D
              </button>
            ))}
          </div>
        </div>

        <div className="activity-chart">
          {filteredActivity.length > 0 ? (
            filteredActivity.map((day, index) => {
              const minutes =
                Number(
                  day?.studyMinutes || day?.minutes || day?.duration || 0,
                ) || 0;

              const maxMinutes = Math.max(
                ...filteredActivity.map(
                  (item) =>
                    Number(
                      item?.studyMinutes ||
                        item?.minutes ||
                        item?.duration ||
                        0,
                    ) || 0,
                ),
                60,
              );

              const height = Math.max(
                4,
                Math.min(100, (minutes / maxMinutes) * 100),
              );

              return (
                <div
                  className="activity-column"
                  key={day?.date || day?.day || index}
                >
                  <div className="activity-tooltip">
                    {formatMinutes(minutes)}
                  </div>

                  <div className="activity-bar-wrapper">
                    <div
                      className="activity-bar"
                      style={{
                        height: `${height}%`,
                      }}
                    />
                  </div>

                  <span>
                    {day?.label || day?.day || day?.date || index + 1}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="activity-empty">
              <span>📅</span>

              <p>
                Learning activity will appear here once you start completing
                sessions.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          AI INSIGHTS + NEXT ACTION
      ====================================================== */}

      <section className="progress-ai-grid">
        <div className="progress-section ai-insights-section">
          <div className="section-heading">
            <div>
              <span className="section-label">🤖 AI Mentor</span>

              <h2>AI Learning Insights</h2>

              <p>Practical insights based on your learning behaviour.</p>
            </div>
          </div>

          {Array.isArray(insights) && insights.length > 0 ? (
            <div className="insight-list">
              {insights.map((insight, index) => {
                const text =
                  typeof insight === "string"
                    ? insight
                    : insight?.message ||
                      insight?.text ||
                      insight?.insight ||
                      "Keep building your learning consistency.";

                return (
                  <div className="insight-item" key={index}>
                    <span>💡</span>

                    <p>{text}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="section-empty">
              <span>🤖</span>

              <p>
                AI insights will become more personalized as more learning
                sessions are completed.
              </p>
            </div>
          )}
        </div>

        <div className="progress-section next-action-section">
          <div className="section-heading">
            <div>
              <span className="section-label">🚀 Recommended</span>

              <h2>Next Best Action</h2>

              <p>Your recommended next step.</p>
            </div>
          </div>

          <div className="next-action-card">
            <div className="next-action-icon">🚀</div>

            <div>
              <h3>
                {nextAction?.title ||
                  nextAction?.topic ||
                  "Continue Your Learning"}
              </h3>

              <p>
                {nextAction?.description ||
                  nextAction?.reason ||
                  overview.nextMilestone ||
                  "Complete your next roadmap topic to keep your progress moving."}
              </p>

              {nextAction?.actionLabel && (
                <button type="button" className="next-action-button">
                  {nextAction.actionLabel}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FORECAST
      ====================================================== */}

      <section className="progress-section forecast-section">
        <div className="section-heading">
          <div>
            <span className="section-label">🔮 Forecast</span>

            <h2>Learning Forecast</h2>

            <p>
              Estimated roadmap progress based on your recent learning pace.
            </p>
          </div>
        </div>

        <div className="forecast-grid">
          <div className="forecast-card">
            <span>🎯</span>

            <small>Current Completion</small>

            <strong>{overview.overallCompletion}%</strong>
          </div>

          <div className="forecast-card">
            <span>📅</span>

            <small>Estimated Time</small>

            <strong>
              {forecast.estimatedDays
                ? `${forecast.estimatedDays} days`
                : forecast.estimatedWeeks
                  ? `${forecast.estimatedWeeks} weeks`
                  : "Calculating"}
            </strong>
          </div>

          <div className="forecast-card">
            <span>⏱️</span>

            <small>Recommended Weekly Study</small>

            <strong>
              {forecast.recommendedWeeklyHours
                ? `${forecast.recommendedWeeklyHours} hrs`
                : "Build more data"}
            </strong>
          </div>

          <div className="forecast-card">
            <span>📊</span>

            <small>Forecast Confidence</small>

            <strong>
              {forecast.confidence ? `${forecast.confidence}%` : "Developing"}
            </strong>
          </div>
        </div>
      </section>

      {/* =====================================================
          MILESTONES
      ====================================================== */}

      <section className="progress-section milestone-section">
        <div className="section-heading">
          <div>
            <span className="section-label">🏆 Achievements</span>

            <h2>Milestones & Achievements</h2>

            <p>Small wins that build long-term learning momentum.</p>
          </div>
        </div>

        <div className="milestone-grid">
          {Array.isArray(milestones) && milestones.length > 0 ? (
            milestones.map((milestone, index) => (
              <div
                className={`milestone-card ${
                  milestone?.completed ? "completed" : ""
                }`}
                key={milestone?._id || milestone?.id || index}
              >
                <div className="milestone-icon">{milestone?.icon || "🏆"}</div>

                <div>
                  <h3>
                    {milestone?.title ||
                      milestone?.name ||
                      "Learning Milestone"}
                  </h3>

                  <p>
                    {milestone?.description ||
                      "Keep learning to unlock this achievement."}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <>
              <div className="milestone-card">
                <div className="milestone-icon">📚</div>

                <div>
                  <h3>
                    {completedTopicsCount > 0
                      ? "Topics Started"
                      : "First Topic"}
                  </h3>

                  <p>
                    {completedTopicsCount > 0
                      ? `${completedTopicsCount} topics completed`
                      : "Complete your first topic to start your achievement journey."}
                  </p>
                </div>
              </div>

              <div className="milestone-card">
                <div className="milestone-icon">🔥</div>

                <div>
                  <h3>Streak Builder</h3>

                  <p>
                    {overview.currentStreak > 0
                      ? `${overview.currentStreak} day learning streak`
                      : "Start learning today to build your streak."}
                  </p>
                </div>
              </div>

              <div className="milestone-card">
                <div className="milestone-icon">🚀</div>

                <div>
                  <h3>Project Progress</h3>

                  <p>
                    {completedProjectsCount} project
                    {completedProjectsCount === 1 ? "" : "s"} completed.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* =====================================================
          FINAL JOURNEY SUMMARY
      ====================================================== */}

      <section className="progress-final-summary">
        <div>
          <span>🎯 Career Journey</span>

          <h2>
            {overview.overallCompletion >= 80
              ? "You're close to the finish line! 🚀"
              : overview.overallCompletion >= 50
                ? "You're making strong progress! 💪"
                : "Your journey has started! 🌱"}
          </h2>

          <p>
            Keep your learning sessions consistent, strengthen weak areas and
            follow your next roadmap action.
          </p>
        </div>

        <div className="final-summary-stats">
          <div>
            <strong>{formatHours(overview.totalStudyHours)}</strong>

            <span>Total Study</span>
          </div>

          <div>
            <strong>{completedTopicsCount}</strong>

            <span>Topics Done</span>
          </div>

          <div>
            <strong>{overview.currentStreak}</strong>

            <span>Day Streak</span>
          </div>

          <div>
            <strong>{learningQualityScore || 0}</strong>

            <span>Quality Score</span>
          </div>
        </div>
      </section>

      {/* =====================================================
          BOTTOM MAIN FLOW NAVIGATION
      ====================================================== */}

      <nav
        className="progress-flow-navigation progress-flow-navigation-bottom"
        aria-label="Main learning flow"
      >
        <button
          type="button"
          className="progress-flow-button progress-flow-back"
          onClick={goToLearning}
        >
          ← Back to Learning
        </button>

        <span className="progress-flow-current">Progress</span>

        <button
          type="button"
          className="progress-flow-button progress-flow-next"
          onClick={goToPlacement}
        >
          Continue to Placement →
        </button>
      </nav>
    </div>
  );
}

export default Progress;
