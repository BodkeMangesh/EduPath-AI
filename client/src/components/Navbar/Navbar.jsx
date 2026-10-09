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

function Navbar({ sidebarOpen, onSidebarToggle, onSidebarClose }) {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationOpen, setNotificationOpen] = useState(false);

  /* =====================================================
     LOAD NOTIFICATIONS
  ===================================================== */

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

  useEffect(() => {
    loadNotifications();
  }, []);

  /* =====================================================
     NOTIFICATION
  ===================================================== */

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

  /* =====================================================
     NAVIGATION CONTROLS
  ===================================================== */

  const closeNotifications = () => {
    setNotificationOpen(false);
  };

  const handleSidebarToggle = () => {
    setNotificationOpen(false);
    onSidebarToggle();
  };

  const handleNavigation = () => {
    closeNotifications();
    onSidebarClose();
  };

  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout = () => {
    logout();

    onSidebarClose();
    setNotificationOpen(false);

    toast.success("Logged out successfully.");

    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* =================================================
            LOGO
        ================================================= */}

        <NavLink
          to="/dashboard"
          className="navbar-logo"
          onClick={handleNavigation}
          aria-label="EduPath AI Dashboard"
        >
          <span className="logo-icon" aria-hidden="true">
            🎓
          </span>

          <div className="logo-text">
            <span className="logo-title">EduPath AI</span>

            <span className="logo-subtitle">
              Personalized Learning Platform
            </span>
          </div>
        </NavLink>

        {/* =================================================
            DESKTOP NAVIGATION
        ================================================= */}

        <nav className="navbar-links" aria-label="Primary navigation">
          <NavLink
            to="/dashboard"
            className="navbar-link"
            onClick={handleNavigation}
          >
            <span className="navbar-link-icon" aria-hidden="true">
              🏠
            </span>

            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/roadmap"
            className="navbar-link"
            onClick={handleNavigation}
          >
            <span className="navbar-link-icon" aria-hidden="true">
              🗺️
            </span>

            <span>Roadmap</span>
          </NavLink>

          <NavLink
            to="/learning"
            className="navbar-link"
            onClick={handleNavigation}
          >
            <span className="navbar-link-icon" aria-hidden="true">
              📚
            </span>

            <span>Learning</span>
          </NavLink>

          <NavLink
            to="/resources"
            className="navbar-link"
            onClick={handleNavigation}
          >
            <span className="navbar-link-icon" aria-hidden="true">
              📁
            </span>

            <span>Resources</span>
          </NavLink>

          <NavLink
            to="/progress"
            className="navbar-link"
            onClick={handleNavigation}
          >
            <span className="navbar-link-icon" aria-hidden="true">
              📈
            </span>

            <span>Progress</span>
          </NavLink>
        </nav>

        {/* =================================================
            RIGHT ACTIONS
        ================================================= */}

        <div className="navbar-actions">
          {/* -------------------------------------------------
              Notification
          ------------------------------------------------- */}

          <div className="notification-wrapper">
            <button
              type="button"
              className={`notification-btn ${notificationOpen ? "active" : ""}`}
              onClick={() => {
                setNotificationOpen((prev) => !prev);
                onSidebarClose();
              }}
              aria-label="Notifications"
              aria-expanded={notificationOpen}
              aria-haspopup="true"
            >
              <span className="notification-icon" aria-hidden="true">
                🔔
              </span>

              {unreadCount > 0 && (
                <span className="notification-badge">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* -------------------------------------------------
                Notification Dropdown
            ------------------------------------------------- */}

            {notificationOpen && (
              <div className="notification-dropdown">
                <div className="notification-header">
                  <div>
                    <strong>Notifications</strong>

                    {unreadCount > 0 && (
                      <span className="notification-count-label">
                        {unreadCount} unread
                      </span>
                    )}
                  </div>

                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllAsRead}
                      className="mark-all-btn"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="notification-list">
                  {notifications.length === 0 ? (
                    <div className="no-notifications">
                      <span
                        className="no-notifications-icon"
                        aria-hidden="true"
                      >
                        🔔
                      </span>

                      <p>No notifications yet.</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <button
                        type="button"
                        key={notification._id}
                        className={`notification-item ${
                          !notification.isRead ? "unread" : ""
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="notification-item-content">
                          <h4>{notification.title}</h4>

                          <p>{notification.message}</p>

                          <small>
                            {new Date(notification.createdAt).toLocaleString()}
                          </small>
                        </div>

                        {!notification.isRead && (
                          <span
                            className="notification-unread-dot"
                            aria-label="Unread"
                          />
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* -------------------------------------------------
              Desktop Logout
          ------------------------------------------------- */}

          <button
            type="button"
            className="navbar-logout"
            onClick={handleLogout}
          >
            <span aria-hidden="true">↪</span>
            <span>Logout</span>
          </button>

          {/* -------------------------------------------------
              Mobile Sidebar Toggle
          ------------------------------------------------- */}

          <button
            type="button"
            className={`navbar-menu-button ${sidebarOpen ? "active" : ""}`}
            onClick={handleSidebarToggle}
            aria-label="Toggle sidebar"
            aria-expanded={sidebarOpen}
            aria-controls="app-sidebar"
          >
            <span aria-hidden="true">{sidebarOpen ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
