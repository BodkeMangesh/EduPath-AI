import { useNavigate } from "react-router-dom";
import "./PrivacyPolicy.css";

function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="privacy-page">
      {/* Header */}
      <header className="privacy-header">
        <div
          className="privacy-brand"
          onClick={() => navigate("/")}
          role="button"
          tabIndex={0}
        >
          <span className="privacy-logo-icon">🎓</span>
          <span>EduPath AI</span>
        </div>

        <button
          className="privacy-back-btn"
          onClick={() => navigate("/register")}
        >
          ← Back to Register
        </button>
      </header>

      {/* Main */}
      <main className="privacy-container">
        {/* Intro */}
        <div className="privacy-intro">
          <span className="privacy-badge">LEGAL</span>

          <h1>Privacy Policy</h1>

          <p>
            Your privacy matters to us. Learn how EduPath AI collects, uses and
            protects your information.
          </p>

          <small>Last updated: August 2026</small>
        </div>

        {/* Content */}
        <div className="privacy-content">
          <section>
            <h2>1. Introduction</h2>

            <p>
              EduPath AI is an AI-powered personalized career and learning
              platform. This Privacy Policy explains how information may be
              collected, used and protected when you use our platform.
            </p>
          </section>

          <section>
            <h2>2. Information We Collect</h2>

            <p>
              Depending on how you use the platform, we may collect information
              such as:
            </p>

            <ul>
              <li>Name and email address</li>
              <li>Phone number</li>
              <li>Account and authentication information</li>
              <li>Educational and career information</li>
              <li>Skills, interests and learning preferences</li>
              <li>Learning progress and completed topics</li>
              <li>Career assessment responses</li>
            </ul>
          </section>

          <section>
            <h2>3. How We Use Your Information</h2>

            <p>
              Information may be used to provide and improve personalized career
              and learning services.
            </p>

            <ul>
              <li>Creating and managing your account</li>
              <li>Generating personalized career recommendations</li>
              <li>Identifying skill gaps</li>
              <li>Generating personalized learning paths</li>
              <li>Tracking learning progress</li>
              <li>Recommending learning resources</li>
              <li>Improving platform functionality</li>
            </ul>
          </section>

          <section>
            <h2>4. AI and Personalized Recommendations</h2>

            <p>
              EduPath AI may process information provided by you to generate
              career recommendations, skill analysis, learning roadmaps and
              resource recommendations.
            </p>

            <p>
              AI-generated results are intended for educational guidance and
              should not be considered guaranteed career outcomes.
            </p>
          </section>

          <section>
            <h2>5. Data Security</h2>

            <p>
              We take reasonable measures to protect user information from
              unauthorized access, alteration, disclosure or destruction.
            </p>

            <p>However, no online system can guarantee absolute security.</p>
          </section>

          <section>
            <h2>6. Third-Party Services</h2>

            <p>
              EduPath AI may use third-party services for functionality such as
              authentication, AI processing, hosting, analytics or learning
              resources.
            </p>

            <p>Such services may have their own privacy policies and terms.</p>
          </section>

          <section>
            <h2>7. Learning Resources</h2>

            <p>
              The platform may recommend resources hosted by external websites
              or services. We are not responsible for the privacy practices or
              policies of those external platforms.
            </p>
          </section>

          <section>
            <h2>8. Cookies and Local Storage</h2>

            <p>
              EduPath AI may use browser storage mechanisms such as local
              storage to maintain authentication state, preferences or other
              necessary application information.
            </p>
          </section>

          <section>
            <h2>9. User Rights</h2>

            <p>
              Users may request information about their account data and, where
              applicable, request correction or deletion of their information.
            </p>
          </section>

          <section>
            <h2>10. Data Retention</h2>

            <p>
              Information may be retained for as long as necessary to provide
              the platform services, maintain security, comply with applicable
              requirements or resolve disputes.
            </p>
          </section>

          <section>
            <h2>11. Children's Privacy</h2>

            <p>
              EduPath AI is not intended to knowingly collect personal
              information from children without appropriate authorization.
            </p>
          </section>

          <section>
            <h2>12. Changes to This Privacy Policy</h2>

            <p>
              This Privacy Policy may be updated from time to time. Changes will
              be reflected on this page with an updated revision date.
            </p>
          </section>

          <section>
            <h2>13. Contact Us</h2>

            <p>
              If you have questions or concerns regarding this Privacy Policy,
              please contact the EduPath AI team through the contact information
              provided on our website.
            </p>
          </section>
        </div>

        {/* Bottom */}
        <div className="privacy-footer-action">
          <p>
            By using EduPath AI, you acknowledge that you have read and
            understood this Privacy Policy.
          </p>

          <div className="privacy-actions">
            <button
              onClick={() => navigate("/register")}
              className="privacy-primary-btn"
            >
              ← Return to Registration
            </button>

            <button
              onClick={() => navigate("/terms-and-conditions")}
              className="privacy-secondary-btn"
            >
              View Terms & Conditions
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default PrivacyPolicy;
