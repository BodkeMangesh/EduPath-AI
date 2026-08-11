import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const [error, setError] = useState("");

  useEffect(() => {
    loadLearningProgress();
  }, []);

  const loadLearningProgress = async () => {
    try {
      setLoading(true);
      setError("");

      /*
       * Get selected career from localStorage.
       *
       * We need the career SLUG because
       * LearningProgress is currently created with:
       *
       * careerId = "full-stack-developer"
       */

      const selectedCareerId = localStorage.getItem("selectedCareerId");

      if (!selectedCareerId) {
        setError("No selected career found. Please select a career first.");
        return;
      }

      setCareerId(selectedCareerId);

      const response = await getLearningProgress(selectedCareerId);

      if (!selectedCareerId) {
        setError("Selected career information is invalid.");
        return;
      }

      setCareerId(selectedCareerId);
      console.log("Stored Career:", career);
      console.log("Selected Career ID:", selectedCareerId);

      const response = await getLearningProgress(selectedCareerId);

      setProgress(response.data.data);
    } catch (err) {
      console.error("Unable to load learning progress:", err);

      setError(
        err.response?.data?.message || "Unable to load your learning progress.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTopic = async (topic) => {
    try {
      setError("");

      const selectedCareerId = localStorage.getItem("selectedCareerId");

      if (!selectedCareerId) {
        setError("Selected career not found.");
        return;
      }

      console.log("Completing Topic:", topic);
      console.log("Career ID:", selectedCareerId);

      await completeTopic(selectedCareerId, topic);

      // Reload latest progress
      await loadLearningProgress();
    } catch (err) {
      console.error("Unable to complete topic:", err);

      setError(err.response?.data?.message || "Unable to complete topic.");
    }
  };

  if (loading) {
    return (
      <div className="learning-state">
        <div className="learning-spinner"></div>

        <h2>Loading your learning path...</h2>

        <p>Preparing your personalized learning journey.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="learning-state learning-error">
        <div className="learning-error-icon">⚠️</div>

        <h2>Unable to Load Learning Path</h2>

        <p>{error}</p>

        <button onClick={loadLearningProgress}>Try Again</button>

        <button
          className="secondary-button"
          onClick={() => navigate("/career-discovery")}
        >
          Explore Careers
        </button>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="learning-state">
        <h2>No Learning Progress Found</h2>

        <p>
          Complete your assessment to generate your personalized learning path.
        </p>

        <button onClick={() => navigate("/skill-assessment")}>
          Take Assessment
        </button>
      </div>
    );
  }

  return (
    <div className="learning-page">
      {/* Header */}
      <section className="learning-header">
        <div>
          <span className="learning-badge">📚 Personalized Learning</span>

          <h1>Your Learning Journey</h1>

          <p>
            Follow your personalized learning path and build the skills needed
            for your career.
          </p>
        </div>

        <div className="phase-card">
          <span>Current Phase</span>

          <strong>Phase {progress.currentPhase || 1}</strong>
        </div>
      </section>

      {/* Progress Overview */}
      <section className="learning-overview">
        <div className="overview-card">
          <span>📈</span>

          <div>
            <p>Overall Completion</p>

            <h2>{progress.overallCompletion || 0}%</h2>
          </div>
        </div>

        <div className="overview-card">
          <span>🔥</span>

          <div>
            <p>Current Streak</p>

            <h2>{progress.currentStreak || 0} days</h2>
          </div>
        </div>

        <div className="overview-card">
          <span>⏱️</span>

          <div>
            <p>Study Hours</p>

            <h2>{progress.totalStudyHours || 0} hrs</h2>
          </div>
        </div>

        <div className="overview-card">
          <span>🎯</span>

          <div>
            <p>Next Milestone</p>

            <h2 className="milestone-text">
              {progress.nextMilestone || "Keep Learning"}
            </h2>
          </div>
        </div>
      </section>

      {/* Progress Bar */}
      <section className="learning-section">
        <div className="section-heading">
          <div>
            <h2>Learning Progress</h2>

            <p>Track your progress toward completing your learning path.</p>
          </div>

          <strong>{progress.overallCompletion || 0}%</strong>
        </div>

        <div className="progress-track">
          <div
            className="progress-fill"
            style={{
              width: `${progress.overallCompletion || 0}%`,
            }}
          ></div>
        </div>
      </section>

      {/* Pending Topics */}
      <section className="learning-section">
        <div className="section-heading">
          <div>
            <h2>📖 Topics to Learn</h2>

            <p>Complete these topics to move forward.</p>
          </div>
        </div>

        {progress.pendingTopics?.length > 0 ? (
          <div className="topic-list">
            {progress.pendingTopics.map((topic, index) => (
              <div className="topic-card" key={`${topic}-${index}`}>
                <div className="topic-number">{index + 1}</div>

                <div className="topic-content">
                  <h3>{topic}</h3>

                  <span>Pending</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-topics">
            <span>🎉</span>

            <h3>Learning Path Completed!</h3>

            <p>You have completed all available topics.</p>
          </div>
        )}
      </section>

      {/* Completed Topics */}
      <section className="learning-section">
        <div className="section-heading">
          <div>
            <h2>✅ Completed Topics</h2>

            <p>Topics you have already completed.</p>
          </div>
        </div>

        {progress.completedTopics?.length > 0 ? (
          <div className="completed-list">
            {progress.completedTopics.map((topic, index) => (
              <div className="completed-topic" key={`${topic}-${index}`}>
                <span>✓</span>

                <p>{topic}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-completed">No topics completed yet.</div>
        )}
      </section>

      {/* Career Information */}
      <section className="learning-footer-card">
        <div>
          <span>🚀</span>

          <div>
            <h2>Keep building your skills</h2>

            <p>Consistency is the key to becoming career-ready.</p>
          </div>
        </div>

        <button onClick={() => navigate("/progress")}>View Progress →</button>
      </section>
    </div>
  );
}

export default Learning;
