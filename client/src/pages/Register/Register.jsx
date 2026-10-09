import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { register } from "../../services/authService";

import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.fullName ||
      !formData.email ||
      !formData.phone ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      toast.error("Please fill all fields.");
      return;
    }

    if (!acceptedTerms) {
      toast.error("Please accept the terms and conditions.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      };

      const response = await register(payload);

      console.log("REGISTER RESPONSE:", response.data);

      toast.success(response.data.message || "Registration successful!");

      navigate("/login");
    } catch (error) {
      console.error("Registration Error:", error);

      toast.error(
        error.response?.data?.message ||
          "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      {/* Background decorations */}
      <div className="register-bg-circle register-bg-circle-one"></div>
      <div className="register-bg-circle register-bg-circle-two"></div>

      <div className="register-container">
        {/* =====================================================
            LEFT / BRAND SECTION
        ====================================================== */}

        <section className="register-info">
          <button
            type="button"
            className="register-brand"
            onClick={() => navigate("/")}
          >
            <span className="brand-icon">🎓</span>

            <span className="brand-name">
              EduPath <strong>AI</strong>
            </span>
          </button>

          <div className="register-info-content">
            <span className="register-badge">START YOUR JOURNEY</span>

            <h1>
              Build your
              <span> future</span>
              <br />
              with EduPath AI.
            </h1>

            <p>
              Create your account and let EduPath AI understand your skills,
              interests and goals to build a personalized learning journey for
              you.
            </p>
          </div>

          {/* Feature cards */}

          <div className="register-features">
            <div className="register-feature">
              <div className="feature-icon">🧠</div>

              <div>
                <strong>AI-Powered Analysis</strong>

                <p>
                  Discover your strengths and identify important skill gaps.
                </p>
              </div>
            </div>

            <div className="register-feature">
              <div className="feature-icon">🎯</div>

              <div>
                <strong>Personalized Career Path</strong>

                <p>Get recommendations based on your goals and interests.</p>
              </div>
            </div>

            <div className="register-feature">
              <div className="feature-icon">📈</div>

              <div>
                <strong>Track Your Progress</strong>

                <p>Follow your learning journey and improve step by step.</p>
              </div>
            </div>
          </div>

          <div className="register-trust">
            <span>✓</span>
            <p>Your learning journey stays personalized to you.</p>
          </div>
        </section>

        {/* =====================================================
            REGISTER CARD
        ====================================================== */}

        <section className="register-card">
          <div className="register-header">
            <span className="register-header-icon">✨</span>

            <div>
              <h2>Create your account</h2>

              <p>Start your personalized learning journey.</p>
            </div>
          </div>

          <form className="register-form" onSubmit={handleSubmit}>
            {/* =================================================
                FULL NAME
            ================================================== */}

            <div className="register-form-group">
              <label htmlFor="fullName">Full Name</label>

              <div className="register-input-wrapper">
                <span className="input-icon">👤</span>

                <input
                  id="fullName"
                  type="text"
                  name="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  autoComplete="name"
                />
              </div>
            </div>

            {/* =================================================
                EMAIL
            ================================================== */}

            <div className="register-form-group">
              <label htmlFor="email">Email Address</label>

              <div className="register-input-wrapper">
                <span className="input-icon">✉️</span>

                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* =================================================
                PHONE
            ================================================== */}

            <div className="register-form-group">
              <label htmlFor="phone">Phone Number</label>

              <div className="register-input-wrapper">
                <span className="input-icon">📱</span>

                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                />
              </div>
            </div>

            {/* =================================================
                PASSWORD
            ================================================== */}

            <div className="register-form-group">
              <label htmlFor="password">Password</label>

              <div className="register-input-wrapper">
                <span className="input-icon">🔒</span>

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
              </div>
            </div>

            {/* =================================================
                CONFIRM PASSWORD
            ================================================== */}

            <div className="register-form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>

              <div className="register-input-wrapper">
                <span className="input-icon">🔐</span>

                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* =================================================
                TERMS
            ================================================== */}

            <div className="register-terms">
              <label className="register-terms-label">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                />

                <span className="custom-checkbox"></span>

                <span className="terms-text">
                  I agree to the{" "}
                  <button
                    type="button"
                    className="terms-link"
                    onClick={() => navigate("/terms-and-conditions")}
                  >
                    Terms & Conditions
                  </button>{" "}
                  and{" "}
                  <button
                    type="button"
                    className="terms-link"
                    onClick={() => navigate("/privacy-policy")}
                  >
                    Privacy Policy
                  </button>
                  .
                </span>
              </label>
            </div>

            {/* =================================================
                SUBMIT
            ================================================== */}

            <button
              type="submit"
              className="register-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="register-spinner"></span>
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <span>→</span>
                </>
              )}
            </button>
          </form>

          {/* =================================================
              LOGIN
          ================================================== */}

          <div className="login-link">
            <span>Already have an account?</span>

            <button type="button" onClick={() => navigate("/login")}>
              Login
            </button>
          </div>

          <div className="register-footer">
            <span>🔐</span>
            Secure account creation with EduPath AI
          </div>
        </section>
      </div>
    </div>
  );
}

export default Register;
