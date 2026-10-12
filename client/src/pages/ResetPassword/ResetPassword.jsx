import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { resetPassword } from "../../services/authService";
import "./ResetPassword.css";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordReset, setPasswordReset] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("Reset link is invalid.");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must contain at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await resetPassword({ token, newPassword });

      setPasswordReset(true);
      toast.success(response.data.message || "Password reset successfully.");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to reset password. The link may have expired.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="reset-password-page">
      <section className="reset-password-card">
        {!passwordReset ? (
          <>
            <h1>Create New Password</h1>
            <p>Choose a strong new password for your EduPath-AI account.</p>

            <form onSubmit={handleSubmit}>
              <label htmlFor="new-password">New Password</label>
              <input
                id="new-password"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                autoComplete="new-password"
                minLength={8}
                required
              />

              <label htmlFor="confirm-password">Confirm Password</label>
              <input
                id="confirm-password"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                autoComplete="new-password"
                minLength={8}
                required
              />

              <label className="reset-password-show">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                />
                Show passwords
              </label>

              <button
                type="submit"
                className="reset-password-submit"
                disabled={loading}
              >
                {loading ? "Updating..." : "Reset Password"}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1>Password Updated!</h1>
            <p>
              Your password has been changed successfully. You can now log in
              using your new password.
            </p>

            <button
              type="button"
              className="reset-password-submit"
              onClick={() => navigate("/login")}
            >
              Continue to Login
            </button>
          </>
        )}

        {!passwordReset && (
          <Link to="/login" className="reset-password-back">
            Back to Login
          </Link>
        )}
      </section>
    </main>
  );
};

export default ResetPassword;
