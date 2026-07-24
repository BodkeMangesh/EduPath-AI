import "../../pages/Dashboard/Dashboard.css";
import { completeTopic } from "../../services/dashboardService";

function ProgressCard({ dashboard, refreshDashboard }) {
  const handleComplete = async () => {
    try {
      await completeTopic(
        dashboard.nextMilestone,
        dashboard.career.toLowerCase(),
      );

      refreshDashboard();
    } catch (error) {
      console.error(error);
    }
  };

  if (!dashboard) return null;

  return (
    <div className="dashboard-card">
      <h3>📈 Learning Progress</h3>

      <h4>{dashboard.overallCompletion}% Completed</h4>

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{
            width: `${dashboard.overallCompletion}%`,
          }}
        ></div>
      </div>

      <p>Completed Topics: {dashboard.completedTopics}</p>

      <p>Pending Topics: {dashboard.pendingTopics}</p>

      <br />

      <h4>Pending Topic List</h4>

      {dashboard.nextMilestone && (
        <button className="topic-btn" onClick={handleComplete}>✔ {dashboard.nextMilestone}</button>
      )}
    </div>
  );
}

export default ProgressCard;
