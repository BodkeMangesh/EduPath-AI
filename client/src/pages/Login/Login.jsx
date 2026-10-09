import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { login as loginService } from "../../services/authService";
import { AuthContext } from "../../context/AuthContext";

import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await loginService(formData);

      const token = response.data.data.token;
      const user = response.data.data.user;

      if (!token || !user) {
        toast.error("Invalid login response.");
        return;
      }

      // Save JWT
      localStorage.setItem("token", token);

      // Save user information
      localStorage.setItem("user", JSON.stringify(user));

      // Update Auth Context
      login(token);

      console.log("Login Response:", response.data);
      console.log("Onboarding Completed:", user.onboardingCompleted);

      toast.success("Login Successful!");

      /*
      |--------------------------------------------------------------------------
      | Existing User Flow
      |--------------------------------------------------------------------------
      */

      if (!user.onboardingCompleted) {
        navigate("/onboarding");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.log("Login Error:", error.response?.data);

      toast.error(error.response?.data?.message || "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Background decoration */}
      <div className="login-bg-circle login-bg-circle-one"></div>
      <div className="login-bg-circle login-bg-circle-two"></div>

      <div className="login-container">
        {/* =====================================================
            LEFT SECTION
        ====================================================== */}

        <section className="login-info">
          <button
            type="button"
            className="login-brand"
            onClick={() => navigate("/")}
          >
            <span className="login-brand-icon">🎓</span>

            <span className="login-brand-name">
              EduPath <strong>AI</strong>
            </span>
          </button>

          <div className="login-info-content">
            <span className="login-badge">WELCOME BACK</span>

            <h1>
              Continue your
              <span> journey.</span>
            </h1>

            <p>
              Your personalized learning journey is waiting for you. Login and
              continue building the skills that move you closer to your career
              goals.
            </p>
          </div>

          {/* Features */}

          <div className="login-features">
            <div className="login-feature">
              <div className="login-feature-icon">🎯</div>

              <div>
                <strong>Personalized Career Paths</strong>

                <p>Follow a learning path designed around your goals.</p>
              </div>
            </div>

            <div className="login-feature">
              <div className="login-feature-icon">🧠</div>

              <div>
                <strong>AI-Powered Skill Analysis</strong>

                <p>Understand your strengths and improve your weak areas.</p>
              </div>
            </div>

            <div className="login-feature">
              <div className="login-feature-icon">📈</div>

              <div>
                <strong>Track Your Progress</strong>

                <p>Monitor your progress as you learn and grow.</p>
              </div>
            </div>
          </div>

          <div className="login-trust">
            <span>✓</span>

            <p>Your personalized journey is always ready when you are.</p>
          </div>
        </section>

        {/* =====================================================
            LOGIN CARD
        ====================================================== */}

        <section className="login-card">
          <div className="login-header">
            <span className="login-header-icon">👋</span>

            <div>
              <h2>Welcome back</h2>

              <p>Login to continue your journey.</p>
            </div>
          </div>

          {/* =================================================
              FORM
          ================================================== */}

          <form className="login-form" onSubmit={handleSubmit}>
            {/* Email */}

            <div className="login-form-group">
              <label htmlFor="email">Email Address</label>

              <div className="login-input-wrapper">
                <span className="login-input-icon">✉️</span>

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

            {/* Password */}

            <div className="login-form-group">
              <div className="login-password-label">
                <label htmlFor="password">Password</label>

                <button
                  type="button"
                  className="forgot-password"
                  onClick={() => toast("Password recovery coming soon.")}
                >
                  Forgot password?
                </button>
              </div>

              <div className="login-input-wrapper">
                <span className="login-input-icon">🔒</span>

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Login */}

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? (
                <>
                  <span className="login-spinner"></span>
                  Logging in...
                </>
              ) : (
                <>
                  Login to EduPath
                  <span>→</span>
                </>
              )}
            </button>
          </form>

          {/* =================================================
              REGISTER
          ================================================== */}

          <div className="register-link">
            <span>Don't have an account?</span>

            <button type="button" onClick={() => navigate("/register")}>
              Create Account
            </button>
          </div>

          {/* Footer */}

          <div className="login-footer">
            <span>🔐</span>
            Secure login with EduPath AI
          </div>
        </section>
      </div>
    </div>
  );
}

export default Login;
