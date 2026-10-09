import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {
  const navigate = useNavigate();

  const scrollToSection = (id) => {
    const element = document.getElementById(id);

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="home-page">
      {/* Navbar */}
      <header className="home-navbar">
        <div
          className="home-logo"
          onClick={() => navigate("/")}
          role="button"
          tabIndex={0}
        >
          <span className="home-logo-icon">🎓</span>
          <span>EduPath AI</span>
        </div>

        <div className="home-nav-actions">
          <button className="home-login-btn" onClick={() => navigate("/login")}>
            Login
          </button>

          <button
            className="home-register-btn"
            onClick={() => navigate("/register")}
          >
            Register
          </button>
        </div>
      </header>

      {/* Hero */}
      <main>
        <section className="home-hero">
          <div className="home-hero-content">
            <span className="home-badge">
              🎯 AI-Powered Personalized Learning
            </span>

            <h1>
              Build Your Career.
              <br />
              <span>Learn Your Way.</span>
            </h1>

            <p>
              EduPath AI analyzes your skills, interests, strengths and career
              goals to create a personalized career and learning journey.
            </p>

            <div className="home-hero-actions">
              <button
                className="home-primary-btn"
                onClick={() => navigate("/register")}
              >
                Get Started
              </button>

              <button
                className="home-secondary-btn"
                onClick={() => navigate("/login")}
              >
                Already have an account?
              </button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="home-section">
          <div className="home-section-heading">
            <span>WHY EDUPATH AI?</span>
            <h2>Your Personalized Career Journey</h2>
            <p>
              Discover, learn and track your progress with an AI-powered
              learning platform.
            </p>
          </div>

          <div className="home-features">
            <div className="home-feature-card">
              <div className="home-feature-icon">🧠</div>
              <h3>AI Career Analysis</h3>
              <p>
                Understand your strengths, skills and career possibilities
                through intelligent analysis.
              </p>
            </div>

            <div className="home-feature-card">
              <div className="home-feature-icon">🗺️</div>
              <h3>Personalized Roadmap</h3>
              <p>
                Get a learning roadmap designed around your current skills and
                career goal.
              </p>
            </div>

            <div className="home-feature-card">
              <div className="home-feature-icon">📚</div>
              <h3>Smart Resources</h3>
              <p>
                Receive learning resources based on your skill gaps and current
                learning needs.
              </p>
            </div>

            <div className="home-feature-card">
              <div className="home-feature-icon">📈</div>
              <h3>Progress Tracking</h3>
              <p>
                Track completed topics, learning progress, milestones and
                consistency.
              </p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="home-how-section">
          <div className="home-section-heading">
            <span>HOW IT WORKS</span>
            <h2>From Skills to Career</h2>
          </div>

          <div className="home-steps">
            <div className="home-step">
              <span>01</span>
              <h3>Assess</h3>
              <p>Tell EduPath AI about your skills, interests and goals.</p>
            </div>

            <div className="home-step">
              <span>02</span>
              <h3>Discover</h3>
              <p>Get career recommendations and identify your skill gaps.</p>
            </div>

            <div className="home-step">
              <span>03</span>
              <h3>Learn</h3>
              <p>Follow your personalized roadmap and learning resources.</p>
            </div>

            <div className="home-step">
              <span>04</span>
              <h3>Grow</h3>
              <p>
                Track progress and continuously improve your career readiness.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-brand">
          <div className="home-logo footer-logo">
            <span className="home-logo-icon">🎓</span>

            <div>
              <strong>EduPath AI</strong>
              <small>Your Career Companion</small>
            </div>
          </div>

          <p>
            EduPath AI is an AI-powered personalized career and learning
            platform designed to help students and professionals discover
            suitable career paths, identify skill gaps, follow personalized
            roadmaps and achieve their learning goals.
          </p>

          <p className="footer-tagline">Discover. Learn. Improve. Grow.</p>
        </div>

        <div className="footer-column">
          <h4>Platform</h4>

          <button onClick={() => navigate("/login")}>Login</button>

          <button onClick={() => navigate("/register")}>Register</button>

          <button>Features</button>

          <button>How It Works</button>
        </div>

        <div className="footer-column">
          <h4>Learning</h4>

          <button onClick={() => navigate("/learning")}>Learning Path</button>

          <button onClick={() => navigate("/roadmap")}>Roadmap</button>

          <button onClick={() => navigate("/resources")}>Resources</button>

          <button onClick={() => navigate("/progress")}>Progress</button>
        </div>

        <div className="footer-column">
          <h4>Company</h4>

          <button>About Us</button>

          <button>Contact</button>

          <button>How It Works</button>

          <button>Features</button>
        </div>

        <div className="footer-column">
          <h4>Legal</h4>

          <button onClick={() => navigate("/terms-and-conditions")}>
            Terms & Conditions
          </button>

          <button onClick={() => navigate("/privacy-policy")}>
            Privacy Policy
          </button>
        </div>

        <div className="footer-social">
          <h4>Follow EduPath AI</h4>

          <div className="footer-social-links">
            <a href="#" aria-label="LinkedIn">
              LinkedIn
            </a>

            <a href="#" aria-label="GitHub">
              GitHub
            </a>

            <a href="#" aria-label="Instagram">
              Instagram
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
