import "./ResourcesCard.css";

function ResourcesCard() {
  return (
    <div className="resources-card">
      <h3>📚 Recommended Resources</h3>

      <div className="resource-item">
        <h4>React Official Documentation</h4>
        <p>Complete guide to React fundamentals and advanced concepts.</p>
      </div>

      <div className="resource-item">
        <h4>JavaScript Interview Questions</h4>
        <p>Practice important interview questions with explanations.</p>
      </div>

      <div className="resource-item">
        <h4>LeetCode DSA Practice</h4>
        <p>Solve coding problems to improve your problem-solving skills.</p>
      </div>

      <button className="resource-btn">View All Resources</button>
    </div>
  );
}

export default ResourcesCard;
