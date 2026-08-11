import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Learning from "../LearningPath/Learning";
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

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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

      const assessment = response.data.data;

      setAssessmentId(assessment._id);

      // Keep existing backend values if available
      setFormData((prev) => ({
        ...prev,
        careerGoal: assessment.careerGoal || "",
      }));
    } catch (err) {
      console.error("Start Assessment Error:", err);

      setError(err.response?.data?.message || "Unable to start assessment.");
    } finally {
      setLoading(false);
    }
  };

  /*
   * Input Change
   */
  const handleChange = (e) => {
    const { name, value } = e.target;

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
   * Submit Assessment
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!assessmentId) {
      setError("Assessment session not found.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await api.put(
        `/assessments/submit/${assessmentId}`,
        formData,
      );

      console.log("===== ASSESSMENT SUBMITTED =====");

      console.log("Full Response:", response.data);

      // Store assessment ID
      localStorage.setItem("assessmentId", assessmentId);

      // Get AI analysis
      const aiAnalysis = response.data?.data?.aiAnalysis;

      console.log("AI Analysis:", aiAnalysis);

      // Get recommended career
      const recommendedCareer = aiAnalysis?.recommendedCareer;

      console.log("Recommended Career:", recommendedCareer);

      // Get career identifier
      const careerId = recommendedCareer?.careerId || recommendedCareer?.slug;

      console.log("Career ID / Slug:", careerId);

      if (!careerId) {
        throw new Error("Recommended career information was not returned.");
      }

      // IMPORTANT
      // Backend LearningProgress uses career slug
      localStorage.setItem("selectedCareerId", careerId);

      console.log(
        "Saved selectedCareerId:",
        localStorage.getItem("selectedCareerId"),
      );

      // Navigate to Learning
      navigate("/learning");
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
      <div className="assessment-loading">
        <div className="assessment-spinner"></div>

        <h3>Preparing your assessment...</h3>

        <p>We're creating your personalized assessment session.</p>
      </div>
    );
  }

  /*
   * Error
   */
  if (error && !assessmentId) {
    return (
      <div className="assessment-error">
        <div className="assessment-error-icon">⚠️</div>

        <h2>Unable to Start Assessment</h2>

        <p>{error}</p>

        <button onClick={startAssessment}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="skill-assessment">
      {/* Header */}
      <section className="assessment-header">
        <span className="assessment-badge">🧠 AI Career Assessment</span>

        <h1>Understand Your Skills</h1>

        <p>
          Tell us about your education, interests, technical skills, strengths
          and learning preferences.
        </p>

        <div className="assessment-progress">
          <div className="progress-step active">
            <span>1</span>
            Profile
          </div>

          <div className="progress-line"></div>

          <div className="progress-step">
            <span>2</span>
            Skills
          </div>

          <div className="progress-line"></div>

          <div className="progress-step">
            <span>3</span>
            Preferences
          </div>
        </div>
      </section>

      {/* Form */}
      <form className="assessment-form" onSubmit={handleSubmit}>
        {/* Education */}
        <section className="assessment-section">
          <div className="section-title">
            <span>🎓</span>

            <div>
              <h2>Education</h2>
              <p>Tell us about your current education.</p>
            </div>
          </div>

          <select
            name="education"
            value={formData.education}
            onChange={handleChange}
            required
          >
            <option value="">Select your education</option>

            <option value="BSc Computer Science">BSc Computer Science</option>

            <option value="BCA">BCA</option>

            <option value="BTech Computer Science">
              BTech Computer Science
            </option>

            <option value="MCA">MCA</option>

            <option value="Other">Other</option>
          </select>
        </section>

        {/* Interests */}
        <section className="assessment-section">
          <div className="section-title">
            <span>💡</span>

            <div>
              <h2>Your Interests</h2>
              <p>Select the areas you are interested in.</p>
            </div>
          </div>

          <div className="option-grid">
            {[
              "Web Development",
              "Backend Development",
              "Artificial Intelligence",
              "Data Science",
              "Cyber Security",
              "Cloud Computing",
            ].map((interest) => (
              <label
                key={interest}
                className={`option-card ${
                  formData.interests.includes(interest) ? "selected" : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.interests.includes(interest)}
                  onChange={() => handleInterestChange(interest)}
                />

                <span>{interest}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Technical Skills */}
        <section className="assessment-section">
          <div className="section-title">
            <span>💻</span>

            <div>
              <h2>Technical Skills</h2>
              <p>Rate your current skill level from 0 to 10.</p>
            </div>
          </div>

          <div className="skills-grid">
            {Object.entries(formData.skills).map(([skill, value]) => (
              <div className="skill-input" key={skill}>
                <div className="skill-label">
                  <span>
                    {skill
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (char) => char.toUpperCase())}
                  </span>

                  <strong>{value}/10</strong>
                </div>

                <input
                  type="range"
                  min="0"
                  max="10"
                  value={value}
                  onChange={(e) => handleSkillChange(skill, e.target.value)}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Learning Style */}
        <section className="assessment-section">
          <div className="section-title">
            <span>📚</span>

            <div>
              <h2>Learning Preference</h2>
              <p>How do you prefer to learn?</p>
            </div>
          </div>

          <select
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
        </section>

        {/* Study Hours */}
        <section className="assessment-section">
          <div className="section-title">
            <span>⏰</span>

            <div>
              <h2>Daily Study Time</h2>
              <p>How many hours can you study daily?</p>
            </div>
          </div>

          <input
            type="number"
            name="dailyStudyHours"
            min="1"
            max="12"
            value={formData.dailyStudyHours}
            onChange={handleChange}
            required
          />
        </section>

        {/* Career Goal */}
        <section className="assessment-section">
          <div className="section-title">
            <span>🎯</span>

            <div>
              <h2>Career Goal</h2>
              <p>Tell us what you want to achieve.</p>
            </div>
          </div>

          <textarea
            name="careerGoal"
            placeholder="Example: Become a Java Full Stack Developer"
            value={formData.careerGoal}
            onChange={handleChange}
            rows="4"
            required
          />
        </section>

        {/* Error */}
        {error && <div className="assessment-form-error">⚠️ {error}</div>}

        {/* Submit */}
        <div className="assessment-submit">
          <button type="submit" disabled={submitting}>
            {submitting ? "Analyzing Your Profile..." : "Complete Assessment →"}
          </button>

          <p>
            Your answers will be analyzed by EduPath-AI to create your
            personalized learning path.
          </p>
        </div>
      </form>
    </div>
  );
}

export default SkillAssessment;
