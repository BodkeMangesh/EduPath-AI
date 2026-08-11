import { NavLink, useNavigate } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("careerId");
    localStorage.removeItem("careerName");

    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <ul className="sidebar-menu">
        {/* Dashboard */}
        <li>
          <NavLink to="/dashboard" className="sidebar-link">
            <span>🏠</span>
            <span>Dashboard</span>
          </NavLink>
        </li>

        {/* Learning Path */}
        <li>
          <NavLink to="/learning" className="sidebar-link">
            <span>📚</span>
            <span>Learning Path</span>
          </NavLink>
        </li>

        {/* Skill Assessment */}
        <li>
          <NavLink to="/skill-assessment" className="sidebar-link">
            <span>📝</span>
            <span>Assessment</span>
          </NavLink>
        </li>

        {/* AI Mentor */}
        <li>
          <NavLink to="/chat" className="sidebar-link">
            <span>🤖</span>
            <span>AI Mentor</span>
          </NavLink>
        </li>

        {/* Progress */}
        <li>
          <NavLink to="/progress" className="sidebar-link">
            <span>📈</span>
            <span>Progress</span>
          </NavLink>
        </li>

        {/* Profile */}
        <li>
          <NavLink to="/profile" className="sidebar-link">
            <span>👤</span>
            <span>Profile</span>
          </NavLink>
        </li>

        {/* Career Discovery */}
        <li>
          <NavLink to="/career-discovery" className="sidebar-link">
            <span>💼</span>
            <span>Career Discovery</span>
          </NavLink>
        </li>

        {/* Settings */}
        <li>
          <NavLink to="/settings" className="sidebar-link">
            <span>⚙️</span>
            <span>Settings</span>
          </NavLink>
        </li>

        {/* Logout */}
        <li className="logout-item">
          <button className="sidebar-logout" onClick={handleLogout}>
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </li>
      </ul>
    </aside>
  );
}

export default Sidebar;
