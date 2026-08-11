import "./ProgressCard.css";

function ProgressCard({ profile }) {
  const progress = profile?.progress;

  return (
    <div className="profile-card">
      <h2>📊 Progress Summary</h2>

      <div className="progress-item">
        <label>Overall Progress</label>
        <progress value={progress?.overallProgress || 0} max="100"></progress>
        <span>{progress?.overallProgress || 0}%</span>
      </div>

      <div className="progress-item">
        <label>Career Readiness</label>
        <progress value={progress?.careerReadiness || 0} max="100"></progress>
        <span>{progress?.careerReadiness || 0}%</span>
      </div>

      <div className="progress-item">
        <label>Portfolio Score</label>
        <progress value={progress?.portfolioScore || 0} max="100"></progress>
        <span>{progress?.portfolioScore || 0}%</span>
      </div>

      <div className="info-grid" style={{ marginTop: "25px" }}>
        <div className="info-item">
          <label>Completed Roadmaps</label>
          <p>{progress?.completedRoadmaps || 0}</p>
        </div>

        <div className="info-item">
          <label>Completed Assessments</label>
          <p>{progress?.completedAssessments || 0}</p>
        </div>
      </div>
    </div>
  );
}

export default ProgressCard;
