import "./CompletedTopics.css";

function CompletedTopics({ topics = [] }) {
  return (
    <section className="completed-card">
      {/* Header */}
      <div className="completed-header">
        <div className="completed-title">
          <span className="completed-title-icon">✅</span>

          <div>
            <h2>Completed Topics</h2>
            <p>Your learning achievements so far</p>
          </div>
        </div>

        <span className="topic-count">
          {topics.length} {topics.length === 1 ? "Topic" : "Topics"}
        </span>
      </div>

      {/* Content */}
      {topics.length === 0 ? (
        <div className="completed-empty-state">
          <div className="empty-icon">📚</div>

          <h3>No Topics Completed Yet</h3>

          <p>
            Complete topics from your learning path and your achievements will
            appear here.
          </p>
        </div>
      ) : (
        <div className="completed-topics-list">
          {topics.map((topic, index) => (
            <div className="completed-topic-item" key={`${topic}-${index}`}>
              {/* Number */}
              <div className="topic-number">{index + 1}</div>

              {/* Status */}
              <div className="completed-status-icon">✓</div>

              {/* Topic */}
              <div className="completed-topic-content">
                <h4>{topic}</h4>

                <span>Completed successfully</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default CompletedTopics;
