import "./MentorCard.css";

function MentorCard() {
  return (
    <div className="mentor-card">
      <h3>🤖 AI Mentor</h3>

      <div className="mentor-message">
        <p>
          "Great progress! You have maintained your learning streak. Focus on
          completing React projects this week to improve your job readiness."
        </p>
      </div>

      <button className="mentor-btn">Ask AI Mentor</button>
    </div>
  );
}

export default MentorCard;
