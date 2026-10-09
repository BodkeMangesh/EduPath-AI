import "../../pages/Dashboard/Dashboard.css";
import { completeTopic } from "../../services/dashboardService";

function ProgressCard({ dashboard, refreshDashboard }) {
  const handleComplete = async () => {
    if (!dashboard?.nextMilestone || !dashboard?.career) {
      return;
    }

    try {
      await completeTopic(
        dashboard.nextMilestone,
        dashboard.career.toLowerCase(),
      );

      await refreshDashboard();
    } catch (error) {
      console.error("Unable to complete topic:", error);
    }
  };

  if (!dashboard) return null;

  const completion = dashboard.overallCompletion || 0;

  return (
    <div className="dashboard-card progress-card">
      {/* Header */}
      <div className="card-header">
        <div>
          <span>📈</span>
          <h3>Learning Progress</h3>
        </div>

        <strong>{completion}%</strong>
      </div>

      {/* Fixed Progress Area */}
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{
            width: `${completion}%`,
          }}
        />
      </div>

      {/* Scrollable Content */}
      <div className="progress-content">
        <p className="progress-status">
          {completion === 100
            ? "🎉 Learning path completed!"
            : "Keep learning to improve your progress."}
        </p>

        {/* Statistics */}
        <div className="progress-stats">
          <div>
            <span>Completed Topics</span>
            <strong>{dashboard.completedTopics?.length || 0}</strong>
          </div>

          <div>
            <span>Pending Topics</span>
            <strong>{dashboard.pendingTopics?.length || 0}</strong>
          </div>

          <div>
            <span>Study Streak</span>
            <strong>🔥 {dashboard.studyStreak || 0} days</strong>
          </div>
        </div>

        {/* Next Topic */}
        {dashboard.nextMilestone && completion < 100 && (
          <div className="next-topic">
            <p>Next Topic</p>

            <button className="topic-btn" onClick={handleComplete}>
              ✔ {dashboard.nextMilestone}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProgressCard;
