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

      // Save JWT
      localStorage.setItem("token", token);

      // Update Auth Context
      login(token);

      console.log("Login Response:", response.data);

      toast.success("Login Successful!");

      navigate("/dashboard");
    } catch (error) {
      console.log("Login Error:", error.response?.data);

      toast.error(error.response?.data?.message || "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Left Section */}
        <div className="login-info">
          <div className="brand">
            <span className="brand-icon">🎓</span>
            <span>EduPath-AI</span>
          </div>

          <h1>
            Build Your
            <span> Future.</span>
          </h1>

          <p>
            Continue your personalized learning journey and move one step closer
            to your career goals.
          </p>

          <div className="login-features">
            <div>
              <span>🎯</span>
              <p>Personalized Career Paths</p>
            </div>

            <div>
              <span>🧠</span>
              <p>AI-Powered Skill Analysis</p>
            </div>

            <div>
              <span>📈</span>
              <p>Track Your Learning Progress</p>
            </div>
          </div>
        </div>

        {/* Login Card */}
        <div className="login-card">
          <div className="login-header">
            <h2>Welcome Back 👋</h2>

            <p>Login to continue your EduPath-AI journey.</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {/* Email */}
            <div className="form-group">
              <label htmlFor="email">Email Address</label>

              <input
                id="email"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="password">Password</label>

              <input
                id="password"
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
            </div>

            {/* Login Button */}
            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Register */}
          <div className="register-link">
            <span>Don't have an account?</span>

            <button type="button" onClick={() => navigate("/register")}>
              Create Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
