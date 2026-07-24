import "./ReadinessCard.css";

function ReadinessCard() {
  return (
    <div className="readiness-card">
      <h3>🎯 Career Readiness</h3>

      <div className="score-circle">
        <span>72%</span>
      </div>

      <p className="status">You are on track to become job-ready.</p>

      <div className="tips">
        <p>✔ Complete React Projects</p>
        <p>✔ Practice DSA Daily</p>
        <p>✔ Improve Interview Skills</p>
      </div>
    </div>
  );
}

export default ReadinessCard;
