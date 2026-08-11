import { useEffect, useState } from "react";
import "./Progress.css";

import { getProgress } from "../../services/progressService";

import ProgressCard from "../../components/ProgressCard/ProgressCard";
import ProgressChart from "../../components/ProgressChart/ProgressChart";

function Progress() {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const careerId = localStorage.getItem("careerId") || "full-stack";

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      setLoading(true);

      const response = await getProgress(careerId);

      setProgress(response.data.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Unable to load progress.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="progress-page">
        <div className="progress-loading">
          <div className="loading-spinner"></div>
          <p>Loading Progress...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="progress-page">
        <div className="progress-error">
          <span>⚠️</span>
          <h2>Unable to Load Progress</h2>
          <p>{error}</p>

          <button onClick={fetchProgress}>Retry</button>
        </div>
      </div>
    );
  }

  if (!progress) return null;

  return (
    <div className="progress-page">
      {/* Header */}
      <div className="progress-header">
        <div>
          <span className="progress-label">📈 Your Journey</span>

          <h1>Learning Progress</h1>

          <p>Track your learning journey and monitor your career readiness.</p>
        </div>

        <div className="career-badge">🎯 {progress.careerId}</div>
      </div>

      {/* Main Progress */}
      <ProgressCard progress={progress} />

      {/* Chart */}
      <ProgressChart progress={progress} />

      {/* Summary */}
      <div className="progress-summary">
        <div className="summary-box">
          <span className="summary-icon">✅</span>
          <h3>Completed Topics</h3>
          <h2>{progress.completedTopics?.length || 0}</h2>
        </div>

        <div className="summary-box">
          <span className="summary-icon">📚</span>
          <h3>Pending Topics</h3>
          <h2>{progress.pendingTopics?.length || 0}</h2>
        </div>

        <div className="summary-box">
          <span className="summary-icon">🚀</span>
          <h3>Current Phase</h3>
          <h2>Phase {progress.currentPhase}</h2>
        </div>

        <div className="summary-box milestone-box">
          <span className="summary-icon">🎯</span>
          <h3>Next Milestone</h3>
          <p>{progress.nextMilestone || "No milestone"}</p>
        </div>
      </div>
    </div>
  );
}

export default Progress;
