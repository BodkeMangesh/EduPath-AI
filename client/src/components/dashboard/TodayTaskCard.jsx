import "./TodayTaskCard.css";

function TodayTaskCard() {
  return (
    <div className="today-task-card">
      <h3>📅 Today's Task</h3>

      <div className="task-box">
        <h4>React Router DOM</h4>

        <p>Learn nested routing, protected routes and dynamic routes.</p>

        <button>Start Learning</button>
      </div>
    </div>
  );
}

export default TodayTaskCard;
