import { useEffect, useState } from "react";
import "./Learning.css";

import {
  getLearningProgress,
  completeTopic,
} from "../../services/learningService";

import ProgressHeader from "../../components/learning/ProgressHeader";
import CompletedTopics from "../../components/learning/CompletedTopics";
import PendingTopics from "../../components/learning/PendingTopics";

function Learning() {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProgress();
  }, []);

  // ==============================
  // LOAD LEARNING PROGRESS
  // ==============================
  const loadProgress = async () => {
    try {
      setLoading(true);
      setError("");

      // IMPORTANT:
      // Only use selectedCareerId
      const careerId = localStorage.getItem("selectedCareerId");

      console.log("===== LEARNING PAGE =====");

      console.log("Selected Career ID:", careerId);

      if (!careerId) {
        setError(
          "No selected career found. Please complete the assessment first.",
        );

        return;
      }

      const response = await getLearningProgress(careerId);

      console.log("Learning Progress Response:", response.data);

      setProgress(response.data?.data || null);
    } catch (err) {
      console.error("Unable to load learning progress:", err);

      setError(
        err.response?.data?.message || "Unable to load learning progress.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // COMPLETE TOPIC
  // ==============================
  const handleCompleteTopic = async (topic) => {
    try {
      setError("");

      const careerId = localStorage.getItem("selectedCareerId");

      if (!careerId) {
        setError("Selected career not found.");

        return;
      }

      console.log("Completing Topic:", topic);

      console.log("Career ID:", careerId);

      await completeTopic(careerId, topic);

      await loadProgress();

      alert("Topic completed successfully.");
    } catch (err) {
      console.error("Unable to complete topic:", err);

      setError(err.response?.data?.message || "Unable to complete topic.");
    }
  };

  // ==============================
  // LOADING
  // ==============================
  if (loading) {
    return (
      <div className="learning-page">
        <div className="learning-container">
          <div className="learning-loading">
            <h2>Loading Learning Path...</h2>

            <p>Preparing your personalized learning journey.</p>
          </div>
        </div>
      </div>
    );
  }

  // ==============================
  // ERROR
  // ==============================
  if (error) {
    return (
      <div className="learning-page">
        <div className="learning-container">
          <div className="learning-error">
            <h2>Unable to Load Learning Path</h2>

            <p>{error}</p>

            <button onClick={loadProgress}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  // ==============================
  // NO PROGRESS
  // ==============================
  if (!progress) {
    return (
      <div className="learning-page">
        <div className="learning-container">
          <div className="learning-empty">
            <h2>No Learning Progress Found</h2>

            <p>Please complete your skill assessment first.</p>
          </div>
        </div>
      </div>
    );
  }

  // ==============================
  // MAIN PAGE
  // ==============================
  return (
    <div className="learning-page">
      <div className="learning-container">
        {/* ==========================
            PAGE HEADER
        ========================== */}
        <div className="learning-header">
          <h1>Your Learning Path</h1>

          <p>
            Follow your personalized learning journey and build your career step
            by step.
          </p>
        </div>

        {/* ==========================
            PROGRESS HEADER
        ========================== */}
        <ProgressHeader progress={progress} />

        {/* ==========================
            SUMMARY
        ========================== */}
        <div className="learning-summary">
          {/* Overall Progress */}
          <div className="summary-card">
            <h3>Overall Progress</h3>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${progress.overallCompletion || 0}%`,
                }}
              />
            </div>

            <span>{progress.overallCompletion || 0}% Completed</span>
          </div>

          {/* Current Phase */}
          <div className="summary-card">
            <h3>Current Phase</h3>

            <h2>Phase {progress.currentPhase || 1}</h2>
          </div>

          {/* Next Milestone */}
          <div className="summary-card">
            <h3>Next Milestone</h3>

            <p>{progress.nextMilestone || "Learning Path Started"}</p>
          </div>
        </div>

        {/* ==========================
            TOPICS
        ========================== */}
        <div className="learning-grid">
          {/* Completed */}
          <CompletedTopics topics={progress.completedTopics || []} />

          {/* Pending */}
          <PendingTopics
            topics={progress.pendingTopics || []}
            onComplete={handleCompleteTopic}
          />
        </div>

        {/* ==========================
            STATISTICS
        ========================== */}
        <div className="learning-stats">
          {/* Completed Topics */}
          <div className="stat-card">
            <h3>Completed Topics</h3>

            <h1>{(progress.completedTopics || []).length}</h1>
          </div>

          {/* Pending Topics */}
          <div className="stat-card">
            <h3>Pending Topics</h3>

            <h1>{(progress.pendingTopics || []).length}</h1>
          </div>

          {/* Study Streak */}
          <div className="stat-card">
            <h3>Study Streak</h3>

            <h1>{progress.currentStreak || 0} 🔥</h1>
          </div>

          {/* Study Hours */}
          <div className="stat-card">
            <h3>Study Hours</h3>

            <h1>{progress.totalStudyHours || 0} hrs</h1>
          </div>
        </div>

        {/* ==========================
            COMPLETED MESSAGE
        ========================== */}
        {(progress.pendingTopics || []).length === 0 && (
          <div className="learning-completed">
            <h2>🎉 Congratulations!</h2>

            <p>You have successfully completed your entire learning path.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Learning;
