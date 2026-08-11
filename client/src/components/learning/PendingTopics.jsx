import "./PendingTopics.css";

function PendingTopics({ topics = [], onComplete }) {
  return (
    <div className="pending-card">
      <div className="card-header">
        <h2>⏳ Pending Topics</h2>

        <span className="topic-count pending-count">
          {topics.length} Remaining
        </span>
      </div>

      {topics.length === 0 ? (
        <div className="empty-state">
          <h3>🎉 Learning Path Completed</h3>

          <p>
            Congratulations! You have completed every topic in your roadmap.
          </p>
        </div>
      ) : (
        <div className="topics-list">
          {topics.map((topic, index) => (
            <div className="topic-item pending" key={index}>
              <div className="topic-icon pending-icon">📖</div>

              <div className="topic-content">
                <h4>{topic}</h4>

                <small>Next Learning Topic</small>
              </div>

              <button
                className="complete-btn"
                onClick={() => onComplete(topic)}
              >
                Complete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PendingTopics;
