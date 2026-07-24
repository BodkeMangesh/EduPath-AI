import "./WelcomeCard.css";

function WelcomeCard({ dashboard }) {
  return (
    <div className="welcome-card">
      <h2>👋 Welcome Back, {dashboard?.user?.fullName}</h2>

      <p>Current Phase : {dashboard?.currentPhase}</p>

      <div className="career-badge">Current Career {dashboard?.career}</div>
    </div>
  );
}

export default WelcomeCard;
