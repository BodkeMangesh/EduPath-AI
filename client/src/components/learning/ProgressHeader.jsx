import "./ProgressHeader.css";

function ProgressHeader({ progress }) {
  if (!progress) return null;

  const completion = progress.overallCompletion ?? 0;
  const currentPhase = progress.currentPhase ?? 1;
  const nextMilestone = progress.nextMilestone || "Learning Path Started";

  return (
    <section className="progress-header">
      {/* =========================
          HEADER INTRO
      ========================= */}
      <div className="progress-header-top">
        <div className="progress-header-intro">
          <span className="progress-eyebrow">📚 Your Learning Journey</span>

          <h1>Learning Path</h1>

          <p>
            Continue your personalized journey and build your skills step by
            step.
          </p>
        </div>

        <div className="phase-badge">
          <span>Current Phase</span>
          <strong>Phase {currentPhase}</strong>
        </div>
      </div>

      {/* =========================
          PROGRESS OVERVIEW
      ========================= */}
      <div className="progress-overview">
        {/* Overall Progress */}
        <div className="progress-overview-card progress-main-card">
          <div className="progress-card-header">
            <div>
              <span className="progress-card-label">Overall Progress</span>

              <h2>{completion}%</h2>
            </div>

            <div className="progress-icon">📈</div>
          </div>

          <div className="progress-track">
            <div
              className="progress-track-fill"
              style={{
                width: `${Math.min(Math.max(completion, 0), 100)}%`,
              }}
            />
          </div>

          <p className="progress-card-message">
            {completion === 100
              ? "🎉 Your learning path is complete!"
              : completion > 0
                ? "Keep going — you're making steady progress."
                : "Start learning to begin your journey."}
          </p>
        </div>

        {/* Current Phase */}
        <div className="progress-overview-card">
          <span className="progress-card-label">Current Phase</span>

          <div className="phase-value">
            <span>🎯</span>
            <strong>Phase {currentPhase}</strong>
          </div>

          <p>Keep completing topics to unlock the next phase.</p>
        </div>

        {/* Next Milestone */}
        <div className="progress-overview-card milestone-card">
          <span className="progress-card-label">Next Milestone</span>

          <div className="milestone-value">
            <span>🚀</span>

            <strong>{nextMilestone}</strong>
          </div>

          <p>Complete this topic to move forward.</p>
        </div>
      </div>
    </section>
  );
}

export default ProgressHeader;
