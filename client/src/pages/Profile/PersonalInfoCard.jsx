import "./PersonalInfoCard.css";

function PersonalInfoCard({ profile }) {
  return (
    <div className="profile-card">
      <h2>👤 Personal Information</h2>

      <div className="info-grid">
        <div className="info-item">
          <label>Full Name</label>
          <p>{profile?.fullName || "Not Available"}</p>
        </div>

        <div className="info-item">
          <label>Email</label>
          <p>{profile?.email || "Not Available"}</p>
        </div>

        <div className="info-item">
          <label>Phone</label>
          <p>{profile?.phone || "Not Added"}</p>
        </div>

        <div className="info-item">
          <label>Role</label>
          <p>{profile?.role}</p>
        </div>

        <div className="info-item">
          <label>Account Status</label>
          <p>{profile?.accountStatus}</p>
        </div>

        <div className="info-item">
          <label>Bio</label>
          <p>{profile?.bio || "No bio added yet."}</p>
        </div>
      </div>
    </div>
  );
}

export default PersonalInfoCard;
