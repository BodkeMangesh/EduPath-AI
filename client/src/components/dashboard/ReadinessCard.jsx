import "./ReadinessCard.css";

function ReadinessCard({ dashboard }) {
  const readiness = dashboard?.careerReadiness;

  const score = readiness?.score ?? 0;

  let status = "Beginner";

  if (score >= 80) {
    status = "Job Ready";
  } else if (score >= 60) {
    status = "Intermediate";
  } else if (score >= 40) {
    status = "Learning";
  }

  return (
    <div className="dashboard-card readiness-card">
      {/* Header */}
      <div className="readiness-header">
        <span>🎯</span>

        <div>
          <h3>Career Readiness</h3>
          <p>Your current career preparation level</p>
        </div>
      </div>

      {/* Score */}
      <div className="score-section">
        <div className="score-circle">
          <span>{score}%</span>
        </div>

        <div className="readiness-status">
          <strong>{status}</strong>
          <span>Career Readiness</span>
        </div>
      </div>

      {/* Tips */}
      <div className="tips">
        {readiness?.improvements?.length > 0 ? (
          readiness.improvements.map((item, index) => (
            <p key={index}>📌 {item}</p>
          ))
        ) : (
          <p>📌 Keep improving your technical skills.</p>
        )}

        <p>📚 Current Phase: {dashboard?.currentPhase || "Getting Started"}</p>

        <p>🔥 Study Streak: {dashboard?.studyStreak || 0} Days</p>

        <p>📈 Overall Progress: {dashboard?.overallCompletion || 0}%</p>
      </div>
    </div>
  );
}

export default ReadinessCard;
