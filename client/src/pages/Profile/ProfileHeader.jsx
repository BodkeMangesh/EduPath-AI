import "./ProfileHeader.css";
import { useNavigate } from "react-router-dom";

function ProfileHeader({ profile }) {
  const navigate = useNavigate();

  const fullName = profile?.fullName || "Your Name";
  const email = profile?.email || "No email available";
  const role = profile?.role || "Student";

  return (
    <section className="profile-header">
      <div className="profile-header-main">
        <div className="profile-avatar">
          {profile?.profileImage ? (
            <img src={profile.profileImage} alt={`${fullName}'s profile`} />
          ) : (
            <div className="avatar-placeholder">
              {fullName.charAt(0).toUpperCase()}
            </div>
          )}

          <span className="profile-status-dot" title="Profile" />
        </div>

        <div className="profile-details">
          <span className="profile-eyebrow">MY PROFILE</span>

          <h1>{fullName}</h1>

          <p className="profile-email">{email}</p>

          <div className="profile-meta">
            <span className="role-badge">
              <span className="role-badge-dot" />
              {role.replaceAll("_", " ").toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      <div className="profile-header-actions">
        <button
          type="button"
          className="edit-profile-btn"
          onClick={() => navigate("/profile/edit")}
        >
          <span aria-hidden="true">✎</span>
          Edit Profile
        </button>
      </div>
    </section>
  );
}

export default ProfileHeader;
