import "./AIProfileCard.css";

function AIProfileCard({ profile }) {
  const aiProfile = profile?.aiProfile;

  return (
    <div className="profile-card">
      <h2>🤖 AI Learning Profile</h2>

      <div className="info-grid">
        <div className="info-item">
          <label>Career Goal</label>
          <p>{aiProfile?.careerGoal || "Not Added"}</p>
        </div>

        <div className="info-item">
          <label>Preferred Language</label>
          <p>{aiProfile?.preferredLanguage}</p>
        </div>

        <div className="info-item">
          <label>Daily Study Hours</label>
          <p>{aiProfile?.dailyStudyHours} Hours</p>
        </div>

        <div className="info-item">
          <label>Interests</label>

          <p>
            {aiProfile?.interests?.length
              ? aiProfile.interests.join(", ")
              : "No Interests Added"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default AIProfileCard;
