import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import careerSelectionService from "../../services/careerSelectionService";
import "./CareerSelection.css";

/* ============================================================
   HELPERS
============================================================ */

const unwrapResponse = (response) => {
  if (!response) {
    return null;
  }

  let data = response?.data ?? response;

  if (data?.success !== undefined && data?.data !== undefined) {
    data = data.data;
  }

  if (
    data?.data &&
    typeof data.data === "object" &&
    !Array.isArray(data.data)
  ) {
    data = data.data;
  }

  return data;
};

const getCareerId = (career) => {
  if (!career) {
    return null;
  }

  return career?._id || career?.id || career?.careerId || career?.slug || null;
};

const getCareerName = (career) => {
  if (!career) {
    return "Career";
  }

  return career?.name || career?.careerName || career?.title || "Career";
};

const getNumber = (value, fallback = 0) => {
  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
};

const getPercentage = (value) => {
  const number = getNumber(value);

  return Math.min(100, Math.max(0, Math.round(number)));
};

const getMatchLabel = (score) => {
  const value = getPercentage(score);

  if (value >= 85) {
    return "Excellent Match";
  }

  if (value >= 70) {
    return "Strong Match";
  }

  if (value >= 55) {
    return "Good Match";
  }

  if (value >= 40) {
    return "Potential Match";
  }

  return "Needs Development";
};

/* ============================================================
   COMPONENT
============================================================ */

const CareerSelection = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const careerIdFromUrl = searchParams.get("careerId");

  /* ============================================================
     STATE
  ============================================================ */

  const [selectionData, setSelectionData] = useState(null);

  const [actualSelectionData, setActualSelectionData] = useState(null);

  const [loading, setLoading] = useState(true);

  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");

  const [actionError, setActionError] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  const [showLoginPopup, setShowLoginPopup] = useState(false);

  /* ============================================================
     LOAD CAREER
  ============================================================ */

  const loadCareerSelection = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      /*
       * If Career Explorer sends a careerId,
       * load that career.
       *
       * Otherwise load the user's currently
       * selected career.
       */

      const response = await careerSelectionService.getCareerSelection(
        careerIdFromUrl || null,
      );

      const data = unwrapResponse(response);

      setSelectionData(data);

      /*
       * Also fetch the actual selected career
       * from the user's profile.
       */

      try {
        const actualResponse =
          await careerSelectionService.getCareerSelection();

        const actualData = unwrapResponse(actualResponse);

        setActualSelectionData(actualData);
      } catch (actualError) {
        /*
         * This request is supplementary.
         * The main career request can still
         * be used if it succeeds.
         */

        console.warn("Unable to fetch actual selected career.", actualError);

        setActualSelectionData(null);
      }
    } catch (err) {
      console.error("Career Selection Load Error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load career selection.",
      );
    } finally {
      setLoading(false);
    }
  }, [careerIdFromUrl]);

  /* ============================================================
     INITIAL LOAD
  ============================================================ */

  useEffect(() => {
    loadCareerSelection();
  }, [loadCareerSelection]);

  /* ============================================================
     CURRENT CAREER
  ============================================================ */

  const currentCareer = useMemo(() => {
    if (!selectionData) {
      return null;
    }

    return (
      selectionData?.selection?.career ||
      selectionData?.selectedCareer ||
      selectionData?.career ||
      selectionData?.selected ||
      null
    );
  }, [selectionData]);

  /* ============================================================
     ACTUAL SELECTED CAREER
  ============================================================ */

  const actualSelectedCareer = useMemo(() => {
    if (!actualSelectionData) {
      return null;
    }

    return (
      actualSelectionData?.selection?.career ||
      actualSelectionData?.selectedCareer ||
      actualSelectionData?.career ||
      actualSelectionData?.selected ||
      null
    );
  }, [actualSelectionData]);

  /* ============================================================
     IDS
  ============================================================ */

  const currentCareerId = getCareerId(currentCareer);

  const actualSelectedCareerId = getCareerId(actualSelectedCareer);

  /* ============================================================
     LOCK STATE
  ============================================================ */

  const isCurrentCareerSelected =
    Boolean(currentCareerId) &&
    Boolean(actualSelectedCareerId) &&
    String(currentCareerId) === String(actualSelectedCareerId);

  /* ============================================================
     SELECTION DATA
  ============================================================ */

  const selectionSummary = useMemo(() => {
    return selectionData?.selection || {};
  }, [selectionData]);

  /* ============================================================
     MATCH DATA
  ============================================================ */

  const matchData = useMemo(() => {
    return (
      selectionSummary?.match ||
      selectionData?.match ||
      selectionSummary?.decisionSupport ||
      selectionData?.decisionSupport ||
      {}
    );
  }, [selectionSummary, selectionData]);

  const matchScore = getPercentage(
    matchData?.score ??
      matchData?.matchScore ??
      selectionData?.matchScore ??
      currentCareer?.matchScore ??
      0,
  );

  const matchLevel =
    matchData?.level || matchData?.matchLevel || getMatchLabel(matchScore);

  /* ============================================================
     SKILLS
  ============================================================ */

  const requiredSkills = useMemo(() => {
    const skills =
      currentCareer?.requiredSkills ||
      currentCareer?.skills ||
      selectionSummary?.requiredSkills ||
      selectionData?.requiredSkills ||
      [];

    return Array.isArray(skills) ? skills : [];
  }, [currentCareer, selectionSummary, selectionData]);

  const skillMatch = useMemo(() => {
    return (
      matchData?.skillMatch ||
      selectionSummary?.skillMatch ||
      selectionData?.skillMatch ||
      {}
    );
  }, [matchData, selectionSummary, selectionData]);

  const matchedSkills = useMemo(() => {
    if (Array.isArray(skillMatch?.matchedSkills)) {
      return skillMatch.matchedSkills;
    }

    if (Array.isArray(skillMatch?.matched)) {
      return skillMatch.matched;
    }

    return [];
  }, [skillMatch]);

  const missingSkills = useMemo(() => {
    if (Array.isArray(skillMatch?.missingSkills)) {
      return skillMatch.missingSkills;
    }

    if (Array.isArray(selectionSummary?.missingSkills)) {
      return selectionSummary.missingSkills;
    }

    if (Array.isArray(selectionData?.missingSkills)) {
      return selectionData.missingSkills;
    }

    return [];
  }, [skillMatch, selectionSummary, selectionData]);

  const skillMatchPercentage = getPercentage(
    skillMatch?.skillMatchPercentage ??
      skillMatch?.percentage ??
      (requiredSkills.length
        ? (matchedSkills.length / requiredSkills.length) * 100
        : 0),
  );

  /* ============================================================
     EDUCATION / ELIGIBILITY
  ============================================================ */

  const eligibility = useMemo(() => {
    const data =
      currentCareer?.eligibility ||
      selectionSummary?.eligibility ||
      selectionData?.eligibility ||
      [];

    return Array.isArray(data) ? data : [];
  }, [currentCareer, selectionSummary, selectionData]);

  /* ============================================================
     CAREER INFORMATION
  ============================================================ */

  const description =
    currentCareer?.description ||
    selectionSummary?.description ||
    "Career information is not available yet.";

  const category =
    currentCareer?.category?.name ||
    currentCareer?.categoryName ||
    (typeof currentCareer?.category === "string"
      ? currentCareer.category
      : "Career");

  const salary =
    currentCareer?.averageSalary ||
    currentCareer?.salary ||
    selectionSummary?.averageSalary ||
    "Not available";

  const growthRate =
    currentCareer?.growthRate ||
    selectionSummary?.growthRate ||
    "Not available";

  const demand =
    currentCareer?.demand || selectionSummary?.demand || "Not available";

  /* ============================================================
     PROFILE / MATCH REASONS
  ============================================================ */

  const goalMatch = getPercentage(
    matchData?.goalMatch ?? matchData?.goalMatchPercentage ?? 0,
  );

  const interestMatch = getPercentage(
    matchData?.interestMatch ?? matchData?.interestMatchPercentage ?? 0,
  );

  const eligibilityScore = getPercentage(
    matchData?.eligibilityMatch?.score ?? matchData?.eligibilityMatch ?? 0,
  );

  const matchReason =
    matchData?.reason ||
    selectionSummary?.reason ||
    selectionData?.reason ||
    "This career is being evaluated using your onboarding information, skills, interests, education and career goal.";

  /* ============================================================
     SELECT CAREER
  ============================================================ */

  const handleSelectCareer = async () => {
    if (!currentCareerId) {
      setActionError("Career information is missing.");

      return;
    }

    if (isCurrentCareerSelected) {
      setShowLoginPopup(true);

      return;
    }

    try {
      setActionLoading(true);
      setActionError("");
      setSuccessMessage("");

      const response =
        await careerSelectionService.selectCareer(currentCareerId);

      const data = unwrapResponse(response);

      const selectedCareer =
        data?.selection?.career ||
        data?.selectedCareer ||
        data?.career ||
        currentCareer;

      localStorage.setItem("selectedCareerId", String(currentCareerId));

      /*
       * Refresh the selected career data after
       * successful MongoDB update.
       */

      const [requestedResponse, actualResponse] = await Promise.all([
        careerSelectionService.getCareerSelection(currentCareerId),
        careerSelectionService.getCareerSelection(),
      ]);

      const refreshedRequested = unwrapResponse(requestedResponse);

      const refreshedActual = unwrapResponse(actualResponse);

      setSelectionData(refreshedRequested);

      setActualSelectionData(refreshedActual);

      setSuccessMessage(
        `${getCareerName(selectedCareer)} has been selected successfully.`,
      );

      /*
       * IMPORTANT:
       * Do NOT navigate directly to login.
       *
       * Show login popup on the same page.
       */

      setShowLoginPopup(true);
    } catch (err) {
      console.error("Career Select Error:", err);

      setActionError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to select this career.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* ============================================================
     BACK TO CAREER EXPLORER
  ============================================================ */

  const handleBackToExplorer = () => {
    navigate("/career-explorer");
  };

  /* ============================================================
     LOGIN
  ============================================================ */

  const handleLogin = () => {
    setShowLoginPopup(false);

    navigate("/login");
  };

  /* ============================================================
     LOADING
  ============================================================ */

  if (loading) {
    return (
      <div className="career-selection-page">
        <div className="career-selection-container">
          <div className="career-selection-loading">
            <div className="cs-loading-spinner" />

            <span className="cs-eyebrow">CAREER SELECTION</span>

            <h2>Preparing your career selection...</h2>

            <p>
              We are loading the career information based on your Career
              Explorer selection.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ============================================================
     ERROR
  ============================================================ */

  if (error) {
    return (
      <div className="career-selection-page">
        <div className="career-selection-container">
          <div className="career-selection-error">
            <div className="cs-error-icon">!</div>

            <span className="cs-eyebrow">CAREER SELECTION</span>

            <h2>Unable to load Career Selection</h2>

            <p>{error}</p>

            <div className="cs-error-actions">
              <button
                type="button"
                className="cs-primary-button"
                onClick={loadCareerSelection}
              >
                Try Again
              </button>

              <button
                type="button"
                className="cs-secondary-button"
                onClick={handleBackToExplorer}
              >
                ← Career Explorer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ============================================================
     EMPTY CAREER
  ============================================================ */

  if (!currentCareer) {
    return (
      <div className="career-selection-page">
        <div className="career-selection-container">
          <header className="career-selection-header">
            <div>
              <span className="cs-eyebrow">STEP 2 OF 2</span>

              <h1>Career Selection</h1>

              <p>Choose a career from Career Explorer to continue.</p>
            </div>

            <button
              type="button"
              className="cs-secondary-button"
              onClick={handleBackToExplorer}
            >
              ← Career Explorer
            </button>
          </header>

          <section className="cs-empty-state">
            <div className="cs-empty-icon">◎</div>

            <h2>No career selected for review</h2>

            <p>
              Please go back to Career Explorer and choose a career before
              continuing.
            </p>

            <button
              type="button"
              className="cs-primary-button"
              onClick={handleBackToExplorer}
            >
              Go to Career Explorer →
            </button>
          </section>
        </div>
      </div>
    );
  }

  /* ============================================================
     MAIN PAGE
  ============================================================ */

  return (
    <div className="career-selection-page">
      <div className="career-selection-container">
        {/* ======================================================
           TOP NAVIGATION
        ====================================================== */}

        <div className="cs-step-navigation">
          <button
            type="button"
            className="cs-secondary-button"
            onClick={handleBackToExplorer}
          >
            ← Back to Career Explorer
          </button>

          <div className="cs-step-indicator">
            <span className="cs-step-active">1</span>
            <span className="cs-step-line" />
            <span className="cs-step-active">2</span>
          </div>
        </div>

        {/* ======================================================
           HEADER
        ====================================================== */}

        <header className="career-selection-header">
          <div>
            <span className="cs-eyebrow">STEP 2 OF 2 · CAREER SELECTION</span>

            <h1>
              Choose your{" "}
              <span className="cs-heading-highlight">career path</span>
            </h1>

            <p>
              Review the career recommended from your onboarding information and
              Career Explorer before making your selection.
            </p>
          </div>
        </header>

        {/* ======================================================
           SUCCESS
        ====================================================== */}

        {successMessage && (
          <div className="cs-success-message">
            <span>✓</span>

            <div>
              <strong>Career selection saved</strong>

              <p>{successMessage}</p>
            </div>
          </div>
        )}

        {/* ======================================================
           ERROR
        ====================================================== */}

        {actionError && (
          <div className="cs-action-error">
            <span>!</span>

            <p>{actionError}</p>
          </div>
        )}

        {/* ======================================================
           CAREER HERO
        ====================================================== */}

        <section className="cs-career-hero">
          <div className="cs-career-identity">
            <div className="cs-career-icon">
              {getCareerName(currentCareer).charAt(0).toUpperCase()}
            </div>

            <div>
              <span className="cs-card-label">
                {isCurrentCareerSelected
                  ? "SELECTED CAREER"
                  : "CAREER FROM EXPLORER"}
              </span>

              <h2>{getCareerName(currentCareer)}</h2>

              <div className="cs-career-meta">
                <span>{category}</span>

                {currentCareer?.slug && <span>{currentCareer.slug}</span>}
              </div>
            </div>
          </div>

          <div className="cs-hero-score">
            <div className="cs-score-circle">
              <strong>{matchScore}%</strong>

              <span>MATCH</span>
            </div>

            <div>
              <span className="cs-score-label">Career Fit</span>

              <strong>{matchLevel}</strong>
            </div>
          </div>
        </section>

        {/* ======================================================
           SELECTED STATUS
        ====================================================== */}

        <section
          className={`cs-career-lock-banner ${
            isCurrentCareerSelected ? "locked" : "exploring"
          }`}
        >
          <div className="cs-lock-status-icon">
            {isCurrentCareerSelected ? "✓" : "→"}
          </div>

          <div className="cs-lock-status-content">
            <span>
              {isCurrentCareerSelected
                ? "CAREER SELECTED"
                : "READY FOR YOUR DECISION"}
            </span>

            <strong>
              {isCurrentCareerSelected
                ? `${getCareerName(
                    currentCareer,
                  )} is saved as your selected career.`
                : `Review ${getCareerName(
                    currentCareer,
                  )} and select it if it matches your career goal.`}
            </strong>

            <p>
              {isCurrentCareerSelected
                ? "Your career selection has been saved successfully."
                : "Your selection will be saved to your EduPath-AI profile."}
            </p>
          </div>

          <div className="cs-lock-status-action">
            {isCurrentCareerSelected ? (
              <span className="cs-locked-badge">✓ Selected</span>
            ) : (
              <button
                type="button"
                className="cs-primary-button"
                disabled={actionLoading}
                onClick={handleSelectCareer}
              >
                {actionLoading ? "Saving..." : "Select This Career →"}
              </button>
            )}
          </div>
        </section>

        {/* ======================================================
           MATCH SUMMARY
        ====================================================== */}

        <section className="cs-grid cs-grid-4">
          <article className="cs-stat-card">
            <span className="cs-card-label">CAREER MATCH</span>

            <strong>{matchScore}%</strong>

            <span>{matchLevel}</span>
          </article>

          <article className="cs-stat-card">
            <span className="cs-card-label">SKILL MATCH</span>

            <strong>{skillMatchPercentage}%</strong>

            <span>
              {matchedSkills.length} of {requiredSkills.length} skills
            </span>
          </article>

          <article className="cs-stat-card">
            <span className="cs-card-label">GOAL MATCH</span>

            <strong>{goalMatch}%</strong>

            <span>Your stated career goal</span>
          </article>

          <article className="cs-stat-card">
            <span className="cs-card-label">INTEREST MATCH</span>

            <strong>{interestMatch}%</strong>

            <span>Your selected interests</span>
          </article>
        </section>

        {/* ======================================================
           WHY THIS CAREER
        ====================================================== */}

        <section className="cs-card cs-ai-explanation">
          <div className="cs-card-heading">
            <div>
              <span className="cs-card-label">CAREER FIT</span>

              <h2>Why this career was shown to you</h2>
            </div>

            <span className="cs-ai-badge">Profile Based</span>
          </div>

          <p>{matchReason}</p>

          <div className="cs-match-breakdown">
            <div>
              <span>Goal Match</span>

              <strong>{goalMatch}%</strong>
            </div>

            <div>
              <span>Interest Match</span>

              <strong>{interestMatch}%</strong>
            </div>

            <div>
              <span>Eligibility</span>

              <strong>{eligibilityScore}%</strong>
            </div>
          </div>
        </section>

        {/* ======================================================
           CAREER DESCRIPTION
        ====================================================== */}

        <section className="cs-card">
          <div className="cs-card-heading">
            <div>
              <span className="cs-card-label">ABOUT THIS CAREER</span>

              <h2>{getCareerName(currentCareer)}</h2>
            </div>
          </div>

          <div className="cs-description">
            <p>{description}</p>
          </div>
        </section>

        {/* ======================================================
           CAREER REALITY
        ====================================================== */}

        <section className="cs-card">
          <div className="cs-card-heading">
            <div>
              <span className="cs-card-label">CAREER INFORMATION</span>

              <h2>Career overview</h2>
            </div>
          </div>

          <div className="cs-information-grid">
            <div>
              <span>Average Salary</span>

              <strong>{salary}</strong>
            </div>

            <div>
              <span>Growth</span>

              <strong>{growthRate}</strong>
            </div>

            <div>
              <span>Market Demand</span>

              <strong>{demand}</strong>
            </div>
          </div>
        </section>

        {/* ======================================================
           REQUIRED SKILLS
        ====================================================== */}

        <section className="cs-card">
          <div className="cs-card-heading">
            <div>
              <span className="cs-card-label">CAREER REQUIREMENTS</span>

              <h2>Skills required for this career</h2>
            </div>

            <span className="cs-count-badge">
              {requiredSkills.length} skills
            </span>
          </div>

          {requiredSkills.length > 0 ? (
            <div className="cs-required-skill-grid">
              {requiredSkills.map((skill, index) => {
                const skillName = skill?.name || skill?.skill || skill;

                return (
                  <div
                    className="cs-required-skill"
                    key={`${String(skillName)}-${index}`}
                  >
                    <span className="cs-required-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <span>{String(skillName)}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="cs-small-empty">
              Required skill information is not available yet.
            </div>
          )}
        </section>

        {/* ======================================================
           SKILLS YOU HAVE
        ====================================================== */}

        <section className="cs-card">
          <div className="cs-card-heading">
            <div>
              <span className="cs-card-label">YOUR CURRENT PROFILE</span>

              <h2>Skills you already have</h2>
            </div>
          </div>

          {matchedSkills.length > 0 ? (
            <div className="cs-skill-list">
              {matchedSkills.map((skill, index) => {
                const skillName = skill?.name || skill?.skill || skill;

                return (
                  <span
                    className="cs-skill-pill matched"
                    key={`${String(skillName)}-${index}`}
                  >
                    ✓ {String(skillName)}
                  </span>
                );
              })}
            </div>
          ) : (
            <p className="cs-muted-text">
              No directly matched skills were found in your current profile.
            </p>
          )}
        </section>

        {/* ======================================================
           SKILLS TO DEVELOP
        ====================================================== */}

        <section className="cs-card">
          <div className="cs-card-heading">
            <div>
              <span className="cs-card-label">SKILL GAP</span>

              <h2>Skills you may need to develop</h2>
            </div>
          </div>

          {missingSkills.length > 0 ? (
            <div className="cs-skill-list">
              {missingSkills.map((skill, index) => {
                const skillName = skill?.name || skill?.skill || skill;

                return (
                  <span
                    className="cs-skill-pill missing"
                    key={`${String(skillName)}-${index}`}
                  >
                    + {String(skillName)}
                  </span>
                );
              })}
            </div>
          ) : (
            <p className="cs-muted-text">
              No missing skills were reported for this career.
            </p>
          )}
        </section>

        {/* ======================================================
           ELIGIBILITY
        ====================================================== */}

        <section className="cs-card">
          <div className="cs-card-heading">
            <div>
              <span className="cs-card-label">ELIGIBILITY</span>

              <h2>What this career expects</h2>
            </div>
          </div>

          {eligibility.length > 0 ? (
            <div className="cs-eligibility-list">
              {eligibility.map((item, index) => (
                <div
                  className="cs-eligibility-item"
                  key={`${String(item)}-${index}`}
                >
                  <span>✓</span>

                  <p>{String(item)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="cs-small-empty">
              Eligibility information is not available yet.
            </div>
          )}
        </section>

        {/* ======================================================
           FINAL DECISION
        ====================================================== */}

        <section className="cs-action-hub">
          <div className="cs-action-hub-content">
            <span className="cs-eyebrow">
              {isCurrentCareerSelected ? "CAREER SELECTED" : "READY TO DECIDE?"}
            </span>

            <h2>
              {isCurrentCareerSelected
                ? "Your career selection is saved."
                : `Ready to select ${getCareerName(currentCareer)}?`}
            </h2>

            <p>
              {isCurrentCareerSelected
                ? "Your selection has been saved. Login will be required when you want to continue to the next stage."
                : "Review the information above. If this career matches your goals and interests, select it to save your career choice."}
            </p>
          </div>

          <div className="cs-action-buttons">
            <button
              type="button"
              className="cs-secondary-button"
              onClick={handleBackToExplorer}
            >
              ← Back to Explorer
            </button>

            {!isCurrentCareerSelected && (
              <button
                type="button"
                className="cs-primary-button"
                disabled={actionLoading || !currentCareerId}
                onClick={handleSelectCareer}
              >
                {actionLoading ? "Saving..." : "Select This Career →"}
              </button>
            )}

            {isCurrentCareerSelected && (
              <button
                type="button"
                className="cs-primary-button"
                onClick={() => setShowLoginPopup(true)}
              >
                Continue to Login →
              </button>
            )}
          </div>
        </section>

        {/* ======================================================
           LOGIN REQUIRED POPUP
        ====================================================== */}

        {showLoginPopup && (
          <div
            className="cs-modal-overlay"
            onClick={() => setShowLoginPopup(false)}
          >
            <div
              className="cs-login-modal"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="cs-login-icon">✓</div>

              <span className="cs-card-label">CAREER SELECTION COMPLETE</span>

              <h2>Your career has been selected!</h2>

              <p>
                <strong>{getCareerName(currentCareer)}</strong> has been saved
                to your profile successfully.
              </p>

              <p>
                Login is required to continue with your personalized EduPath-AI
                journey.
              </p>

              <div className="cs-login-modal-actions">
                <button
                  type="button"
                  className="cs-secondary-button"
                  onClick={() => setShowLoginPopup(false)}
                >
                  Stay Here
                </button>

                <button
                  type="button"
                  className="cs-primary-button"
                  onClick={handleLogin}
                >
                  Login →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CareerSelection;
