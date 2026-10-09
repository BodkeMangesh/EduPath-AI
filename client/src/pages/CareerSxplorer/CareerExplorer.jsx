import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getExplorerProfile,
  getRecommendedCareers,
} from "../../services/careerExplorerService";

import "./CareerExplorer.css";

function CareerExplorer() {
  const navigate = useNavigate();

  /* ============================================================
     STATE
  ============================================================ */

  const [explorerData, setExplorerData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);

  const [error, setError] = useState("");

  /* ============================================================
     RESPONSE HELPER
  ============================================================ */

  const extractData = (response) => {
    if (!response) return null;

    if (response?.data?.data !== undefined) {
      return response.data.data;
    }

    if (response?.data !== undefined) {
      return response.data;
    }

    return response;
  };

  /* ============================================================
     LOAD CAREER EXPLORER
  ============================================================ */

  useEffect(() => {
    loadCareerExplorer();
  }, []);

  const loadCareerExplorer = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getExplorerProfile({
        limit: 6,
      });

      const data = extractData(response);

      if (!data) {
        throw new Error("Career Explorer data is unavailable.");
      }

      setExplorerData(data);

      /*
       * If backend already returns recommendations,
       * use them directly.
       */
      if (Array.isArray(data.recommendations)) {
        setRecommendations(data.recommendations);
      } else {
        await loadRecommendations();
      }
    } catch (err) {
      console.error("Career Explorer load error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load Career Explorer.",
      );
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     LOAD RECOMMENDATIONS
  ============================================================ */

  const loadRecommendations = async () => {
    try {
      setRecommendationsLoading(true);

      const response = await getRecommendedCareers(6);
      const data = extractData(response);

      setRecommendations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Recommendation loading error:", err);

      setRecommendations([]);
    } finally {
      setRecommendationsLoading(false);
    }
  };

  /* ============================================================
     PROFILE DATA
  ============================================================ */

  const profile = explorerData?.profile || {};

  const visibleRecommendations = useMemo(() => {
    if (!Array.isArray(recommendations)) {
      return [];
    }

    return recommendations;
  }, [recommendations]);

  /* ============================================================
     NAVIGATION
  ============================================================ */

  const handleBackToOnboarding = () => {
    navigate("/onboarding", {
      state: {
        step: 6,
        source: "career-explorer",
      },
    });
  };

  const handleNext = () => {
    const selectedCareer =
      explorerData?.selectedCareer ||
      visibleRecommendations?.[0]?.career ||
      visibleRecommendations?.[0];

    const careerId =
      selectedCareer?.id ||
      selectedCareer?._id ||
      selectedCareer?.careerId ||
      "";

    if (careerId) {
      navigate(`/career-selection?careerId=${encodeURIComponent(careerId)}`, {
        state: {
          careerId,
          career: selectedCareer,
          source: "career-explorer",
        },
      });

      return;
    }

    navigate("/career-selection", {
      state: {
        source: "career-explorer",
      },
    });
  };

  const handleExploreCareer = (item) => {
    const career = item?.career || item;

    const careerId = career?.id || career?._id || career?.careerId || "";

    if (!careerId) {
      setError("Career information is missing.");
      return;
    }

    navigate(`/career-selection?careerId=${encodeURIComponent(careerId)}`, {
      state: {
        careerId,
        career,
        source: "career-explorer",
      },
    });
  };

  /* ============================================================
     LOADING
  ============================================================ */

  if (loading) {
    return (
      <div className="career-explorer-page">
        <div className="career-explorer-loading">
          <div className="career-explorer-spinner" />

          <span className="ce-loading-label">CAREER INTELLIGENCE</span>

          <h2>Preparing your Career Explorer...</h2>

          <p>We are using the information you provided during onboarding.</p>
        </div>
      </div>
    );
  }

  /* ============================================================
     ERROR
  ============================================================ */

  if (error && !explorerData) {
    return (
      <div className="career-explorer-page">
        <div className="career-explorer-error">
          <div className="career-explorer-error-icon">!</div>

          <span className="ce-card-label">CAREER EXPLORER</span>

          <h2>Unable to load Career Explorer</h2>

          <p>{error}</p>

          <button
            type="button"
            className="ce-primary-button"
            onClick={loadCareerExplorer}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /* ============================================================
     MAIN UI
  ============================================================ */

  return (
    <div className="career-explorer-page">
      <div className="career-explorer-container">
        {/* ======================================================
           CAREER JOURNEY HEADER
        ====================================================== */}

        <div className="ce-flow-header">
          <div className="ce-flow-back">
            <button
              type="button"
              className="ce-secondary-button"
              onClick={handleBackToOnboarding}
            >
              <span>←</span>
              Back
            </button>
          </div>

          <div className="ce-flow-progress">
            <div className="ce-flow-progress-top">
              <span className="ce-card-label">YOUR CAREER JOURNEY</span>

              <strong>01 / 02</strong>
            </div>

            <div className="ce-progress-track">
              <div className="ce-progress-fill" style={{ width: "50%" }} />
            </div>

            <small>
              Career Explorer
              <span>→</span>
              Career Selection
            </small>
          </div>

          <div className="ce-flow-next">
            <button
              type="button"
              className="ce-primary-button"
              onClick={handleNext}
            >
              Next: Career Selection
              <span>→</span>
            </button>
          </div>
        </div>

        {/* ======================================================
           HERO
        ====================================================== */}

        <header className="career-explorer-header">
          <div className="ce-hero-content">
            <div className="ce-hero-badge">
              <span className="ce-hero-badge-dot" />
              AI-POWERED CAREER INTELLIGENCE
            </div>

            <span className="ce-eyebrow">STEP 01 · CAREER EXPLORATION</span>

            <h1>
              Discover the career path
              <span> that fits you.</span>
            </h1>

            <p>
              We analyzed the information from your onboarding to understand
              your goals, education, skills and interests — then turned that
              information into career options for you.
            </p>

            <div className="ce-hero-points">
              <div>
                <span>01</span>
                <strong>Your Profile</strong>
              </div>

              <div>
                <span>02</span>
                <strong>Career Matches</strong>
              </div>

              <div>
                <span>03</span>
                <strong>Your Next Step</strong>
              </div>
            </div>
          </div>

          <div className="ce-hero-visual">
            <div className="ce-hero-glow" />

            <div className="ce-hero-orbit ce-hero-orbit-one" />
            <div className="ce-hero-orbit ce-hero-orbit-two" />

            <div className="ce-hero-center">
              <span>AI</span>
              <strong>Career</strong>
              <small>Explorer</small>
            </div>

            <div className="ce-hero-floating-card ce-hero-floating-top">
              <span>🎯</span>
              <div>
                <small>Career Focus</small>
                <strong>{profile?.placement?.targetRole || "Your Goal"}</strong>
              </div>
            </div>

            <div className="ce-hero-floating-card ce-hero-floating-bottom">
              <span>✦</span>
              <div>
                <small>Personalized</small>
                <strong>AI Matching</strong>
              </div>
            </div>
          </div>
        </header>

        {/* ======================================================
           INLINE ERROR
        ====================================================== */}

        {error && (
          <div className="ce-inline-error">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Close error"
            >
              ×
            </button>
          </div>
        )}

        {/* ======================================================
           PROFILE SNAPSHOT
        ====================================================== */}

        <section className="ce-profile-snapshot">
          <div className="ce-profile-main">
            <div className="ce-profile-avatar">🎓</div>

            <div>
              <span className="ce-card-label">YOUR ONBOARDING PROFILE</span>

              <h2>{profile?.education?.degree || "Your Career Profile"}</h2>

              <p>
                {profile?.education?.branch ||
                  "Information collected from your onboarding"}
              </p>
            </div>
          </div>

          <div className="ce-profile-stats">
            <div className="ce-profile-stat">
              <span>Career Goal</span>
              <strong>{profile?.careerGoal || "Not specified"}</strong>
            </div>

            <div className="ce-profile-stat">
              <span>Target Role</span>
              <strong>
                {profile?.placement?.targetRole || "Not specified"}
              </strong>
            </div>

            <div className="ce-profile-stat">
              <span>Experience</span>
              <strong>{profile?.experienceLevel || "Beginner"}</strong>
            </div>

            <div className="ce-profile-stat">
              <span>Learning Style</span>
              <strong>{profile?.learningStyle || "Not specified"}</strong>
            </div>
          </div>
        </section>

        {/* ======================================================
           SECTION INTRO
        ====================================================== */}

        <div className="ce-section-intro">
          <div>
            <span className="ce-section-kicker">
              YOUR PERSONALIZED INSIGHTS
            </span>

            <h2>We already know a little about you.</h2>

            <p>
              Here is the information EduPath-AI is using to understand your
              career direction.
            </p>
          </div>

          <div className="ce-section-number">01</div>
        </div>

        {/* ======================================================
           ONBOARDING INFORMATION
        ====================================================== */}

        <section className="ce-card ce-information-card">
          <div className="ce-card-heading">
            <div>
              <span className="ce-card-label">YOUR INFORMATION</span>

              <h2>What we learned from your onboarding</h2>

              <p>
                This information helps us find careers that match your goals and
                interests.
              </p>
            </div>

            <div className="ce-card-heading-icon">✦</div>
          </div>

          <div className="ce-information-grid">
            <div>
              <span>Career Goal</span>
              <strong>{profile?.careerGoal || "Not specified"}</strong>
            </div>

            <div>
              <span>Target Role</span>
              <strong>
                {profile?.placement?.targetRole || "Not specified"}
              </strong>
            </div>

            <div>
              <span>Degree</span>
              <strong>{profile?.education?.degree || "Not specified"}</strong>
            </div>

            <div>
              <span>Branch</span>
              <strong>{profile?.education?.branch || "Not specified"}</strong>
            </div>

            <div>
              <span>Experience Level</span>
              <strong>{profile?.experienceLevel || "Beginner"}</strong>
            </div>

            <div>
              <span>Learning Style</span>
              <strong>{profile?.learningStyle || "Not specified"}</strong>
            </div>
          </div>
        </section>

        {/* ======================================================
           SKILLS + INTERESTS
        ====================================================== */}

        <div className="ce-two-column">
          {/* SKILLS */}

          <section className="ce-card ce-skill-card">
            <div className="ce-card-heading">
              <div>
                <span className="ce-card-label">YOUR SKILLS</span>

                <h2>What you already know</h2>
              </div>

              <div className="ce-count-badge">
                {Array.isArray(profile?.skills) ? profile.skills.length : 0}
              </div>
            </div>

            {Array.isArray(profile?.skills) && profile.skills.length > 0 ? (
              <div className="ce-tag-list">
                {profile.skills.map((skill) => (
                  <span key={skill} className="ce-tag">
                    <span>✓</span>
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="ce-empty-text">
                No skills were added during onboarding.
              </p>
            )}
          </section>

          {/* INTERESTS */}

          <section className="ce-card ce-interest-card">
            <div className="ce-card-heading">
              <div>
                <span className="ce-card-label">YOUR INTERESTS</span>

                <h2>What interests you</h2>
              </div>

              <div className="ce-card-heading-icon">✦</div>
            </div>

            {Array.isArray(profile?.interests) &&
            profile.interests.length > 0 ? (
              <div className="ce-tag-list">
                {profile.interests.map((interest) => (
                  <span key={interest} className="ce-tag ce-interest-tag">
                    {interest}
                  </span>
                ))}
              </div>
            ) : (
              <p className="ce-empty-text">
                No interests were added during onboarding.
              </p>
            )}
          </section>
        </div>

        {/* ======================================================
           RECOMMENDATION SECTION INTRO
        ====================================================== */}

        <div className="ce-section-intro ce-recommendation-intro">
          <div>
            <span className="ce-section-kicker">AI CAREER MATCHING</span>

            <h2>Career options selected for you.</h2>

            <p>
              These recommendations are generated from your onboarding profile
              and available career data.
            </p>
          </div>

          <div className="ce-ai-mark">
            <span>✦</span>
            AI
          </div>
        </div>

        {/* ======================================================
           RECOMMENDED CAREERS
        ====================================================== */}

        <section className="ce-card ce-recommendations-card">
          <div className="ce-card-heading">
            <div>
              <span className="ce-card-label">STEP 01 RESULT</span>

              <h2>Recommended careers</h2>

              <p>Explore a career to continue to Career Selection.</p>
            </div>

            <button
              type="button"
              className="ce-secondary-button"
              onClick={loadRecommendations}
              disabled={recommendationsLoading}
            >
              <span>↻</span>
              {recommendationsLoading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {recommendationsLoading ? (
            <div className="ce-recommendation-loading">
              <div className="career-explorer-spinner" />

              <p>Finding career options for you...</p>
            </div>
          ) : visibleRecommendations.length > 0 ? (
            <div className="ce-recommendation-grid">
              {visibleRecommendations.map((item, index) => {
                const career = item?.career || item;

                const careerId =
                  career?.id ||
                  career?._id ||
                  career?.careerId ||
                  `${career?.slug}-${index}`;

                const recommendationMatch = item?.match || {};

                const recommendationScore = recommendationMatch?.score ?? 0;

                return (
                  <article key={careerId} className="ce-recommendation-card">
                    {/* CARD TOP */}

                    <div className="ce-recommendation-top">
                      <div className="ce-recommendation-icon">
                        {career?.category?.icon || "💼"}
                      </div>

                      <div className="ce-recommendation-score">
                        <strong>{Math.round(recommendationScore)}%</strong>

                        <span>Match</span>
                      </div>
                    </div>

                    {/* CATEGORY */}

                    <span className="ce-card-label">
                      {career?.category?.name || "Career"}
                    </span>

                    {/* CAREER NAME */}

                    <h3>{career?.name || "Career Option"}</h3>

                    {/* DESCRIPTION */}

                    <p>
                      {career?.description ||
                        "Career option based on your profile."}
                    </p>

                    {/* SKILLS */}

                    {Array.isArray(career?.skills) &&
                      career.skills.length > 0 && (
                        <div className="ce-tag-list">
                          {career.skills.slice(0, 4).map((skill) => (
                            <span key={skill} className="ce-tag">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}

                    {/* ACTION */}

                    <div className="ce-recommendation-actions">
                      <button
                        type="button"
                        className="ce-primary-button"
                        onClick={() => handleExploreCareer(item)}
                      >
                        Explore Career
                        <span>→</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="ce-empty-career ce-empty-inline">
              <div className="ce-empty-icon">🔍</div>

              <h3>No career recommendations available</h3>

              <p>
                There are currently no active careers available for your
                profile.
              </p>
            </div>
          )}
        </section>

        {/* ======================================================
           COMPLETE STEP CTA
        ====================================================== */}

        <section className="ce-next-action">
          <div className="ce-next-action-icon">✓</div>

          <div className="ce-next-action-content">
            <span className="ce-card-label">STEP 01 COMPLETE</span>

            <h3>Your career exploration is ready.</h3>

            <p>
              Review the career options above and continue to Career Selection
              when you are ready.
            </p>
          </div>

          <button
            type="button"
            className="ce-primary-button"
            onClick={handleNext}
          >
            Continue
            <span>→</span>
          </button>
        </section>

        {/* ======================================================
           BOTTOM NAVIGATION
        ====================================================== */}

        <section className="ce-action-hub">
          <div className="ce-action-hub-content">
            <span className="ce-card-label">YOUR CAREER JOURNEY</span>

            <h2>Ready for Career Selection?</h2>

            <p>
              Your next step is to review the available career paths and choose
              the one you want to continue with.
            </p>
          </div>

          <div className="ce-action-hub-buttons">
            <button
              type="button"
              className="ce-secondary-button"
              onClick={handleBackToOnboarding}
            >
              <span>←</span>
              Back to Onboarding
            </button>

            <button
              type="button"
              className="ce-primary-button"
              onClick={handleNext}
            >
              Next: Career Selection
              <span>→</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default CareerExplorer;
