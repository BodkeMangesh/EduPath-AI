import "./ProfileHeader.css";
import { useNavigate } from "react-router-dom";

function ProfileHeader({ profile }) {
  const navigate = useNavigate();

  return (
    <div className="profile-header">
      <div className="profile-avatar">
        {profile?.profileImage ? (
          <img src={profile.profileImage} alt="Profile" />
        ) : (
          <div className="avatar-placeholder">
            {profile?.fullName?.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <div className="profile-details">
        <h1>{profile?.fullName}</h1>

        <p>{profile?.email}</p>

        <span className="role-badge">{profile?.role?.toUpperCase()}</span>

        <button
          className="edit-profile-btn"
          onClick={() => navigate("/profile/edit")}
        >
          ✏ Edit Profile
        </button>
      </div>
    </div>
  );
}

export default ProfileHeader;
