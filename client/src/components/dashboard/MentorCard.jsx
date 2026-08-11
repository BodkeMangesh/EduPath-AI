import { useNavigate } from "react-router-dom";
import "./MentorCard.css";

function MentorCard({ dashboard }) {
  const navigate = useNavigate();

  const mentor = dashboard?.mentor;

  return (
    <div className="dashboard-card mentor-card">
      {/* Header */}
      <div className="mentor-header">
        <span>🤖</span>

        <div>
          <h3>AI Mentor</h3>
          <p>Your personalized AI guidance</p>
        </div>
      </div>

      {/* Mentor Content */}
      <div className="mentor-message">
        <div className="mentor-item">
          <strong>💡 Motivation</strong>
          <p>
            {mentor?.motivation ||
              "Stay consistent and keep improving your skills."}
          </p>
        </div>

        <div className="mentor-item">
          <strong>🎯 Today's Goal</strong>
          <p>{mentor?.todayGoal || "Complete today's learning task."}</p>
        </div>

        <div className="mentor-item">
          <strong>🚀 Career Tip</strong>
          <p>
            {mentor?.careerTip ||
              "Build practical projects to strengthen your profile."}
          </p>
        </div>

        <div className="mentor-item warning-item">
          <strong>⚠ Warning</strong>
          <p>{mentor?.warning || "Don't skip your learning schedule."}</p>
        </div>
      </div>

      {/* AI Mentor Button */}
      <button className="mentor-btn" onClick={() => navigate("/chat")}>
        Ask AI Mentor →
      </button>
    </div>
  );
}

export default MentorCard;
