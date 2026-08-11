import "./CompletedTopics.css";

function CompletedTopics({ topics = [] }) {
  return (
    <div className="completed-card">
      <div className="card-header">
        <h2>✅ Completed Topics</h2>

        <span className="topic-count">{topics.length} Completed</span>
      </div>

      {topics.length === 0 ? (
        <div className="empty-state">
          <h3>No Topics Completed Yet</h3>
          <p>Start learning to see your completed topics here.</p>
        </div>
      ) : (
        <div className="topics-list">
          {topics.map((topic, index) => (
            <div className="topic-item completed" key={index}>
              <div className="topic-icon">✔</div>

              <div className="topic-content">
                <h4>{topic}</h4>
                <small>Completed Successfully</small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CompletedTopics;
