import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import "./Learning.css";

import {
  getLearningProgress,
  completeTopic,
} from "../../services/learningService";

function Learning() {
  const navigate = useNavigate();

  const [progress, setProgress] = useState(null);
  const [careerId, setCareerId] = useState("");
  const [loading, setLoading] = useState(true);
  const [completingTopic, setCompletingTopic] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadLearningProgress();
  }, []);

  // =====================================================
  // LOAD LEARNING PROGRESS
  // =====================================================

  const loadLearningProgress = async () => {
    try {
      setLoading(true);
      setError("");

      const selectedCareerId = localStorage.getItem("selectedCareerId");

      if (!selectedCareerId) {
        setError("No learning path found. Please select your career first.");
        return;
      }

      setCareerId(selectedCareerId);

      const response = await getLearningProgress(selectedCareerId);

      setProgress(response.data?.data || null);
    } catch (err) {
      console.error("Unable to load learning progress:", err);

      setError(
        err.response?.data?.message || "Unable to load your learning progress.",
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // COMPLETE TOPIC
  // =====================================================

  const handleCompleteTopic = async (topic) => {
    if (!careerId || !topic) return;

    try {
      setCompletingTopic(topic);
      setError("");

      await completeTopic(careerId, topic);

      toast.success(`"${topic}" completed 🎉`);

      await loadLearningProgress();
    } catch (err) {
      console.error("Unable to complete topic:", err);

      const message =
        err.response?.data?.message || "Unable to complete this topic.";

      setError(message);
      toast.error(message);
    } finally {
      setCompletingTopic("");
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="learning-page">
        <div className="learning-state">
          <div className="learning-spinner"></div>

          <h2>Preparing your learning path...</h2>

          <p>Loading your personalized journey.</p>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error && !progress) {
    return (
      <div className="learning-page">
        <div className="learning-state learning-error">
          <div className="learning-state-icon">⚠️</div>

          <h2>Unable to Load Learning Path</h2>

          <p>{error}</p>

          <div className="learning-state-actions">
            <button onClick={loadLearningProgress}>Try Again</button>

            <button
              className="secondary-button"
              onClick={() => navigate("/dashboard")}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // NO PROGRESS
  // =====================================================

  if (!progress) {
    return (
      <div className="learning-page">
        <div className="learning-state">
          <div className="learning-state-icon">📚</div>

          <h2>Your Learning Path Isn't Ready Yet</h2>

          <p>
            Select a career and complete the required setup to generate your
            personalized learning journey.
          </p>

          <button onClick={() => navigate("/dashboard")}>
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const completion = progress.overallCompletion || 0;
  const pendingTopics = progress.pendingTopics || [];
  const completedTopics = progress.completedTopics || [];

  const nextTopic = pendingTopics[0];

  return (
    <div className="learning-page">
      <div className="learning-container">
        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <section className="learning-hero">
          <div className="learning-hero-content">
            <span className="learning-badge">📚 Personalized Learning</span>

            <h1>Your Learning Journey</h1>

            <p>
              Build the skills you need for your target career, one topic at a
              time.
            </p>

            <div className="learning-career">
              <span>🎯 Career Path</span>
              <strong>{careerId}</strong>
            </div>
          </div>

          <div className="phase-card">
            <span>Current Phase</span>

            <strong>Phase {progress.currentPhase || 1}</strong>

            <small>
              {pendingTopics.length > 0
                ? `${pendingTopics.length} topics remaining`
                : "All topics completed"}
            </small>
          </div>
        </section>

        {/* =================================================
            ERROR ALERT
        ================================================= */}

        {error && (
          <div className="learning-alert">
            <span>⚠️</span>
            <p>{error}</p>

            <button onClick={() => setError("")}>×</button>
          </div>
        )}

        {/* =================================================
            PROGRESS OVERVIEW
        ================================================= */}

        <section className="learning-overview">
          <div className="overview-card">
            <div className="overview-icon progress-icon">📈</div>

            <div>
              <span>Overall Progress</span>
              <strong>{completion}%</strong>
            </div>
          </div>

          <div className="overview-card">
            <div className="overview-icon streak-icon">🔥</div>

            <div>
              <span>Study Streak</span>
              <strong>{progress.currentStreak || 0} days</strong>
            </div>
          </div>

          <div className="overview-card">
            <div className="overview-icon hours-icon">⏱️</div>

            <div>
              <span>Study Hours</span>
              <strong>{progress.totalStudyHours || 0} hrs</strong>
            </div>
          </div>

          <div className="overview-card">
            <div className="overview-icon topic-icon">📚</div>

            <div>
              <span>Topics Completed</span>
              <strong>{completedTopics.length}</strong>
            </div>
          </div>
        </section>

        {/* =================================================
            PROGRESS BAR
        ================================================= */}

        <section className="learning-progress-card">
          <div className="progress-heading">
            <div>
              <span className="section-label">YOUR PROGRESS</span>

              <h2>Learning Path Progress</h2>

              <p>
                Keep completing topics to move through your personalized
                roadmap.
              </p>
            </div>

            <strong>{completion}%</strong>
          </div>

          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${completion}%` }}
            />
          </div>

          <div className="progress-meta">
            <span>{completedTopics.length} completed</span>

            <span>{pendingTopics.length} remaining</span>
          </div>
        </section>

        {/* =================================================
            NEXT TOPIC
        ================================================= */}

        {nextTopic && (
          <section className="next-topic-card">
            <div className="next-topic-icon">🚀</div>

            <div className="next-topic-content">
              <span>YOUR NEXT STEP</span>

              <h2>{nextTopic}</h2>

              <p>
                Complete this topic to continue progressing through your
                learning path.
              </p>
            </div>

            <button
              onClick={() => handleCompleteTopic(nextTopic)}
              disabled={completingTopic === nextTopic}
            >
              {completingTopic === nextTopic
                ? "Completing..."
                : "✓ Mark Complete"}
            </button>
          </section>
        )}

        {/* =================================================
            PENDING TOPICS
        ================================================= */}

        <section className="learning-section">
          <div className="section-heading">
            <div>
              <span className="section-label">UPCOMING</span>

              <h2>📖 Topics to Learn</h2>

              <p>Follow these topics in order to build your career skills.</p>
            </div>

            <span className="topic-counter">
              {pendingTopics.length} Remaining
            </span>
          </div>

          {pendingTopics.length > 0 ? (
            <div className="topic-list">
              {pendingTopics.map((topic, index) => (
                <div
                  className={`topic-card ${index === 0 ? "active-topic" : ""}`}
                  key={`${topic}-${index}`}
                >
                  <div className="topic-number">{index + 1}</div>

                  <div className="topic-details">
                    <div className="topic-title-row">
                      <h3>{topic}</h3>

                      {index === 0 && (
                        <span className="current-topic">Current</span>
                      )}
                    </div>

                    <p>
                      {index === 0
                        ? "Your next recommended learning topic."
                        : "Upcoming topic in your learning path."}
                    </p>
                  </div>

                  <button
                    className="topic-complete-btn"
                    onClick={() => handleCompleteTopic(topic)}
                    disabled={completingTopic === topic}
                  >
                    {completingTopic === topic ? "..." : "Complete"}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-topics">
              <div>🎉</div>

              <h3>Learning Path Completed!</h3>

              <p>
                Excellent work! You have completed all topics in your current
                learning path.
              </p>
            </div>
          )}
        </section>

        {/* =================================================
            COMPLETED TOPICS
        ================================================= */}

        <section className="learning-section completed-section">
          <div className="section-heading">
            <div>
              <span className="section-label">ACHIEVEMENT</span>

              <h2>✅ Completed Topics</h2>

              <p>Your completed learning milestones.</p>
            </div>

            <span className="topic-counter completed-counter">
              {completedTopics.length} Completed
            </span>
          </div>

          {completedTopics.length > 0 ? (
            <div className="completed-list">
              {completedTopics.map((topic, index) => (
                <div className="completed-topic" key={`${topic}-${index}`}>
                  <div className="completed-check">✓</div>

                  <div>
                    <h3>{topic}</h3>

                    <p>Completed successfully</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-completed">
              <span>📘</span>

              <h3>No completed topics yet</h3>

              <p>
                Start with your next topic and your achievements will appear
                here.
              </p>
            </div>
          )}
        </section>

        {/* =================================================
            BOTTOM CTA
        ================================================= */}

        <section className="learning-cta">
          <div>
            <span>💡</span>

            <div>
              <h2>Stay consistent with your learning.</h2>

              <p>Small progress every day leads to strong career readiness.</p>
            </div>
          </div>

          <button onClick={() => navigate("/progress")}>
            View Full Progress →
          </button>
        </section>
      </div>
    </div>
  );
}

export default Learning;
