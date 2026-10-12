import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { forgotPassword } from "../../services/authService";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);

      const response = await forgotPassword(email.trim());

      setSubmitted(true);
      toast.success(
        response.data.message ||
          "If an account exists with this email, reset instructions will be sent.",
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to process your request. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="forgot-password-page">
      <section className="forgot-password-card">
        <h1>Forgot Password?</h1>

        {submitted ? (
          <>
            <p>
              If an account exists with this email, password reset instructions
              will be sent. Check your inbox.
            </p>

            <button
              type="button"
              className="forgot-password-submit"
              onClick={() => {
                setSubmitted(false);
                setEmail("");
              }}
            >
              Try another email
            </button>
          </>
        ) : (
          <>
            <p>
              Enter your registered email address and we’ll send you a password
              reset link.
            </p>

            <form onSubmit={handleSubmit}>
              <label htmlFor="forgot-email">Email address</label>

              <input
                id="forgot-email"
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />

              <button
                type="submit"
                className="forgot-password-submit"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          </>
        )}

        <Link to="/login" className="forgot-password-back">
          Back to Login
        </Link>
      </section>
    </main>
  );
};

export default ForgotPassword;
