import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  getSettings,
  updateSettings,
  resetSettings,
  changePassword,
} from "../../services/settingsService";

import "./Settings.css";

function Settings() {
  /* =========================================
     Password State
     ========================================= */

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordChanging, setPasswordChanging] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  /* =========================================
     Loading / Saving State
     ========================================= */

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  /* =========================================
     Notification Preferences
     ========================================= */

  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [streakReminders, setStreakReminders] = useState(true);
  const [placementAlerts, setPlacementAlerts] = useState(true);
  const [interviewReminders, setInterviewReminders] = useState(true);
  const [jobAlerts, setJobAlerts] = useState(true);

  /* =========================================
     Appearance
     ========================================= */

  const [darkMode, setDarkMode] = useState(false);

  /* =========================================
     Learning Preferences
     ========================================= */

  const [dailyStudyHours, setDailyStudyHours] = useState("2");
  const [learningStyle, setLearningStyle] = useState("Mixed");
  const [difficultyPreference, setDifficultyPreference] =
    useState("Intermediate");
  const [revisionReminders, setRevisionReminders] = useState(true);

  /* =========================================
     AI Mentor Preferences
     ========================================= */

  const [mentorLanguage, setMentorLanguage] = useState("English");
  const [mentorResponseStyle, setMentorResponseStyle] = useState("Simple");
  const [stepByStepGuidance, setStepByStepGuidance] = useState(true);

  /* =========================================
     Placement Preferences
     ========================================= */

  const [targetRole, setTargetRole] = useState("Software Developer");
  const [placementPreparation, setPlacementPreparation] = useState(true);

  /* =========================================
     Other Security State
     ========================================= */

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  /* =========================================
     Apply Dark Theme
     ========================================= */

  const applyDarkMode = (enabled) => {
    document.documentElement.classList.toggle("dark-theme", Boolean(enabled));
  };

  /* =========================================
     Apply Settings To State
     ========================================= */

  const applySettings = (settings = {}) => {
    // Notifications
    setNotifications(settings.notifications ?? true);
    setEmailUpdates(settings.emailUpdates ?? true);
    setStreakReminders(settings.streakReminders ?? true);
    setPlacementAlerts(settings.placementAlerts ?? true);
    setInterviewReminders(settings.interviewReminders ?? true);
    setJobAlerts(settings.jobAlerts ?? true);

    // Appearance
    const savedDarkMode = settings.darkMode ?? false;
    setDarkMode(savedDarkMode);
    applyDarkMode(savedDarkMode);

    // Learning
    setDailyStudyHours(String(settings.dailyStudyHours ?? 2));
    setLearningStyle(settings.learningStyle ?? "Mixed");
    setDifficultyPreference(settings.difficultyPreference ?? "Intermediate");
    setRevisionReminders(settings.revisionReminders ?? true);

    // AI Mentor
    setMentorLanguage(settings.mentorLanguage ?? "English");
    setMentorResponseStyle(settings.mentorResponseStyle ?? "Simple");
    setStepByStepGuidance(settings.stepByStepGuidance ?? true);

    // Placement
    setTargetRole(settings.targetRole ?? "Software Developer");
    setPlacementPreparation(settings.placementPreparation ?? true);
  };

  /* =========================================
     Load Settings From Backend
     ========================================= */

  useEffect(() => {
    let mounted = true;

    const loadSettings = async () => {
      try {
        setLoading(true);

        const response = await getSettings();
        const settings = response?.data?.data || response?.data || {};

        if (!mounted) return;

        applySettings(settings);

        localStorage.setItem("settings", JSON.stringify(settings));
      } catch (error) {
        console.error("Settings Load Error:", error);

        try {
          const cachedSettings = localStorage.getItem("settings");

          if (cachedSettings && mounted) {
            const parsedSettings = JSON.parse(cachedSettings);

            applySettings(parsedSettings);

            toast.error(
              "Could not load latest settings. Showing saved local settings.",
            );
          } else if (mounted) {
            toast.error("Unable to load settings.");
          }
        } catch (localError) {
          console.error("Local Settings Error:", localError);

          if (mounted) {
            toast.error("Unable to load settings.");
          }
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadSettings();

    return () => {
      mounted = false;
    };
  }, []);

  /* =========================================
     Dark Mode
     ========================================= */

  const handleDarkModeChange = (value) => {
    setDarkMode(value);
    applyDarkMode(value);
    localStorage.setItem("darkMode", String(value));
  };

  /* =========================================
     Build Settings Object
     ========================================= */

  const buildSettingsObject = () => ({
    notifications,
    emailUpdates,
    streakReminders,
    placementAlerts,
    interviewReminders,
    jobAlerts,
    darkMode,
    dailyStudyHours: Number(dailyStudyHours),
    learningStyle,
    difficultyPreference,
    revisionReminders,
    mentorLanguage,
    mentorResponseStyle,
    stepByStepGuidance,
    targetRole: targetRole.trim(),
    placementPreparation,
  });

  /* =========================================
     Save Settings
     ========================================= */

  const handleSaveSettings = async () => {
    if (saving || resetting) return;

    if (!targetRole.trim()) {
      toast.error("Target role cannot be empty.");
      return;
    }

    try {
      setSaving(true);

      const settings = buildSettingsObject();
      const response = await updateSettings(settings);

      const savedSettings = response?.data?.data || response?.data || settings;

      applySettings(savedSettings);

      localStorage.setItem("settings", JSON.stringify(savedSettings));
      localStorage.setItem("darkMode", String(savedSettings.darkMode ?? false));

      applyDarkMode(savedSettings.darkMode ?? false);

      toast.success("Settings saved successfully.");
    } catch (error) {
      console.error("Save Settings Error:", error);

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to save settings.",
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================
     Reset Settings
     ========================================= */

  const handleResetSettings = async () => {
    if (resetting || saving) return;

    const confirmed = window.confirm(
      "Are you sure you want to reset all settings to their default values?",
    );

    if (!confirmed) return;

    try {
      setResetting(true);

      const response = await resetSettings();

      const defaultSettings = response?.data?.data || response?.data || {};

      applySettings(defaultSettings);

      localStorage.setItem("settings", JSON.stringify(defaultSettings));

      localStorage.setItem(
        "darkMode",
        String(defaultSettings.darkMode ?? false),
      );

      toast.success("Settings reset to default successfully.");
    } catch (error) {
      console.error("Reset Settings Error:", error);

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to reset settings.",
      );
    } finally {
      setResetting(false);
    }
  };

  /* =========================================
     Password Form Helpers
     ========================================= */

  const resetPasswordForm = () => {
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleTogglePasswordSection = () => {
    if (passwordChanging) return;

    if (showPasswordSection) {
      resetPasswordForm();
      setShowPasswordSection(false);
      return;
    }

    setShowPasswordSection(true);
  };

  const handlePasswordFieldChange = (e) => {
    const { name, value } = e.target;

    setPasswordForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =========================================
     Change Password
     ========================================= */

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordChanging) return;

    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      toast.error("Choose a different password.");
      return;
    }

    try {
      setPasswordChanging(true);

      const response = await changePassword({
        currentPassword,
        newPassword,
      });

      toast.success(
        response?.data?.message || "Password changed successfully.",
      );

      resetPasswordForm();
      setShowPasswordSection(false);
    } catch (error) {
      console.error(
        "Change Password Error:",
        error?.response?.status || "Request failed",
      );

      toast.error(
        error?.response?.data?.message ||
          "Password change failed. Please try again.",
      );
    } finally {
      setPasswordChanging(false);
    }
  };

  /* =========================================
     Logout All Sessions
     ========================================= */

  const handleLogoutAllSessions = () => {
    toast("Logout from all sessions is not connected to the backend yet.", {
      icon: "🔐",
    });
  };

  /* =========================================
     Data Management
     ========================================= */

  const handleClearLearningData = () => {
    const confirmed = window.confirm(
      "Are you sure you want to clear your local learning preferences and session data?",
    );

    if (!confirmed) return;

    localStorage.removeItem("settings");

    toast.success("Local learning settings cleared.");

    const defaults = {
      notifications: true,
      emailUpdates: true,
      streakReminders: true,
      placementAlerts: true,
      interviewReminders: true,
      jobAlerts: true,
      darkMode: false,
      dailyStudyHours: 2,
      learningStyle: "Mixed",
      difficultyPreference: "Intermediate",
      revisionReminders: true,
      mentorLanguage: "English",
      mentorResponseStyle: "Simple",
      stepByStepGuidance: true,
      targetRole: "Software Developer",
      placementPreparation: true,
    };

    applySettings(defaults);
    localStorage.setItem("darkMode", "false");
  };

  /* =========================================
     Delete Account
     ========================================= */

  const handleDeleteAccount = () => {
    if (!showDeleteConfirmation) {
      setShowDeleteConfirmation(true);
      return;
    }

    toast("Account deletion is not connected to the backend yet.", {
      icon: "⚠️",
    });

    setShowDeleteConfirmation(false);
  };

  /* =========================================
     Loading Screen
     ========================================= */

  if (loading) {
    return (
      <div className="settings-page">
        <div className="settings-header">
          <span className="settings-label">⚙️ Settings</span>
          <h1>Account Settings</h1>
          <p>Loading your settings...</p>
        </div>

        <div className="settings-container">
          <section className="settings-card">
            <div className="settings-card-header">
              <div className="settings-icon">⚙️</div>

              <div>
                <h2>Loading Settings</h2>
                <p>Please wait while we load your preferences.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  /* =========================================
     UI
     ========================================= */

  return (
    <div className="settings-page">
      {/* Header */}

      <div className="settings-header">
        <span className="settings-label">⚙️ Settings</span>

        <h1>Account Settings</h1>

        <p>
          Manage your EduPath AI preferences and personalize your learning
          experience.
        </p>
      </div>

      <div className="settings-container">
        {/* Notifications */}

        <section className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon">🔔</div>

            <div>
              <h2>Notifications</h2>
              <p>Control how EduPath AI keeps you updated.</p>
            </div>
          </div>

          {[
            {
              title: "Learning Notifications",
              description:
                "Receive reminders about your daily learning plan and pending topics.",
              value: notifications,
              setter: setNotifications,
            },
            {
              title: "Email Updates",
              description:
                "Receive important updates about your learning journey.",
              value: emailUpdates,
              setter: setEmailUpdates,
            },
            {
              title: "Streak Reminders",
              description:
                "Get reminders when your learning streak needs attention.",
              value: streakReminders,
              setter: setStreakReminders,
            },
            {
              title: "Placement Alerts",
              description:
                "Receive notifications related to your placement preparation.",
              value: placementAlerts,
              setter: setPlacementAlerts,
            },
            {
              title: "Interview Reminders",
              description:
                "Get reminders for interview preparation and practice sessions.",
              value: interviewReminders,
              setter: setInterviewReminders,
            },
            {
              title: "Job Alerts",
              description:
                "Receive relevant job opportunity alerts based on your goals.",
              value: jobAlerts,
              setter: setJobAlerts,
            },
          ].map((item) => (
            <div className="setting-row" key={item.title}>
              <div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>

              <label className="switch">
                <input
                  type="checkbox"
                  checked={item.value}
                  onChange={(e) => item.setter(e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
          ))}
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
              <p>
                Use a darker interface for comfortable viewing in low-light
                environments.
              </p>
            </div>

            <label className="switch">
              <input
                type="checkbox"
                checked={darkMode}
                onChange={(e) => handleDarkModeChange(e.target.checked)}
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
              <p>Personalize your learning experience.</p>
            </div>
          </div>

          <div className="setting-row">
            <div>
              <h3>Daily Study Goal</h3>
              <p>Your preferred daily learning duration.</p>
            </div>

            <select
              className="settings-select"
              value={dailyStudyHours}
              onChange={(e) => setDailyStudyHours(e.target.value)}
            >
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

            <select
              className="settings-select"
              value={learningStyle}
              onChange={(e) => setLearningStyle(e.target.value)}
            >
              <option value="Practical">Practical</option>
              <option value="Visual">Visual</option>
              <option value="Theoretical">Theoretical</option>
              <option value="Mixed">Mixed</option>
            </select>
          </div>

          <div className="setting-row">
            <div>
              <h3>Difficulty Preference</h3>
              <p>Choose your preferred starting difficulty.</p>
            </div>

            <select
              className="settings-select"
              value={difficultyPreference}
              onChange={(e) => setDifficultyPreference(e.target.value)}
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div className="setting-row">
            <div>
              <h3>Revision Reminders</h3>
              <p>
                Get reminders when a topic needs revision based on your learning
                performance.
              </p>
            </div>

            <label className="switch">
              <input
                type="checkbox"
                checked={revisionReminders}
                onChange={(e) => setRevisionReminders(e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>
        </section>

        {/* AI Mentor Preferences */}

        <section className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon">🤖</div>

            <div>
              <h2>AI Mentor Preferences</h2>
              <p>Customize how your EduPath AI Mentor communicates.</p>
            </div>
          </div>

          <div className="setting-row">
            <div>
              <h3>Preferred Language</h3>
              <p>Choose the language used by your AI Mentor.</p>
            </div>

            <select
              className="settings-select"
              value={mentorLanguage}
              onChange={(e) => setMentorLanguage(e.target.value)}
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Marathi">Marathi</option>
            </select>
          </div>

          <div className="setting-row">
            <div>
              <h3>Response Style</h3>
              <p>Choose how detailed your AI Mentor responses should be.</p>
            </div>

            <select
              className="settings-select"
              value={mentorResponseStyle}
              onChange={(e) => setMentorResponseStyle(e.target.value)}
            >
              <option value="Simple">Simple</option>
              <option value="Balanced">Balanced</option>
              <option value="Detailed">Detailed</option>
            </select>
          </div>

          <div className="setting-row">
            <div>
              <h3>Step-by-Step Guidance</h3>
              <p>
                Ask your AI Mentor to explain tasks and solutions step by step.
              </p>
            </div>

            <label className="switch">
              <input
                type="checkbox"
                checked={stepByStepGuidance}
                onChange={(e) => setStepByStepGuidance(e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>
        </section>

        {/* Placement Preferences */}

        <section className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon">🎯</div>

            <div>
              <h2>Placement Preferences</h2>
              <p>Customize your placement preparation experience.</p>
            </div>
          </div>

          <div className="setting-row">
            <div>
              <h3>Target Role</h3>
              <p>Your preferred role for placement recommendations.</p>
            </div>

            <select
              className="settings-select"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
            >
              <option value="Software Developer">Software Developer</option>
              <option value="Software Engineer">Software Engineer</option>
              <option value="Web Developer">Web Developer</option>
              <option value="Frontend Developer">Frontend Developer</option>
              <option value="Backend Developer">Backend Developer</option>
              <option value="Full Stack Developer">Full Stack Developer</option>
              <option value="Data Analyst">Data Analyst</option>
            </select>
          </div>

          <div className="setting-row">
            <div>
              <h3>Placement Preparation</h3>
              <p>Allow EduPath AI to prioritize placement-focused learning.</p>
            </div>

            <label className="switch">
              <input
                type="checkbox"
                checked={placementPreparation}
                onChange={(e) => setPlacementPreparation(e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>
        </section>

        {/* Security */}

        <section className="settings-card security-card">
          <div className="settings-card-header">
            <div className="settings-icon">🔐</div>

            <div>
              <h2>Security</h2>
              <p>Manage your account security.</p>
            </div>
          </div>

          <div className="security-action">
            <div>
              <h3>Change Password</h3>
              <p>Update your account password securely.</p>
            </div>

            <button
              type="button"
              className="secondary-settings-btn"
              onClick={handleTogglePasswordSection}
              disabled={passwordChanging}
            >
              {showPasswordSection ? "Close" : "Change Password"}
            </button>
          </div>

          {showPasswordSection && (
            <form
              className="settings-password-form"
              onSubmit={handlePasswordChange}
              autoComplete="on"
            >
              <div className="password-field">
                <label htmlFor="currentPassword">Current Password</label>

                <input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  autoComplete="current-password"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordFieldChange}
                  required
                  disabled={passwordChanging}
                />
              </div>

              <div className="password-field">
                <label htmlFor="newPassword">New Password</label>

                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  value={passwordForm.newPassword}
                  onChange={handlePasswordFieldChange}
                  required
                  disabled={passwordChanging}
                />

                <small>Use at least 8 characters.</small>
              </div>

              <div className="password-field">
                <label htmlFor="confirmPassword">Confirm New Password</label>

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordFieldChange}
                  required
                  disabled={passwordChanging}
                />
              </div>

              <div className="password-form-actions">
                <button
                  type="button"
                  className="secondary-settings-btn"
                  onClick={handleTogglePasswordSection}
                  disabled={passwordChanging}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-settings-btn"
                  disabled={passwordChanging}
                >
                  {passwordChanging
                    ? "Updating Password..."
                    : "Update Password"}
                </button>
              </div>
            </form>
          )}

          <div className="security-action">
            <div>
              <h3>Logout from All Sessions</h3>
              <p>Sign out your account from all currently active devices.</p>
            </div>

            <button
              type="button"
              className="secondary-settings-btn"
              onClick={handleLogoutAllSessions}
            >
              Logout All
            </button>
          </div>
        </section>

        {/* Data Management */}

        <section className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon">🧹</div>

            <div>
              <h2>Data Management</h2>
              <p>Manage your learning-related data.</p>
            </div>
          </div>

          <div className="security-action">
            <div>
              <h3>Clear Learning Data</h3>
              <p>
                Clear locally stored learning preferences and session settings.
              </p>
            </div>

            <button
              type="button"
              className="secondary-settings-btn danger-outline-btn"
              onClick={handleClearLearningData}
            >
              Clear Data
            </button>
          </div>
        </section>

        {/* Danger Zone */}

        <section className="settings-card danger-zone">
          <div className="settings-card-header">
            <div className="settings-icon danger-icon">⚠️</div>

            <div>
              <h2>Danger Zone</h2>
              <p>These actions can permanently affect your account.</p>
            </div>
          </div>

          <div className="danger-content">
            <div>
              <h3>Delete Account</h3>
              <p>
                Permanently delete your EduPath AI account and associated
                account data.
              </p>
            </div>

            {!showDeleteConfirmation ? (
              <button
                type="button"
                className="delete-account-btn"
                onClick={handleDeleteAccount}
              >
                Delete Account
              </button>
            ) : (
              <div className="delete-confirmation">
                <p>
                  Are you sure? Account deletion is not connected to the backend
                  yet, so no account will be deleted.
                </p>

                <div className="delete-confirmation-actions">
                  <button
                    type="button"
                    className="cancel-danger-btn"
                    onClick={() => setShowDeleteConfirmation(false)}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="delete-confirm-btn"
                    onClick={handleDeleteAccount}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Save / Reset Actions */}

        <div className="settings-actions">
          <button
            type="button"
            className="secondary-settings-btn"
            onClick={handleResetSettings}
            disabled={resetting || saving}
          >
            {resetting ? "Resetting..." : "↺ Reset Settings"}
          </button>

          <button
            type="button"
            className="save-settings-btn"
            onClick={handleSaveSettings}
            disabled={saving || resetting}
          >
            {saving ? "Saving..." : "💾 Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
