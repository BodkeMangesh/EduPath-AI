import { useState } from "react";
import toast from "react-hot-toast";

import "./Settings.css";

function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleSaveSettings = () => {
    localStorage.setItem(
      "settings",
      JSON.stringify({
        notifications,
        emailUpdates,
        darkMode,
      }),
    );

    toast.success("Settings saved successfully.");
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <span className="settings-label">⚙️ Settings</span>

        <h1>Account Settings</h1>

        <p>Manage your EduPath AI preferences and learning experience.</p>
      </div>

      <div className="settings-container">
        {/* Notifications */}
        <section className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon">🔔</div>

            <div>
              <h2>Notifications</h2>
              <p>Control how EduPath AI notifies you.</p>
            </div>
          </div>

          <div className="setting-row">
            <div>
              <h3>Learning Notifications</h3>
              <p>Receive reminders about your daily learning plan.</p>
            </div>

            <label className="switch">
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
              />

              <span className="slider"></span>
            </label>
          </div>

          <div className="setting-row">
            <div>
              <h3>Email Updates</h3>
              <p>Receive important updates about your learning journey.</p>
            </div>

            <label className="switch">
              <input
                type="checkbox"
                checked={emailUpdates}
                onChange={(e) => setEmailUpdates(e.target.checked)}
              />

              <span className="slider"></span>
            </label>
          </div>
        </section>

        {/* Appearance */}
        <section className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon">🎨</div>

            <div>
              <h2>Appearance</h2>
              <p>Customize how EduPath AI looks.</p>
            </div>
          </div>

          <div className="setting-row">
            <div>
              <h3>Dark Mode</h3>
              <p>Use a darker interface for comfortable viewing.</p>
            </div>

            <label className="switch">
              <input
                type="checkbox"
                checked={darkMode}
                onChange={(e) => setDarkMode(e.target.checked)}
              />

              <span className="slider"></span>
            </label>
          </div>
        </section>

        {/* Learning Preferences */}
        <section className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon">📚</div>

            <div>
              <h2>Learning Preferences</h2>
              <p>Manage your learning experience.</p>
            </div>
          </div>

          <div className="setting-row">
            <div>
              <h3>Daily Study Hours</h3>
              <p>Your preferred daily learning duration.</p>
            </div>

            <select className="settings-select">
              <option value="1">1 Hour</option>
              <option value="2">2 Hours</option>
              <option value="3">3 Hours</option>
              <option value="4">4 Hours</option>
              <option value="5">5+ Hours</option>
            </select>
          </div>

          <div className="setting-row">
            <div>
              <h3>Learning Style</h3>
              <p>Choose your preferred learning approach.</p>
            </div>

            <select className="settings-select">
              <option>Practical</option>
              <option>Visual</option>
              <option>Theoretical</option>
              <option>Mixed</option>
            </select>
          </div>
        </section>

        <div className="settings-actions">
          <button className="save-settings-btn" onClick={handleSaveSettings}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
