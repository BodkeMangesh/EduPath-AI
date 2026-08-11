import "./PlacementCard.css";

function PlacementCard({ profile }) {
  const placement = profile?.placement;

  return (
    <div className="profile-card">
      <h2>🎯 Placement Information</h2>

      <div className="info-grid">
        <div className="info-item">
          <label>Target Role</label>
          <p>{placement?.targetRole || "Not Added"}</p>
        </div>

        <div className="info-item">
          <label>Dream Company</label>
          <p>{placement?.dreamCompany || "Not Added"}</p>
        </div>

        <div className="info-item">
          <label>DSA Level</label>
          <p>{placement?.dsaLevel || "Not Added"}</p>
        </div>

        <div className="info-item">
          <label>Interview Readiness</label>
          <p>{placement?.interviewReadiness}%</p>
        </div>
      </div>
    </div>
  );
}

export default PlacementCard;
