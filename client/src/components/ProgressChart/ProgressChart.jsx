import "./ProgressChart.css";

function ProgressChart({ progress }) {
  if (!progress) return null;

  const completed = progress.completedTopics.length;
  const pending = progress.pendingTopics.length;
  const total = completed + pending;

  const completedPercentage =
    total === 0 ? 0 : Math.round((completed / total) * 100);

  const pendingPercentage =
    total === 0 ? 0 : Math.round((pending / total) * 100);

  return (
    <div className="progress-chart">
      <h2>📊 Learning Analytics</h2>

      <div className="chart-item">
        <div className="chart-header">
          <span>Overall Completion</span>
          <span>{progress.overallCompletion}%</span>
        </div>

        <div className="chart-bar">
          <div
            className="chart-fill blue"
            style={{ width: `${progress.overallCompletion}%` }}
          />
        </div>
      </div>

      <div className="chart-item">
        <div className="chart-header">
          <span>Completed Topics</span>
          <span>{completedPercentage}%</span>
        </div>

        <div className="chart-bar">
          <div
            className="chart-fill green"
            style={{ width: `${completedPercentage}%` }}
          />
        </div>
      </div>

      <div className="chart-item">
        <div className="chart-header">
          <span>Pending Topics</span>
          <span>{pendingPercentage}%</span>
        </div>

        <div className="chart-bar">
          <div
            className="chart-fill orange"
            style={{ width: `${pendingPercentage}%` }}
          />
        </div>
      </div>

      <div className="progress-info">
        <div className="info-box">
          <h3>{completed}</h3>
          <p>Completed Topics</p>
        </div>

        <div className="info-box">
          <h3>{pending}</h3>
          <p>Pending Topics</p>
        </div>

        <div className="info-box">
          <h3>{progress.currentPhase}</h3>
          <p>Current Phase</p>
        </div>

        <div className="info-box">
          <h3>{progress.currentStreak}</h3>
          <p>Day Streak 🔥</p>
        </div>
      </div>
    </div>
  );
}

export default ProgressChart;
