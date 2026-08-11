import { useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();

  const username = localStorage.getItem("userName") || "Student";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("careerId");
    localStorage.removeItem("careerName");
    localStorage.removeItem("userName");

    navigate("/login");
  };

  return (
    <nav className="navbar">
      {/* Logo */}
      <div className="navbar-brand">
        <span className="navbar-logo">🎓</span>

        <span className="navbar-title">EduPath AI</span>
      </div>

      {/* Right Side */}
      <div className="navbar-right">
        <button
          className="notification-btn"
          onClick={() => alert("No new notifications")}
          title="Notifications"
        >
          🔔
        </button>

        <button className="profile-btn" onClick={() => navigate("/profile")}>
          <span className="profile-avatar">👤</span>

          <span className="username">{username}</span>
        </button>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
