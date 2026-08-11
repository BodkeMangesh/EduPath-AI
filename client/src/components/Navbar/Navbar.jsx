import { useContext, useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { AuthContext } from "../../context/AuthContext";

import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../../services/NotificationService";

import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const [menuOpen, setMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const loadNotifications = async () => {
    try {
      const response = await getNotifications();

      setNotifications(response.data.data || []);

      const countResponse = await getUnreadNotificationCount();

      setUnreadCount(countResponse.data.data?.count || 0);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.isRead) {
        await markNotificationAsRead(notification._id);

        setNotifications((prev) =>
          prev.map((item) =>
            item._id === notification._id ? { ...item, isRead: true } : item,
          ),
        );

        setUnreadCount((prev) => Math.max(prev - 1, 0));
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          isRead: true,
        })),
      );

      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleLogout = () => {
    logout();

    setMenuOpen(false);

    toast.success("Logged out successfully.");

    navigate("/login");
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <NavLink to="/dashboard" className="navbar-logo" onClick={closeMenu}>
          <span className="logo-icon">🎓</span>
          <span>EduPath AI</span>
        </NavLink>

        {/* Desktop Navigation */}
        <nav className="navbar-links">
          <NavLink to="/dashboard" className="navbar-link">
            Dashboard
          </NavLink>

          <NavLink to="/career-discovery" className="navbar-link">
            Career Discovery
          </NavLink>

          <NavLink to="/skill-assessment" className="navbar-link">
            Skill Assessment
          </NavLink>

          <NavLink to="/learning" className="navbar-link">
            Learning
          </NavLink>

          <NavLink to="/progress" className="navbar-link">
            Progress
          </NavLink>
        </nav>

        <NavLink to="/roadmap" className="navbar-link">
          Roadmap
        </NavLink>

        <NavLink to="/resources" className="navbar-link">
          Resources
        </NavLink>

        {/* Notifications */}
        <div className="notification-wrapper">
          <button
            className="notification-btn"
            onClick={() => setNotificationOpen(!notificationOpen)}
          >
            🔔
            {unreadCount > 0 && (
              <span className="notification-badge">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {notificationOpen && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <strong>Notifications</strong>

                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="mark-all-btn"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="notification-list">
                {notifications.length === 0 ? (
                  <p className="no-notifications">No notifications yet.</p>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`notification-item ${
                        !notification.isRead ? "unread" : ""
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <h4>{notification.title}</h4>

                      <p>{notification.message}</p>

                      <small>
                        {new Date(notification.createdAt).toLocaleString()}
                      </small>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Desktop Logout */}
        <button className="navbar-logout" onClick={handleLogout}>
          Logout
        </button>

        {/* Mobile Menu Button */}
        <button
          className="navbar-menu-button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Navigation */}
      {menuOpen && (
        <nav className="mobile-navbar">
          <NavLink
            to="/dashboard"
            className="mobile-navbar-link"
            onClick={closeMenu}
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/career-discovery"
            className="mobile-navbar-link"
            onClick={closeMenu}
          >
            Career Discovery
          </NavLink>

          <NavLink
            to="/skill-assessment"
            className="mobile-navbar-link"
            onClick={closeMenu}
          >
            Skill Assessment
          </NavLink>

          <NavLink
            to="/learning"
            className="mobile-navbar-link"
            onClick={closeMenu}
          >
            Learning
          </NavLink>

          <NavLink
            to="/progress"
            className="mobile-navbar-link"
            onClick={closeMenu}
          >
            Progress
          </NavLink>

          <button className="mobile-logout" onClick={handleLogout}>
            Logout
          </button>
        </nav>
      )}
    </header>
  );
}

export default Navbar;
