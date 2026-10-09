import { NavLink } from "react-router-dom";
import "./Sidebar.css";

function Sidebar({ sidebarOpen, onSidebarClose }) {
  const navItems = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: "🏠",
    },
    {
      path: "/profile",
      label: "Profile",
      icon: "👤",
    },
    {
      path: "/resume-analyzer",
      label: "Resume",
      icon: "📄",
    },
    {
      path: "/roadmap",
      label: "Roadmap",
      icon: "🗺️",
    },
    {
      path: "/learning",
      label: "Learning",
      icon: "📚",
    },
    {
      path: "/placement",
      label: "Placement",
      icon: "🎯",
    },
    {
      path: "/progress",
      label: "Progress",
      icon: "📊",
    },
    {
      path: "/resources",
      label: "Resources",
      icon: "📖",
    },
    {
      path: "/settings",
      label: "Settings",
      icon: "⚙️",
    },
  ];

  return (
    <>
      {/* =====================================================
          Mobile Overlay
      ===================================================== */}

      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={onSidebarClose}
          aria-hidden="true"
        />
      )}

      {/* =====================================================
          Sidebar
      ===================================================== */}

      <aside
        id="app-sidebar"
        className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}
        aria-label="Main sidebar navigation"
      >
        {/* =================================================
            Navigation
        ================================================= */}

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

        {/* =================================================
            Sidebar Footer
        ================================================= */}

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
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
