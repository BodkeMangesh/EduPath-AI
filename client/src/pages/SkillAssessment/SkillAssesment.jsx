import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  Check,
  ChevronRight,
  Clock3,
  Code2,
  GraduationCap,
  Heart,
  Lightbulb,
  Loader2,
  Target,
  Trophy,
  X,
} from "lucide-react";

import "./SkillAssessment.css";
import api from "../../api/axios";

function SkillAssessment() {
  const navigate = useNavigate();

  const [assessmentId, setAssessmentId] = useState(null);

  const [formData, setFormData] = useState({
    education: "",
    interests: [],
    skills: {
      java: 0,
      javascript: 0,
      python: 0,
      html: 0,
      css: 0,
      sql: 0,
    },
    strengths: [],
    weaknesses: [],
    preferredLearningStyle: "",
    dailyStudyHours: 2,
    careerGoal: "",
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const totalSteps = 4;

  const skillCount = Object.keys(formData.skills).length;

  const completedSkills = Object.values(formData.skills).filter(
    (value) => Number(value) > 0,
  ).length;

  const averageSkill = useMemo(() => {
    const values = Object.values(formData.skills).map(Number);

    if (!values.length) {
      return 0;
    }

    const total = values.reduce((sum, value) => sum + value, 0);

    return Math.round((total / (values.length * 10)) * 100);
  }, [formData.skills]);

  const progressPercentage = Math.round(
    ((currentStep - 1) / (totalSteps - 1)) * 100,
  );

  /*
   * Start Assessment
   */
  useEffect(() => {
    startAssessment();
  }, []);

  const startAssessment = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.post("/assessments/start", {});

      const assessment = response.data?.data;

      if (!assessment?._id) {
        throw new Error("Assessment session was not created.");
      }

      setAssessmentId(assessment._id);

      setFormData((prev) => ({
        ...prev,
        careerGoal: assessment.careerGoal || prev.careerGoal,
      }));
    } catch (err) {
      console.error("Start Assessment Error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to start assessment.",
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * Input Change
   */
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /*
   * Skill Change
   */
  const handleSkillChange = (skill, value) => {
    setFormData((prev) => ({
      ...prev,
      skills: {
        ...prev.skills,
        [skill]: Number(value),
      },
    }));
  };

  /*
   * Interest Change
   */
  const handleInterestChange = (interest) => {
    setFormData((prev) => {
      const exists = prev.interests.includes(interest);

      return {
        ...prev,
        interests: exists
          ? prev.interests.filter((item) => item !== interest)
          : [...prev.interests, interest],
      };
    });
  };

  /*
   * Skill Label
   */
  const formatSkillName = (skill) => {
    return skill
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (char) => char.toUpperCase());
  };

  /*
   * Validation
   */
  const validateStep = () => {
    setError("");

    if (currentStep === 1) {
      if (!formData.education) {
        setError("Please select your education.");
        return false;
      }

      if (!formData.careerGoal.trim()) {
        setError("Please enter your career goal.");
        return false;
      }
    }

    if (currentStep === 2) {
      if (formData.interests.length === 0) {
        setError("Please select at least one area of interest.");
        return false;
      }
    }

    if (currentStep === 3) {
      if (completedSkills === 0) {
        setError("Please rate at least one technical skill.");
        return false;
      }
    }

    if (currentStep === 4) {
      if (!formData.preferredLearningStyle) {
        setError("Please select your preferred learning style.");
        return false;
      }

      if (!formData.dailyStudyHours || Number(formData.dailyStudyHours) < 1) {
        setError("Please enter your daily study hours.");
        return false;
      }
    }

    return true;
  };

  /*
   * Next Step
   */
  const handleNext = () => {
    if (!validateStep()) {
      return;
    }

    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  /*
   * Previous Step
   */
  const handlePrevious = () => {
    setError("");

    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } else {
      navigate("/dashboard");
    }
  };

  /*
   * Submit Assessment
   */
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateStep()) {
      return;
    }

    if (!assessmentId) {
      setError("Assessment session not found. Please restart the assessment.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const payload = {
        ...formData,
        dailyStudyHours: Number(formData.dailyStudyHours),
        skills: Object.fromEntries(
          Object.entries(formData.skills).map(([skill, value]) => [
            skill,
            Number(value),
          ]),
        ),
      };

      const response = await api.put(
        `/assessments/submit/${assessmentId}`,
        payload,
      );

      console.log("===== ASSESSMENT SUBMITTED =====");
      console.log("Assessment Response:", response.data);

      localStorage.setItem("assessmentId", assessmentId);

      const aiAnalysis = response.data?.data?.aiAnalysis;

      console.log("AI Analysis:", aiAnalysis);

      const recommendedCareer = aiAnalysis?.recommendedCareer;

      console.log("Recommended Career:", recommendedCareer);

      const careerId =
        recommendedCareer?.careerId ||
        recommendedCareer?.slug ||
        recommendedCareer?._id;

      if (!careerId) {
        throw new Error(
          "Assessment completed, but recommended career information was not returned.",
        );
      }

      localStorage.setItem("selectedCareerId", careerId);

      console.log(
        "Saved selectedCareerId:",
        localStorage.getItem("selectedCareerId"),
      );

      /*
       * Assessment is now complete.
       *
       * According to the finalized EduPath-AI flow,
       * Skill Assessment should lead into the Roadmap.
       */
      navigate("/roadmap", {
        state: {
          careerId,
          source: "skill-assessment",
          assessmentId,
          recommendedCareer,
        },
      });
    } catch (err) {
      console.error("Submit Assessment Error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to submit assessment.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  /*
   * Loading
   */
  if (loading) {
    return (
      <div className="assessment-page">
        <div className="assessment-loading">
          <div className="assessment-loading-icon">
            <Brain size={32} />
          </div>

          <Loader2 className="assessment-spinner" size={28} />

          <h2>Preparing your assessment...</h2>

          <p>We are creating your personalized assessment session.</p>
        </div>
      </div>
    );
  }

  /*
   * Start Error
   */
  if (error && !assessmentId) {
    return (
      <div className="assessment-page">
        <div className="assessment-error-page">
          <div className="assessment-error-icon">
            <X size={32} />
          </div>

          <h2>Unable to Start Assessment</h2>

          <p>{error}</p>

          <div className="assessment-error-actions">
            <button
              type="button"
              className="assessment-secondary-button"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft size={18} />
              Dashboard
            </button>

            <button
              type="button"
              className="assessment-primary-button"
              onClick={startAssessment}
            >
              Try Again
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="assessment-page">
      <main className="assessment-container">
        {/* =========================
            TOP NAVIGATION
        ========================== */}
        <div className="assessment-topbar">
          <button
            type="button"
            className="assessment-back-button"
            onClick={handlePrevious}
            disabled={submitting}
          >
            <ArrowLeft size={18} />

            <span>{currentStep === 1 ? "Dashboard" : "Previous"}</span>
          </button>

          <div className="assessment-topbar-title">
            <Brain size={20} />

            <span>Skill Assessment</span>
          </div>

          <div className="assessment-step-counter">
            Step {currentStep} of {totalSteps}
          </div>
        </div>

        {/* =========================
            HERO
        ========================== */}
        <section className="assessment-hero">
          <div className="assessment-hero-content">
            <span className="assessment-badge">
              <Brain size={16} />
              EduPath-AI Assessment
            </span>

            <h1>
              Discover where you are
              <span> and where you can go.</span>
            </h1>

            <p>
              Answer a few questions about your background, interests, technical
              skills and learning preferences. EduPath-AI will use your
              responses to build a more personalized career roadmap.
            </p>
          </div>

          <div className="assessment-hero-icon">
            <Brain size={52} />
          </div>
        </section>

        {/* =========================
            PROGRESS
        ========================== */}
        <section className="assessment-progress-card">
          <div className="assessment-progress-header">
            <div>
              <span>Assessment Progress</span>
              <strong>{progressPercentage}% completed</strong>
            </div>

            <div className="assessment-progress-stat">
              <Trophy size={17} />
              Personalized Path
            </div>
          </div>

          <div className="assessment-progress-track">
            <div
              className="assessment-progress-fill"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          <div className="assessment-step-list">
            <div
              className={`assessment-step ${
                currentStep >= 1 ? "active" : ""
              } ${currentStep > 1 ? "completed" : ""}`}
            >
              <span>{currentStep > 1 ? <Check size={15} /> : "1"}</span>
              <div>
                <strong>Profile</strong>
                <small>Background & goals</small>
              </div>
            </div>

            <div
              className={`assessment-step ${
                currentStep >= 2 ? "active" : ""
              } ${currentStep > 2 ? "completed" : ""}`}
            >
              <span>{currentStep > 2 ? <Check size={15} /> : "2"}</span>
              <div>
                <strong>Interests</strong>
                <small>What excites you</small>
              </div>
            </div>

            <div
              className={`assessment-step ${
                currentStep >= 3 ? "active" : ""
              } ${currentStep > 3 ? "completed" : ""}`}
            >
              <span>{currentStep > 3 ? <Check size={15} /> : "3"}</span>
              <div>
                <strong>Skills</strong>
                <small>Your current level</small>
              </div>
            </div>

            <div
              className={`assessment-step ${currentStep >= 4 ? "active" : ""}`}
            >
              <span>4</span>

              <div>
                <strong>Preferences</strong>
                <small>How you learn</small>
              </div>
            </div>
          </div>
        </section>

        {/* =========================
            ERROR
        ========================== */}
        {error && (
          <div className="assessment-form-error">
            <X size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* =========================
            FORM
        ========================== */}
        <form className="assessment-form" onSubmit={handleSubmit}>
          {/* =====================
              STEP 1
          ====================== */}
          {currentStep === 1 && (
            <section className="assessment-section">
              <div className="assessment-section-heading">
                <div className="assessment-section-icon">
                  <GraduationCap size={24} />
                </div>

                <div>
                  <span>STEP 01</span>
                  <h2>Tell us about yourself</h2>
                  <p>Start with your educational background and career goal.</p>
                </div>
              </div>

              <div className="assessment-field">
                <label htmlFor="education">
                  Education
                  <span>*</span>
                </label>

                <select
                  id="education"
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select your education</option>

                  <option value="BSc Computer Science">
                    BSc Computer Science
                  </option>

                  <option value="BCA">BCA</option>

                  <option value="BTech Computer Science">
                    BTech Computer Science
                  </option>

                  <option value="MCA">MCA</option>

                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="assessment-field">
                <label htmlFor="careerGoal">
                  Career Goal
                  <span>*</span>
                </label>

                <textarea
                  id="careerGoal"
                  name="careerGoal"
                  placeholder="Example: Become a Java Full Stack Developer"
                  value={formData.careerGoal}
                  onChange={handleChange}
                  rows={5}
                  required
                />

                <small>
                  Tell us what kind of role or career you want to pursue.
                </small>
              </div>

              <div className="assessment-info-box">
                <Target size={20} />

                <div>
                  <strong>Why we ask this</strong>

                  <p>
                    Your education and career goal help EduPath-AI understand
                    the context behind your skill assessment.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* =====================
              STEP 2
          ====================== */}
          {currentStep === 2 && (
            <section className="assessment-section">
              <div className="assessment-section-heading">
                <div className="assessment-section-icon">
                  <Heart size={24} />
                </div>

                <div>
                  <span>STEP 02</span>
                  <h2>What are you interested in?</h2>
                  <p>
                    Select the areas you would like to explore or build your
                    career in.
                  </p>
                </div>
              </div>

              <div className="assessment-option-grid">
                {[
                  "Web Development",
                  "Backend Development",
                  "Artificial Intelligence",
                  "Data Science",
                  "Cyber Security",
                  "Cloud Computing",
                ].map((interest) => {
                  const selected = formData.interests.includes(interest);

                  return (
                    <button
                      type="button"
                      key={interest}
                      className={`assessment-option-card ${
                        selected ? "selected" : ""
                      }`}
                      onClick={() => handleInterestChange(interest)}
                    >
                      <div className="assessment-option-check">
                        {selected && <Check size={16} />}
                      </div>

                      <span>{interest}</span>

                      <ChevronRight size={18} />
                    </button>
                  );
                })}
              </div>

              <div className="assessment-selection-summary">
                <Lightbulb size={19} />

                <span>
                  {formData.interests.length === 0
                    ? "Select at least one interest."
                    : `${formData.interests.length} interest${
                        formData.interests.length > 1 ? "s" : ""
                      } selected.`}
                </span>
              </div>
            </section>
          )}

          {/* =====================
              STEP 3
          ====================== */}
          {currentStep === 3 && (
            <section className="assessment-section">
              <div className="assessment-section-heading">
                <div className="assessment-section-icon">
                  <Code2 size={24} />
                </div>

                <div>
                  <span>STEP 03</span>
                  <h2>Rate your technical skills</h2>
                  <p>
                    Be honest. This is not an exam — it helps us understand your
                    current starting point.
                  </p>
                </div>
              </div>

              <div className="skill-summary">
                <div className="skill-summary-item">
                  <span>Skills rated</span>
                  <strong>
                    {completedSkills}/{skillCount}
                  </strong>
                </div>

                <div className="skill-summary-item">
                  <span>Current skill level</span>
                  <strong>{averageSkill}%</strong>
                </div>
              </div>

              <div className="assessment-skills-list">
                {Object.entries(formData.skills).map(([skill, value]) => (
                  <div className="assessment-skill-card" key={skill}>
                    <div className="assessment-skill-header">
                      <div>
                        <strong>{formatSkillName(skill)}</strong>

                        <small>Rate your current confidence</small>
                      </div>

                      <div className="assessment-skill-score">
                        {value}
                        <span>/10</span>
                      </div>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="1"
                      value={value}
                      onChange={(event) =>
                        handleSkillChange(skill, event.target.value)
                      }
                    />

                    <div className="skill-scale">
                      <span>Beginner</span>
                      <span>Intermediate</span>
                      <span>Strong</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* =====================
              STEP 4
          ====================== */}
          {currentStep === 4 && (
            <section className="assessment-section">
              <div className="assessment-section-heading">
                <div className="assessment-section-icon">
                  <Clock3 size={24} />
                </div>

                <div>
                  <span>STEP 04</span>
                  <h2>How do you prefer to learn?</h2>
                  <p>
                    Help us understand how we can structure your learning
                    journey.
                  </p>
                </div>
              </div>

              <div className="assessment-field">
                <label htmlFor="preferredLearningStyle">
                  Preferred Learning Style
                  <span>*</span>
                </label>

                <select
                  id="preferredLearningStyle"
                  name="preferredLearningStyle"
                  value={formData.preferredLearningStyle}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select learning style</option>

                  <option value="Project Based">Project Based</option>

                  <option value="Video Based">Video Based</option>

                  <option value="Reading">Reading</option>

                  <option value="Practice Based">Practice Based</option>
                </select>
              </div>

              <div className="assessment-field">
                <label htmlFor="dailyStudyHours">
                  Daily Study Time
                  <span>*</span>
                </label>

                <div className="study-hours-control">
                  <Clock3 size={20} />

                  <input
                    id="dailyStudyHours"
                    type="number"
                    name="dailyStudyHours"
                    min="1"
                    max="12"
                    value={formData.dailyStudyHours}
                    onChange={handleChange}
                    required
                  />

                  <span>hours / day</span>
                </div>
              </div>

              <div className="assessment-final-preview">
                <div className="final-preview-icon">
                  <Trophy size={24} />
                </div>

                <div>
                  <strong>You're ready to build your path.</strong>

                  <p>
                    After submission, EduPath-AI will analyze your answers and
                    connect the recommended career with your roadmap.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* =========================
              BOTTOM NAVIGATION
          ========================== */}
          <div className="assessment-navigation">
            <button
              type="button"
              className="assessment-secondary-button"
              onClick={handlePrevious}
              disabled={submitting}
            >
              <ArrowLeft size={18} />

              {currentStep === 1 ? "Dashboard" : "Previous"}
            </button>

            {currentStep < totalSteps ? (
              <button
                type="button"
                className="assessment-primary-button"
                onClick={handleNext}
                disabled={submitting}
              >
                Continue
                <ArrowRight size={18} />
              </button>
            ) : (
              <button
                type="submit"
                className="assessment-primary-button assessment-submit-button"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="assessment-button-spinner" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    Complete Assessment
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            )}
          </div>

          <div className="assessment-security-note">
            <Brain size={16} />

            <span>
              Your assessment answers are used to personalize your EduPath-AI
              journey.
            </span>
          </div>
        </form>
      </main>
    </div>
  );
}

export default SkillAssessment;
