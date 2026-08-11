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

  const [loading, setLoading] = useState(false);

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

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
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

      toast.success(response.data.message || "Registration successful!");

      navigate("/login");
    } catch (error) {
      console.error("Registration Error:", error);

      toast.error(error.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        {/* =========================
            LEFT SECTION
        ========================== */}

        <div className="register-info">
          <div className="register-brand">
            <span>🎓</span>
            <strong>EduPath-AI</strong>
          </div>

          <h1>
            Start Your
            <span> Journey.</span>
          </h1>

          <p>
            Create your account and discover a personalized learning path
            designed around your skills, interests and career goals.
          </p>

          <div className="register-features">
            <div className="register-feature">
              <span>🧠</span>

              <div>
                <strong>AI-Powered Analysis</strong>
                <p>Understand your strengths and skill gaps.</p>
              </div>
            </div>

            <div className="register-feature">
              <span>🎯</span>

              <div>
                <strong>Personalized Career Path</strong>
                <p>Get a learning journey based on your goals.</p>
              </div>
            </div>

            <div className="register-feature">
              <span>📈</span>

              <div>
                <strong>Track Your Progress</strong>
                <p>Monitor your learning journey step by step.</p>
              </div>
            </div>
          </div>
        </div>

        {/* =========================
            REGISTER CARD
        ========================== */}

        <div className="register-card">
          <div className="register-header">
            <h2>Create Account 🚀</h2>

            <p>Join EduPath-AI and start building your future.</p>
          </div>

          <form className="register-form" onSubmit={handleSubmit}>
            {/* Full Name */}

            <div className="register-form-group">
              <label htmlFor="fullName">Full Name</label>

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

            {/* Email */}

            <div className="register-form-group">
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

            {/* Phone */}

            <div className="register-form-group">
              <label htmlFor="phone">Phone Number</label>

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

            {/* Password */}

            <div className="register-form-group">
              <label htmlFor="password">Password</label>

              <input
                id="password"
                type="password"
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
              />
            </div>

            {/* Confirm Password */}

            <div className="register-form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>

              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
              />
            </div>

            {/* Register */}

            <button
              type="submit"
              className="register-button"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* Login */}

          <div className="login-link">
            <span>Already have an account?</span>

            <button type="button" onClick={() => navigate("/login")}>
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
