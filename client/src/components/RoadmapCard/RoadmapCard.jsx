import "./RoadmapCard.css";

function RoadmapCard({ phase }) {
  if (!phase) {
    return null;
  }

  const topics = Array.isArray(phase.topics) ? phase.topics : [];

  const completedTopics = Array.isArray(phase.completedTopics)
    ? phase.completedTopics
    : [];

  const pendingTopics = Array.isArray(phase.pendingTopics)
    ? phase.pendingTopics
    : [];

  const completion = Number(phase.completion) || 0;

  return (
    <article className="roadmap-card">
      {/* Phase Header */}
      <div className="roadmap-card-header">
        <div className="phase-number">
          <span>Phase</span>
          <strong>{phase.phase}</strong>
        </div>

        <div className="phase-info">
          <h3>{phase.title}</h3>

          <p>Duration: {phase.duration}</p>
        </div>

        <div className="phase-completion">
          <strong>{completion}%</strong>
          <span>Complete</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="phase-progress">
        <div className="phase-progress-track">
          <div
            className="phase-progress-fill"
            style={{
              width: `${completion}%`,
            }}
          />
        </div>
      </div>

      {/* Topics */}
      <div className="roadmap-topics">
        <div className="topics-header">
          <h4>Topics</h4>

          <span>
            {completedTopics.length} / {topics.length} completed
          </span>
        </div>

        <div className="topics-list">
          {topics.map((topic) => {
            const isCompleted = completedTopics.includes(topic);

            const isPending = pendingTopics.includes(topic);

            return (
              <div
                key={topic}
                className={`roadmap-topic ${
                  isCompleted
                    ? "topic-completed"
                    : isPending
                      ? "topic-pending"
                      : ""
                }`}
              >
                <span className="topic-status">{isCompleted ? "✓" : "○"}</span>

                <span className="topic-name">{topic}</span>

                {isCompleted && <span className="topic-label">Completed</span>}

                {!isCompleted && isPending && (
                  <span className="topic-label pending">Pending</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </article>
  );
}

export default RoadmapCard;
