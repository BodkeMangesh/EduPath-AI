import { useNavigate } from "react-router-dom";
import "./TodayTaskCard.css";

function TodayTaskCard({ dashboard }) {
  const navigate = useNavigate();

  const handleStartLearning = () => {
    navigate("/learning");
  };

  if (!dashboard) return null;

  return (
    <div className="dashboard-card today-task-card">
      {/* Header */}
      <div className="today-task-header">
        <span>📅</span>

        <div>
          <h3>Today's Learning</h3>
          <p>Focus on your next step.</p>
        </div>
      </div>

      {/* Task */}
      <div className="task-box">
        <h4>{dashboard.todayTask || "Continue your learning path"}</h4>

        <div className="task-info">
          <p>
            <strong>Current Phase:</strong>{" "}
            {dashboard.currentPhase || "Not started"}
          </p>

          <p>
            <strong>Next Milestone:</strong>{" "}
            {dashboard.nextMilestone || "Keep Learning"}
          </p>

          <p>
            <strong>Pending Topics:</strong> {dashboard.pendingTopics || 0}
          </p>
        </div>

        <button className="start-learning-btn" onClick={handleStartLearning}>
          Start Learning →
        </button>
      </div>
    </div>
  );
}

export default TodayTaskCard;
