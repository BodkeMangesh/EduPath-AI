import "./ProgressHeader.css";

function ProgressHeader({ progress }) {
  if (!progress) return null;

  return (
    <div className="progress-header">
      <div className="header-left">
        <h1>📚 Learning Path</h1>

        <p>Continue your journey and complete your roadmap step by step.</p>
      </div>

      <div className="header-right">
        <div className="header-card">
          <span>Overall Progress</span>

          <h2>{progress.overallCompletion}%</h2>
        </div>

        <div className="header-card">
          <span>Current Phase</span>

          <h2>Phase {progress.currentPhase}</h2>
        </div>

        <div className="header-card">
          <span>Next Milestone</span>

          <h3>{progress.nextMilestone}</h3>
        </div>
      </div>
    </div>
  );
}

export default ProgressHeader;
