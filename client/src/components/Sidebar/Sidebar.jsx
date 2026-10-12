import { useContext, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { AuthContext } from "../../context/AuthContext";
import "./Sidebar.css";
import "./LogoutModal.css";

function Sidebar({ sidebarOpen, onSidebarClose }) {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: "🏠" },
    { path: "/profile", label: "Profile", icon: "👤" },
    { path: "/resume-analyzer", label: "Resume", icon: "📄" },
    { path: "/roadmap", label: "Roadmap", icon: "🗺️" },
    { path: "/learning", label: "Learning", icon: "📚" },
    { path: "/placement", label: "Placement", icon: "🎯" },
    { path: "/progress", label: "Progress", icon: "📊" },
    { path: "/resources", label: "Resources", icon: "📖" },
    { path: "/settings", label: "Settings", icon: "⚙️" },
  ];

  const handleLogout = () => {
    setLogoutConfirmOpen(true);
  };

  const cancelLogout = () => {
    if (isLoggingOut) return;
    setLogoutConfirmOpen(false);
  };

  const confirmLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      await logout();

      setLogoutConfirmOpen(false);
      onSidebarClose();
      toast.success("Logged out successfully.");
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={onSidebarClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        id="app-sidebar"
        className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}
        aria-label="Main sidebar navigation"
      >
        {/* Navigation */}
        <nav className="sidebar-nav">
          <p className="sidebar-section-title">MAIN MENU</p>

          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/dashboard"}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
              onClick={onSidebarClose}
            >
              <span className="sidebar-link-icon" aria-hidden="true">
                {item.icon}
              </span>

              <span className="sidebar-link-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-footer-card">
            <span className="sidebar-footer-icon" aria-hidden="true">
              🚀
            </span>

            <div>
              <strong>Keep Learning</strong>
              <p>Build your career with EduPath AI.</p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            type="button"
            className="sidebar-logout-btn"
            onClick={handleLogout}
          >
            <span aria-hidden="true">↪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      {logoutConfirmOpen && (
        <div className="logout-modal-overlay" onClick={cancelLogout}>
          <div
            className="logout-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-modal-title"
            aria-describedby="logout-modal-description"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="logout-modal-icon" aria-hidden="true">
              ↪
            </div>

            <h2 id="logout-modal-title">Confirm Logout</h2>

            <p id="logout-modal-description">
              Are you sure you want to log out of your EduPath AI account?
            </p>

            <div className="logout-modal-actions">
              <button
                type="button"
                className="logout-cancel-btn"
                onClick={cancelLogout}
                disabled={isLoggingOut}
              >
                Cancel
              </button>

              <button
                type="button"
                className="logout-confirm-btn"
                onClick={confirmLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? "Logging out..." : "Yes, Logout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;
