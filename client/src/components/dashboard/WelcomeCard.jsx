import "./WelcomeCard.css";

function WelcomeCard({ dashboard }) {
  return (
    <section className="welcome-card">
      <div className="welcome-content">
        <span className="welcome-label">👋 Welcome Back</span>

        <h1>{dashboard?.user?.fullName || "Learner"}</h1>

        <p className="welcome-phase">
          Current Phase:{" "}
          <strong>{dashboard?.currentPhase || "Getting Started"}</strong>
        </p>

        <div className="career-badge">
          🎯 Target Career:{" "}
          <strong>{dashboard?.targetRole || "Career Path"}</strong>
        </div>
      </div>
    </section>
  );
}

export default WelcomeCard;
