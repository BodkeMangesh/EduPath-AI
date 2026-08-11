import "./ProgressCard.css";

function ProgressCard({ progress }) {
  if (!progress) return null;

  return (
    <div className="progress-cards">

      <div className="progress-card">
        <div className="card-icon">📈</div>

        <div className="card-content">
          <h3>Overall Completion</h3>
          <h2>{progress.overallCompletion}%</h2>
        </div>
      </div>

      <div className="progress-card">
        <div className="card-icon">🔥</div>

        <div className="card-content">
          <h3>Study Streak</h3>
          <h2>{progress.currentStreak} Days</h2>
        </div>
      </div>

      <div className="progress-card">
        <div className="card-icon">⏱️</div>

        <div className="card-content">
          <h3>Study Hours</h3>
          <h2>{progress.totalStudyHours} hrs</h2>
        </div>
      </div>

      <div className="progress-card">
        <div className="card-icon">📂</div>

        <div className="card-content">
          <h3>Projects</h3>
          <h2>{progress.completedProjects.length}</h2>
        </div>
      </div>

    </div>
  );
}

export default ProgressCard;