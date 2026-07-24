import "./DailyPlanCard.css";

function DailyPlanCard() {
  return (
    <div className="daily-plan-card">
      <h3>📅 Today's Learning Plan</h3>

      <ul className="plan-list">
        <li>📖 Learn React Context API</li>
        <li>💻 Complete React Router Practice</li>
        <li>🧠 Solve 3 DSA Problems</li>
        <li>🎥 Watch 1 MERN Lecture</li>
      </ul>

      <button className="plan-btn">Mark Today's Plan Complete</button>
    </div>
  );
}

export default DailyPlanCard;
