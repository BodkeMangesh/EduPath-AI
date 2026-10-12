import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const features = [
  {
    icon: "🧭",
    title: "Career Exploration",
    description:
      "Explore career options, understand different paths, and discover directions that match your interests.",
    tag: "DISCOVER",
  },
  {
    icon: "🗺️",
    title: "Personalized Roadmaps",
    description:
      "Organize your learning journey into clear steps based on your goals and current skill level.",
    tag: "PLAN",
  },
  {
    icon: "📚",
    title: "Learning Resources",
    description:
      "Find learning materials that help you build knowledge and work toward your career goals.",
    tag: "LEARN",
  },
  {
    icon: "📊",
    title: "Progress Tracking",
    description:
      "Review your learning progress and keep track of the milestones you complete along the way.",
    tag: "IMPROVE",
  },
  {
    icon: "📄",
    title: "Resume Analysis",
    description:
      "Review your resume, understand potential skill gaps, and identify areas to improve.",
    tag: "PREPARE",
  },
  {
    icon: "🎯",
    title: "Placement Preparation",
    description:
      "Keep your career preparation organized as you work toward internship and job opportunities.",
    tag: "GET READY",
  },
];

const steps = [
  {
    number: "01",
    icon: "👤",
    title: "Create your profile",
    description:
      "Tell us about your background, skills, interests, and career goals.",
  },
  {
    number: "02",
    icon: "🔎",
    title: "Explore your direction",
    description:
      "Explore career possibilities and select a direction you want to pursue.",
  },
  {
    number: "03",
    icon: "🛤️",
    title: "Build your roadmap",
    description:
      "Use your learning roadmap to organize the skills and topics you want to develop.",
  },
  {
    number: "04",
    icon: "🚀",
    title: "Learn and grow",
    description:
      "Work through your goals, review your progress, and keep moving forward.",
  },
];

const audiences = [
  {
    icon: "🎓",
    title: "Students",
    description:
      "Connect your academic learning with practical skills and future career goals.",
  },
  {
    icon: "💻",
    title: "Job Seekers",
    description:
      "Organize your resume, skill development, and preparation for job opportunities.",
  },
  {
    icon: "🔄",
    title: "Career Changers",
    description:
      "Explore a new professional direction and identify skills you may need to develop.",
  },
  {
    icon: "🌱",
    title: "Working Professionals",
    description:
      "Keep learning, strengthen your existing skills, and plan your next career step.",
  },
];

const faqs = [
  {
    question: "What is EduPath AI?",
    answer:
      "EduPath AI is a career and learning platform designed to help you explore career options, organize learning goals, follow roadmaps, and monitor your progress.",
  },
  {
    question: "Who can use EduPath AI?",
    answer:
      "Students, job seekers, working professionals, and people exploring a career change can use the platform to organize their learning and career preparation.",
  },
  {
    question: "How do I get started?",
    answer:
      "Create an account, complete your onboarding information, explore career options, and select the direction you want to pursue.",
  },
  {
    question: "Can I track my learning progress?",
    answer:
      "EduPath AI includes a progress area where signed-in users can review their learning progress. The information available depends on the activities supported in your account.",
  },
];

function Home() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollToSection = (id) => {
    setMenuOpen(false);

    if (id === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const goToRegister = () => {
    setMenuOpen(false);
    navigate("/register");
  };

  const goToLogin = () => {
    setMenuOpen(false);
    navigate("/login");
  };

  return (
    <div className="home-page" id="top">
      {/* ================= NAVBAR ================= */}

      <header className="home-navbar">
        <button
          type="button"
          className="home-logo"
          onClick={() => scrollToSection("top")}
          aria-label="EduPath AI home"
        >
          <span className="home-logo-icon">🎓</span>
          <span>
            EduPath <strong>AI</strong>
          </span>
        </button>

        <button
          type="button"
          className="home-menu-toggle"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={
            menuOpen ? "Close navigation menu" : "Open navigation menu"
          }
          aria-expanded={menuOpen}
          aria-controls="home-navigation"
        >
          <span>{menuOpen ? "✕" : "☰"}</span>
        </button>

        <nav
          id="home-navigation"
          className={`home-nav-content ${menuOpen ? "is-open" : ""}`}
          aria-label="Main navigation"
        >
          <div className="home-nav-links">
            <button onClick={() => scrollToSection("features")}>
              Features
            </button>

            <button onClick={() => scrollToSection("how-it-works")}>
              How It Works
            </button>

            <button onClick={() => scrollToSection("who-its-for")}>
              Who It's For
            </button>

            <button onClick={() => scrollToSection("faq")}>FAQ</button>
          </div>

          <div className="home-nav-actions">
            <button className="home-login-btn" onClick={goToLogin}>
              Login
            </button>

            <button className="home-register-btn" onClick={goToRegister}>
              Get Started <span aria-hidden="true">↗</span>
            </button>
          </div>
        </nav>
      </header>

      <main>
        {/* ================= HERO ================= */}

        <section className="home-hero">
          <div className="home-hero-content">
            <div className="home-badge">
              <span aria-hidden="true">✦</span>
              YOUR CAREER. YOUR JOURNEY.
            </div>

            <h1>
              Turn your ambitions
              <br />
              into <span>your next chapter.</span>
            </h1>

            <p>
              Discover career possibilities, build valuable skills, and create a
              clearer path toward your goals — all in one place with EduPath AI.
            </p>

            <div className="home-hero-actions">
              <button className="home-primary-btn" onClick={goToRegister}>
                Start Your Journey <span aria-hidden="true">→</span>
              </button>

              <button
                className="home-secondary-btn"
                onClick={() => scrollToSection("how-it-works")}
              >
                Explore How It Works
              </button>
            </div>

            <div className="home-hero-note">
              <span aria-hidden="true">✓</span>A clearer way to organize your
              career and learning goals.
            </div>
          </div>

          <div className="home-hero-visual" aria-hidden="true">
            <div className="home-orbit home-orbit-one"></div>
            <div className="home-orbit home-orbit-two"></div>

            <div className="home-visual-glow"></div>

            <div className="home-visual-card home-visual-card-main">
              <div className="home-visual-card-top">
                <span className="home-visual-label">YOUR NEXT CHAPTER</span>
                <span className="home-visual-status">● YOUR PACE</span>
              </div>

              <div className="home-visual-symbol">✦</div>

              <h3>Your future starts with a plan.</h3>

              <p>Small steps. New skills. Meaningful progress.</p>

              <div className="home-visual-progress">
                <span></span>
              </div>

              <div className="home-visual-bottom">
                <span>Discover</span>
                <span>Learn</span>
                <span>Grow ↗</span>
              </div>
            </div>

            <div className="home-floating-card home-floating-card-top">
              <span className="home-floating-icon">🧭</span>
              <div>
                <strong>Find your direction</strong>
                <small>Explore career paths</small>
              </div>
            </div>

            <div className="home-floating-card home-floating-card-bottom">
              <span className="home-floating-icon">📈</span>
              <div>
                <strong>Keep moving forward</strong>
                <small>Track your progress</small>
              </div>
            </div>
          </div>
        </section>

        {/* ================= INTRO STRIP ================= */}

        <section className="home-intro-strip">
          <p>EVERY CAREER BEGINS SOMEWHERE.</p>
          <span>Start where you are.</span>
          <span className="home-intro-divider">✦</span>
          <span>Learn what you need.</span>
          <span className="home-intro-divider">✦</span>
          <span>Build what comes next.</span>
        </section>

        {/* ================= FEATURES ================= */}

        <section id="features" className="home-section home-features-section">
          <div className="home-section-heading">
            <span className="home-section-eyebrow">
              ONE PLATFORM. MORE POSSIBILITIES.
            </span>

            <h2>
              Everything you need to
              <br />
              <span>move forward.</span>
            </h2>

            <p>
              Bring career exploration, skill development, and learning progress
              together in one organized experience.
            </p>
          </div>

          <div className="home-features">
            {features.map((feature) => (
              <article className="home-feature-card" key={feature.title}>
                <div className="home-feature-top">
                  <span className="home-feature-icon">{feature.icon}</span>
                  <span className="home-feature-tag">{feature.tag}</span>
                </div>

                <h3>{feature.title}</h3>
                <p>{feature.description}</p>

                <button
                  className="home-card-link"
                  onClick={goToRegister}
                  aria-label={`Get started with ${feature.title}`}
                >
                  Explore this path <span aria-hidden="true">↗</span>
                </button>
              </article>
            ))}
          </div>
        </section>

        {/* ================= HOW IT WORKS ================= */}

        <section id="how-it-works" className="home-how-section">
          <div className="home-section-heading">
            <span className="home-section-eyebrow">
              A SIMPLE PLACE TO BEGIN
            </span>

            <h2>
              Your journey,
              <br />
              <span>step by step.</span>
            </h2>

            <p>
              You don't need to have everything figured out. Begin with a goal
              and take the next step at your own pace.
            </p>
          </div>

          <div className="home-steps">
            {steps.map((step) => (
              <article className="home-step" key={step.number}>
                <div className="home-step-top">
                  <span className="home-step-icon">{step.icon}</span>
                  <span className="home-step-number">{step.number}</span>
                </div>

                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>

          <div className="home-steps-cta">
            <p>Ready to take your first step?</p>
            <button className="home-primary-btn" onClick={goToRegister}>
              Create Your Account <span aria-hidden="true">→</span>
            </button>
          </div>
        </section>

        {/* ================= WHO IT'S FOR ================= */}

        <section
          id="who-its-for"
          className="home-section home-audience-section"
        >
          <div className="home-audience-copy">
            <span className="home-section-eyebrow">
              MADE FOR YOUR NEXT STEP
            </span>

            <h2>
              Wherever you are,
              <br />
              <span>you can grow from here.</span>
            </h2>

            <p>
              Career journeys aren't identical. EduPath AI helps you organize
              yours around your background, interests, and goals.
            </p>

            <button className="home-primary-btn" onClick={goToRegister}>
              Find Your Starting Point <span aria-hidden="true">→</span>
            </button>
          </div>

          <div className="home-audience-grid">
            {audiences.map((audience) => (
              <article className="home-audience-card" key={audience.title}>
                <span className="home-audience-icon">{audience.icon}</span>
                <h3>{audience.title}</h3>
                <p>{audience.description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ================= CAREER READINESS ================= */}

        <section className="home-readiness-section">
          <div className="home-readiness-content">
            <span className="home-section-eyebrow">
              YOUR GOALS DESERVE A PLAN
            </span>

            <h2>
              Don't just dream
              <br />
              about your future.
              <br />
              <span>Prepare for it.</span>
            </h2>

            <p>
              Strengthen your skills, organize your learning, review your
              resume, and take practical steps toward the opportunities you
              want.
            </p>

            <button className="home-primary-btn" onClick={goToRegister}>
              Start Preparing <span aria-hidden="true">↗</span>
            </button>
          </div>

          <div className="home-readiness-points">
            <div className="home-readiness-point">
              <span>01</span>
              <div>
                <h3>Know your direction</h3>
                <p>Explore career options and set a goal to work toward.</p>
              </div>
              <span className="home-readiness-check">✓</span>
            </div>

            <div className="home-readiness-point">
              <span>02</span>
              <div>
                <h3>Build relevant skills</h3>
                <p>Organize the topics and resources you need to learn.</p>
              </div>
              <span className="home-readiness-check">✓</span>
            </div>

            <div className="home-readiness-point">
              <span>03</span>
              <div>
                <h3>Prepare with purpose</h3>
                <p>Work on your resume and keep your preparation organized.</p>
              </div>
              <span className="home-readiness-check">✓</span>
            </div>

            <div className="home-readiness-point">
              <span>04</span>
              <div>
                <h3>Review your progress</h3>
                <p>Recognize completed milestones and plan the next step.</p>
              </div>
              <span className="home-readiness-check">✓</span>
            </div>
          </div>
        </section>

        {/* ================= FAQ ================= */}

        <section id="faq" className="home-section home-faq-section">
          <div className="home-section-heading">
            <span className="home-section-eyebrow">GOT QUESTIONS?</span>

            <h2>
              A few things
              <br />
              <span>worth knowing.</span>
            </h2>

            <p>
              Start with the basics. You can explore the platform further after
              creating your account.
            </p>
          </div>

          <div className="home-faq-list">
            {faqs.map((faq) => (
              <details className="home-faq-item" key={faq.question}>
                <summary>
                  <span>{faq.question}</span>
                  <span className="home-faq-toggle" aria-hidden="true">
                    +
                  </span>
                </summary>

                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ================= FINAL CTA ================= */}

        <section className="home-final-cta">
          <div className="home-final-cta-decoration" aria-hidden="true">
            ✦
          </div>

          <span className="home-section-eyebrow">
            YOUR NEXT CHAPTER STARTS HERE
          </span>

          <h2>
            Your goals.
            <br />
            Your effort.
            <br />
            <span>Your next chapter.</span>
          </h2>

          <p>
            Take the first step toward a more organized learning and career
            journey with EduPath AI.
          </p>

          <div className="home-hero-actions">
            <button className="home-primary-btn" onClick={goToRegister}>
              Get Started — It's Your Journey <span aria-hidden="true">→</span>
            </button>

            <button className="home-secondary-btn" onClick={goToLogin}>
              Already registered? Login
            </button>
          </div>
        </section>
      </main>

      {/* ================= FOOTER ================= */}

      <footer className="home-footer">
        <div className="footer-brand">
          <button
            type="button"
            className="home-logo footer-logo"
            onClick={() => scrollToSection("top")}
          >
            <span className="home-logo-icon">🎓</span>

            <span className="footer-logo-copy">
              <strong>
                EduPath <span>AI</span>
              </strong>
              <small>Your Career Companion</small>
            </span>
          </button>

          <p>
            A place to explore career possibilities, organize learning goals,
            build skills, and move toward your next opportunity.
          </p>

          <p className="footer-tagline">Discover. Learn. Improve. Grow.</p>
        </div>

        <div className="footer-column">
          <h4>Explore</h4>
          <button onClick={() => scrollToSection("features")}>Features</button>
          <button onClick={() => scrollToSection("how-it-works")}>
            How It Works
          </button>
          <button onClick={() => scrollToSection("who-its-for")}>
            Who It's For
          </button>
          <button onClick={() => scrollToSection("faq")}>FAQs</button>
        </div>

        <div className="footer-column">
          <h4>Your Journey</h4>
          <button onClick={() => navigate("/career-explorer")}>
            Career Explorer
          </button>
          <button onClick={() => navigate("/career-selection")}>
            Career Selection
          </button>
          <button onClick={() => navigate("/roadmap")}>Roadmap</button>
          <button onClick={() => navigate("/resume-analyzer")}>
            Resume Analyzer
          </button>
        </div>

        <div className="footer-column">
          <h4>Your Account</h4>
          <button onClick={goToRegister}>Create Account</button>
          <button onClick={goToLogin}>Login</button>
          <button onClick={() => navigate("/terms-and-conditions")}>
            Terms &amp; Conditions
          </button>
          <button onClick={() => navigate("/privacy-policy")}>
            Privacy Policy
          </button>
        </div>

        <div className="home-footer-bottom">
          <p>© {new Date().getFullYear()} EduPath AI. All rights reserved.</p>

          <button onClick={() => scrollToSection("top")}>Back to top ↑</button>
        </div>
      </footer>
    </div>
  );
}

export default Home;
