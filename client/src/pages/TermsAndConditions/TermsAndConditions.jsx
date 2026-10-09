import { useNavigate } from "react-router-dom";
import "./TermsAndConditions.css";

function TermsAndConditions() {
  const navigate = useNavigate();

  return (
    <div className="terms-page">
      {/* Header */}

      <header className="terms-header">
        <div
          className="terms-brand"
          onClick={() => navigate("/")}
          role="button"
          tabIndex={0}
        >
          <span className="terms-logo-icon">🎓</span>

          <span>EduPath AI</span>
        </div>

        <button
          className="terms-back-btn"
          onClick={() => navigate("/register")}
        >
          ← Back to Register
        </button>
      </header>

      {/* Main Content */}

      <main className="terms-container">
        <div className="terms-intro">
          <span className="terms-badge">LEGAL</span>

          <h1>Terms & Conditions</h1>

          <p>
            Please read these Terms & Conditions carefully before using EduPath
            AI.
          </p>

          <small>Last updated: August 2026</small>
        </div>

        <div className="terms-content">
          <section>
            <h2>1. Introduction</h2>

            <p>
              Welcome to EduPath AI. EduPath AI is an AI-powered personalized
              career and learning platform designed to help users discover
              suitable career paths, identify skill gaps and follow personalized
              learning journeys.
            </p>

            <p>
              By creating an account or using our platform, you agree to follow
              these Terms & Conditions.
            </p>
          </section>

          <section>
            <h2>2. User Account</h2>

            <p>
              Users are responsible for providing accurate information while
              creating their account.
            </p>

            <p>
              You are responsible for maintaining the confidentiality of your
              login credentials and for activities performed through your
              account.
            </p>
          </section>

          <section>
            <h2>3. AI-Powered Recommendations</h2>

            <p>
              EduPath AI may use artificial intelligence to analyze user
              information and generate career recommendations, learning paths,
              skill-gap analysis and learning resources.
            </p>

            <p>
              AI-generated recommendations are provided for educational and
              guidance purposes and should not be considered guaranteed career
              outcomes.
            </p>
          </section>

          <section>
            <h2>4. Learning Resources</h2>

            <p>
              EduPath AI may recommend courses, documentation, videos, practice
              material and projects from different sources.
            </p>

            <p>
              Availability, accuracy and policies of third-party resources are
              controlled by their respective providers.
            </p>
          </section>

          <section>
            <h2>5. User Responsibilities</h2>

            <p>Users agree to:</p>

            <ul>
              <li>Provide truthful information.</li>
              <li>Keep their account credentials secure.</li>
              <li>Use the platform for lawful purposes.</li>
              <li>Respect the rights of other users.</li>
              <li>Not attempt to misuse or damage the platform.</li>
            </ul>
          </section>

          <section>
            <h2>6. Platform Usage</h2>

            <p>
              Users must not attempt to gain unauthorized access to the
              platform, its systems, databases or other users' accounts.
            </p>

            <p>
              Any activity that may negatively affect the security, availability
              or performance of the platform is prohibited.
            </p>
          </section>

          <section>
            <h2>7. Privacy</h2>

            <p>
              EduPath AI may collect information necessary to provide
              personalized learning and career services.
            </p>

            <p>
              The use and protection of user information are described in our
              Privacy Policy.
            </p>
          </section>

          <section>
            <h2>8. Account Termination</h2>

            <p>
              EduPath AI may suspend or terminate an account if the user
              violates these Terms & Conditions or misuses the platform.
            </p>
          </section>

          <section>
            <h2>9. Disclaimer</h2>

            <p>
              EduPath AI provides educational guidance and AI-generated
              recommendations. We do not guarantee employment, admission,
              salary, certification or any specific career outcome.
            </p>

            <p>
              Users should independently evaluate important educational and
              career decisions.
            </p>
          </section>

          <section>
            <h2>10. Changes to These Terms</h2>

            <p>
              We may update these Terms & Conditions when necessary. Updated
              terms may be published on this page.
            </p>
          </section>

          <section>
            <h2>11. Contact</h2>

            <p>
              If you have questions regarding these Terms & Conditions, please
              contact the EduPath AI team through the contact information
              provided on our website.
            </p>
          </section>
        </div>

        {/* Bottom Action */}

        <div className="terms-footer-action">
          <p>
            By creating an EduPath AI account, you confirm that you have read
            and agree to these Terms & Conditions.
          </p>

          <button
            onClick={() => navigate("/register")}
            className="terms-continue-btn"
          >
            ← Return to Registration
          </button>

          <button
            onClick={() => navigate("/privacy-policy")}
            className="privacy-secondary-btn"
          >
            View Privacy & Policy
          </button>
        </div>
      </main>
    </div>
  );
}

export default TermsAndConditions;
