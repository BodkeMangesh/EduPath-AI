import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  FileText,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
  Upload,
  XCircle,
} from "lucide-react";

import {
  getResumeAnalysis,
  analyzeResume,
  uploadResume,
} from "../../services/resumeAnalyzerService";

import "./ResumeAnalyzer.css";

const getScore = (value) => {
  const score = Number(value);

  if (Number.isNaN(score)) {
    return 0;
  }

  return Math.max(0, Math.min(100, score));
};

const getScoreLabel = (score) => {
  if (score >= 85) {
    return "Excellent";
  }

  if (score >= 70) {
    return "Strong";
  }

  if (score >= 55) {
    return "Good";
  }

  if (score >= 40) {
    return "Needs Improvement";
  }

  return "Needs Attention";
};

const getPriorityClass = (priority) => {
  switch (priority) {
    case "high":
      return "priority-high";

    case "low":
      return "priority-low";

    default:
      return "priority-medium";
  }
};

const getSafeArray = (value) => {
  return Array.isArray(value) ? value : [];
};

const getApiErrorMessage = (error) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Something went wrong. Please try again."
  );
};

const getCareerName = (targetCareer) => {
  if (!targetCareer) {
    return "Career not selected";
  }

  if (typeof targetCareer === "string") {
    return targetCareer;
  }

  return (
    targetCareer?.name ||
    targetCareer?.title ||
    targetCareer?.careerId ||
    "Career not selected"
  );
};

function ScoreCard({ title, score, icon: Icon, description }) {
  const safeScore = getScore(score);

  return (
    <div className="resume-score-card">
      <div className="resume-score-card-top">
        <div className="resume-score-icon">
          <Icon size={20} />
        </div>

        <div className="resume-score-content">
          <span className="resume-score-title">{title}</span>
          <strong>{safeScore}%</strong>
        </div>
      </div>

      <div className="resume-score-bar">
        <div className="resume-score-fill" style={{ width: `${safeScore}%` }} />
      </div>

      <div className="resume-score-bottom">
        <span>{getScoreLabel(safeScore)}</span>

        {description && <small>{description}</small>}
      </div>
    </div>
  );
}

function ResumeAnalyzer() {
  const navigate = useNavigate();

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  const loadAnalysis = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getResumeAnalysis();

      setAnalysis(data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalysis();
  }, [loadAnalysis]);

  const handleResumeUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setError("");
      setAnalyzing(true);

      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (!allowedTypes.includes(file.type)) {
        throw new Error("Only PDF, DOC, and DOCX files are allowed.");
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error("Resume file must be smaller than 5 MB.");
      }

      const data = await uploadResume(file);

      setAnalysis(data);
    } catch (err) {
      setError(
        err?.response?.data?.message || err?.message || "Resume upload failed.",
      );
    } finally {
      setAnalyzing(false);
      event.target.value = "";
    }
  };

  const handleAnalyze = async () => {
    try {
      setAnalyzing(true);
      setError("");

      const data = await analyzeResume();

      setAnalysis(data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setAnalyzing(false);
    }
  };

  const score = analysis?.score || {};
  const skills = analysis?.skills || {};
  const keywords = analysis?.keywords || {};
  const experience = analysis?.experience || {};
  const projects = analysis?.projects || {};
  const education = analysis?.education || {};
  const atsAnalysis = analysis?.atsAnalysis || {};
  const careerAlignment = analysis?.careerAlignment || {};

  const suggestions = getSafeArray(analysis?.suggestions);
  const strengths = getSafeArray(analysis?.strengths);
  const weaknesses = getSafeArray(analysis?.weaknesses);

  const matchedSkills = getSafeArray(skills?.matched);
  const missingSkills = getSafeArray(skills?.missing);
  const detectedSkills = getSafeArray(skills?.detected);

  const matchedKeywords = getSafeArray(keywords?.matched);
  const missingKeywords = getSafeArray(keywords?.missing);
  const importantKeywords = getSafeArray(keywords?.important);

  const targetCareerName = getCareerName(analysis?.targetCareer);
  const overallScore = getScore(score?.overall);

  const resumeUploaded = Boolean(analysis?.resume?.uploaded);
  const isAnalyzed = analysis?.status === "completed";

  const lastAnalyzedAt = analysis?.lastAnalyzedAt
    ? new Date(analysis.lastAnalyzedAt).toLocaleString()
    : "Not analyzed yet";

  const highPrioritySuggestions = useMemo(() => {
    return suggestions.filter((suggestion) => suggestion?.priority === "high");
  }, [suggestions]);

  if (loading) {
    return (
      <div className="resume-analyzer-page">
        <div className="resume-loading-state">
          <div className="resume-loading-spinner">
            <RefreshCw size={24} />
          </div>

          <h2>Loading Resume Analyzer...</h2>

          <p>Getting your resume analysis and career alignment data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="resume-analyzer-page">
      {/* Header */}
      <section className="resume-analyzer-header">
        <div className="resume-header-content">
          <div className="resume-header-icon">
            <FileText size={26} />
          </div>

          <div>
            <span className="resume-header-label">Placement Preparation</span>

            <h1>Resume Analyzer</h1>

            <p>
              Understand how your resume matches your selected career, identify
              gaps, and improve your placement readiness.
            </p>
          </div>
        </div>

        <div className="resume-header-actions">
          <button
            type="button"
            className="resume-refresh-button"
            onClick={loadAnalysis}
            disabled={loading || analyzing}
          >
            <RefreshCw size={17} />
            Refresh
          </button>

          <button
            type="button"
            className="resume-analyze-button"
            onClick={handleAnalyze}
            disabled={analyzing || !resumeUploaded}
          >
            {analyzing ? (
              <>
                <RefreshCw size={17} className="resume-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles size={17} />
                Analyze Resume
              </>
            )}
          </button>
        </div>
      </section>

      {/* Error */}
      {error && (
        <section className="resume-error-box">
          <AlertCircle size={20} />

          <div>
            <strong>Unable to load Resume Analyzer</strong>
            <p>{error}</p>
          </div>

          <button type="button" onClick={loadAnalysis}>
            Try Again
          </button>
        </section>
      )}

      {/* Resume Status */}
      <section className="resume-status-card">
        <div className="resume-status-left">
          <div className="resume-file-icon">
            <FileText size={24} />
          </div>

          <div>
            <span className="resume-status-label">Current Resume</span>

            <h2>{analysis?.resume?.fileName || "Resume not uploaded"}</h2>

            <p>
              {resumeUploaded
                ? `Last analyzed: ${lastAnalyzedAt}`
                : "Upload your resume to begin resume analysis."}
            </p>
          </div>
        </div>

        <div className="resume-status-right">
          <span
            className={
              resumeUploaded
                ? "resume-upload-status uploaded"
                : "resume-upload-status not-uploaded"
            }
          >
            {resumeUploaded ? (
              <>
                <CheckCircle2 size={16} />
                Uploaded
              </>
            ) : (
              <>
                <XCircle size={16} />
                Not Uploaded
              </>
            )}
          </span>

          <button
            type="button"
            className="resume-upload-button"
            onClick={() => {
              document.getElementById("resume-upload-input")?.click();
            }}
            disabled={analyzing}
          >
            <Upload size={17} />
            Upload Resume
          </button>

          <input
            id="resume-upload-input"
            type="file"
            accept=".pdf,.doc,.docx"
            className="resume-hidden-input"
            onChange={handleResumeUpload}
          />
        </div>
      </section>

      {/* Target Career */}
      <section className="resume-career-card">
        <div className="resume-career-icon">
          <Target size={21} />
        </div>

        <div className="resume-career-content">
          <span>Resume Target</span>

          <h2>{targetCareerName}</h2>

          <p>
            Target role:{" "}
            <strong>{analysis?.targetRole || targetCareerName}</strong>
          </p>
        </div>
      </section>

      {/* Overall Score */}
      <section className="resume-overview-grid">
        <div className="resume-overall-card">
          <div className="resume-overall-header">
            <div>
              <span>Overall Resume Score</span>

              <h2>
                {overallScore}
                <small>/100</small>
              </h2>
            </div>

            <div className="resume-overall-icon">
              <BarChart3 size={24} />
            </div>
          </div>

          <div className="resume-overall-progress">
            <div
              className="resume-overall-progress-fill"
              style={{ width: `${overallScore}%` }}
            />
          </div>

          <div className="resume-overall-footer">
            <strong>{getScoreLabel(overallScore)}</strong>

            <span>
              {isAnalyzed
                ? "Based on your current profile and career alignment."
                : "Analyze your profile to calculate your score."}
            </span>
          </div>
        </div>

        <div className="resume-alignment-card">
          <div className="resume-alignment-top">
            <div>
              <span>Career Alignment</span>

              <h2>{getScore(careerAlignment?.score)}%</h2>
            </div>

            <TrendingUp size={23} />
          </div>

          <p>
            How closely your current skills and profile match your selected
            career.
          </p>

          <div className="resume-alignment-bar">
            <div
              className="resume-alignment-fill"
              style={{
                width: `${getScore(careerAlignment?.score)}%`,
              }}
            />
          </div>
        </div>
      </section>

      {/* Score Breakdown */}
      <section className="resume-section">
        <div className="resume-section-heading">
          <div>
            <span>Analysis Breakdown</span>
            <h2>Resume Health</h2>
          </div>
        </div>

        <div className="resume-score-grid">
          <ScoreCard
            title="ATS Score"
            score={score?.ats}
            icon={Target}
            description="Applicant tracking compatibility"
          />

          <ScoreCard
            title="Skills"
            score={score?.skills}
            icon={BarChart3}
            description="Career-relevant skills"
          />

          <ScoreCard
            title="Experience"
            score={score?.experience}
            icon={TrendingUp}
            description="Experience profile"
          />

          <ScoreCard
            title="Projects"
            score={score?.projects}
            icon={FileText}
            description="Project strength"
          />

          <ScoreCard
            title="Education"
            score={score?.education}
            icon={CheckCircle2}
            description="Education relevance"
          />

          <ScoreCard
            title="Formatting"
            score={score?.formatting}
            icon={FileText}
            description="Resume structure"
          />

          <ScoreCard
            title="Keywords"
            score={score?.keywords}
            icon={Sparkles}
            description="Important career keywords"
          />
        </div>
      </section>

      {/* Skills */}
      <section className="resume-two-column">
        <div className="resume-detail-card">
          <div className="resume-card-heading">
            <div className="resume-card-heading-icon success">
              <CheckCircle2 size={19} />
            </div>

            <div>
              <span>Skills</span>
              <h2>Matched Skills</h2>
            </div>
          </div>

          {matchedSkills.length > 0 ? (
            <div className="resume-tag-list">
              {matchedSkills.map((skill, index) => (
                <span
                  className="resume-tag resume-tag-success"
                  key={`${skill}-${index}`}
                >
                  <CheckCircle2 size={14} />
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <div className="resume-empty-small">
              No matched skills found yet.
            </div>
          )}
        </div>

        <div className="resume-detail-card">
          <div className="resume-card-heading">
            <div className="resume-card-heading-icon danger">
              <XCircle size={19} />
            </div>

            <div>
              <span>Skills</span>
              <h2>Missing Skills</h2>
            </div>
          </div>

          {missingSkills.length > 0 ? (
            <div className="resume-tag-list">
              {missingSkills.map((skill, index) => (
                <span
                  className="resume-tag resume-tag-danger"
                  key={`${skill}-${index}`}
                >
                  <XCircle size={14} />
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <div className="resume-empty-small">
              No missing skills detected.
            </div>
          )}
        </div>
      </section>

      {/* Detected Skills */}
      <section className="resume-detail-card resume-full-card">
        <div className="resume-card-heading">
          <div className="resume-card-heading-icon info">
            <Sparkles size={19} />
          </div>

          <div>
            <span>Profile Analysis</span>
            <h2>Detected Skills</h2>
          </div>
        </div>

        {detectedSkills.length > 0 ? (
          <div className="resume-tag-list">
            {detectedSkills.map((skill, index) => (
              <span
                className="resume-tag resume-tag-neutral"
                key={`${skill}-${index}`}
              >
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <div className="resume-empty-small">
            No detected skills available yet.
          </div>
        )}
      </section>

      {/* Keywords */}
      <section className="resume-two-column">
        <div className="resume-detail-card">
          <div className="resume-card-heading">
            <div className="resume-card-heading-icon success">
              <CheckCircle2 size={19} />
            </div>

            <div>
              <span>ATS Keywords</span>
              <h2>Matched Keywords</h2>
            </div>
          </div>

          {matchedKeywords.length > 0 ? (
            <div className="resume-tag-list">
              {matchedKeywords.map((keyword, index) => (
                <span
                  className="resume-tag resume-tag-success"
                  key={`${keyword}-${index}`}
                >
                  {keyword}
                </span>
              ))}
            </div>
          ) : (
            <div className="resume-empty-small">
              No matched keywords available.
            </div>
          )}
        </div>

        <div className="resume-detail-card">
          <div className="resume-card-heading">
            <div className="resume-card-heading-icon danger">
              <XCircle size={19} />
            </div>

            <div>
              <span>ATS Keywords</span>
              <h2>Missing Keywords</h2>
            </div>
          </div>

          {missingKeywords.length > 0 ? (
            <div className="resume-tag-list">
              {missingKeywords.map((keyword, index) => (
                <span
                  className="resume-tag resume-tag-danger"
                  key={`${keyword}-${index}`}
                >
                  {keyword}
                </span>
              ))}
            </div>
          ) : (
            <div className="resume-empty-small">
              No missing keywords available.
            </div>
          )}
        </div>
      </section>

      {/* Important Keywords */}
      <section className="resume-detail-card resume-full-card">
        <div className="resume-card-heading">
          <div className="resume-card-heading-icon warning">
            <Sparkles size={19} />
          </div>

          <div>
            <span>Career Keywords</span>
            <h2>Important Keywords</h2>
          </div>
        </div>

        {importantKeywords.length > 0 ? (
          <div className="resume-tag-list">
            {importantKeywords.map((keyword, index) => (
              <span
                className="resume-tag resume-tag-warning"
                key={`${keyword}-${index}`}
              >
                {keyword}
              </span>
            ))}
          </div>
        ) : (
          <div className="resume-empty-small">
            No important keywords available.
          </div>
        )}
      </section>

      {/* ATS Analysis */}
      <section className="resume-detail-card resume-full-card">
        <div className="resume-card-heading">
          <div className="resume-card-heading-icon info">
            <Target size={19} />
          </div>

          <div>
            <span>ATS Analysis</span>
            <h2>Applicant Tracking System</h2>
          </div>
        </div>

        <div className="resume-ats-status">
          <div>
            {atsAnalysis?.compatible ? (
              <span className="ats-compatible">
                <CheckCircle2 size={17} />
                ATS Compatible
              </span>
            ) : (
              <span className="ats-not-compatible">
                <AlertCircle size={17} />
                Needs ATS Improvement
              </span>
            )}
          </div>

          <strong>{getScore(atsAnalysis?.score)}%</strong>
        </div>

        {getSafeArray(atsAnalysis?.issues).length > 0 && (
          <div className="resume-ats-list">
            <h3>Issues</h3>

            {atsAnalysis.issues.map((issue, index) => (
              <div className="resume-list-item" key={`${issue}-${index}`}>
                <XCircle size={16} />
                <span>{issue}</span>
              </div>
            ))}
          </div>
        )}

        {getSafeArray(atsAnalysis?.suggestions).length > 0 && (
          <div className="resume-ats-list">
            <h3>Suggestions</h3>

            {atsAnalysis.suggestions.map((suggestion, index) => (
              <div
                className="resume-list-item success-item"
                key={`${suggestion}-${index}`}
              >
                <CheckCircle2 size={16} />
                <span>{suggestion}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Strengths & Weaknesses */}
      <section className="resume-two-column">
        <div className="resume-detail-card">
          <div className="resume-card-heading">
            <div className="resume-card-heading-icon success">
              <CheckCircle2 size={19} />
            </div>

            <div>
              <span>Resume Review</span>
              <h2>Strengths</h2>
            </div>
          </div>

          {strengths.length > 0 ? (
            <div className="resume-list">
              {strengths.map((strength, index) => (
                <div
                  className="resume-list-item success-item"
                  key={`${strength}-${index}`}
                >
                  <CheckCircle2 size={16} />
                  <span>{strength}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="resume-empty-small">
              Strengths will appear after analysis.
            </div>
          )}
        </div>

        <div className="resume-detail-card">
          <div className="resume-card-heading">
            <div className="resume-card-heading-icon danger">
              <AlertCircle size={19} />
            </div>

            <div>
              <span>Resume Review</span>
              <h2>Weaknesses</h2>
            </div>
          </div>

          {weaknesses.length > 0 ? (
            <div className="resume-list">
              {weaknesses.map((weakness, index) => (
                <div
                  className="resume-list-item danger-item"
                  key={`${weakness}-${index}`}
                >
                  <AlertCircle size={16} />
                  <span>{weakness}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="resume-empty-small">
              Weaknesses will appear after analysis.
            </div>
          )}
        </div>
      </section>

      {/* Experience + Projects + Education */}
      <section className="resume-insight-grid">
        <div className="resume-insight-card">
          <span>Experience</span>

          <h2>
            {experience?.years ?? 0}
            <small> years</small>
          </h2>

          <p>
            Level: <strong>{experience?.level || "Not available"}</strong>
          </p>
        </div>

        <div className="resume-insight-card">
          <span>Projects</span>

          <h2>
            {projects?.total ?? 0}
            <small> total</small>
          </h2>

          <p>
            Relevant: <strong>{projects?.relevant ?? 0}</strong>
          </p>
        </div>

        <div className="resume-insight-card">
          <span>Education</span>

          <h2>{education?.degree || "Not available"}</h2>

          <p>{education?.branch || "Branch not available"}</p>
        </div>
      </section>

      {/* Career Recommendation */}
      <section className="resume-career-alignment-card">
        <div className="resume-career-alignment-header">
          <div>
            <span>Career Alignment</span>
            <h2>How Your Resume Fits Your Career</h2>
          </div>

          <div className="career-alignment-score">
            {getScore(careerAlignment?.score)}%
          </div>
        </div>

        {getSafeArray(careerAlignment?.matchedSkills).length > 0 && (
          <div className="career-alignment-block">
            <h3>Matched Career Skills</h3>

            <div className="resume-tag-list">
              {careerAlignment.matchedSkills.map((skill, index) => (
                <span
                  className="resume-tag resume-tag-success"
                  key={`${skill}-${index}`}
                >
                  <CheckCircle2 size={14} />
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {getSafeArray(careerAlignment?.missingSkills).length > 0 && (
          <div className="career-alignment-block">
            <h3>Missing Career Skills</h3>

            <div className="resume-tag-list">
              {careerAlignment.missingSkills.map((skill, index) => (
                <span
                  className="resume-tag resume-tag-danger"
                  key={`${skill}-${index}`}
                >
                  <XCircle size={14} />
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {careerAlignment?.recommendation && (
          <div className="career-recommendation">
            <Sparkles size={18} />
            <p>{careerAlignment.recommendation}</p>
          </div>
        )}
      </section>

      {/* Suggestions */}
      <section className="resume-section">
        <div className="resume-section-heading">
          <div>
            <span>Action Plan</span>
            <h2>Resume Improvement Suggestions</h2>
          </div>

          {highPrioritySuggestions.length > 0 && (
            <span className="resume-priority-summary">
              {highPrioritySuggestions.length} high-priority
              {highPrioritySuggestions.length === 1
                ? " suggestion"
                : " suggestions"}
            </span>
          )}
        </div>

        {suggestions.length > 0 ? (
          <div className="resume-suggestions-list">
            {suggestions.map((suggestion, index) => (
              <div
                className={`resume-suggestion-card ${
                  suggestion?.completed ? "suggestion-completed" : ""
                }`}
                key={
                  suggestion?._id ||
                  suggestion?.id ||
                  `${suggestion?.title}-${index}`
                }
              >
                <div className="resume-suggestion-icon">
                  {suggestion?.completed ? (
                    <CheckCircle2 size={20} />
                  ) : (
                    <Sparkles size={20} />
                  )}
                </div>

                <div className="resume-suggestion-content">
                  <div className="resume-suggestion-top">
                    <span
                      className={`resume-priority ${getPriorityClass(
                        suggestion?.priority,
                      )}`}
                    >
                      {suggestion?.priority || "medium"}
                    </span>

                    <span className="resume-suggestion-category">
                      {suggestion?.category || "general"}
                    </span>
                  </div>

                  <h3>
                    {suggestion?.title || "Resume improvement suggestion"}
                  </h3>

                  <p>
                    {suggestion?.description ||
                      "Review this recommendation and improve your resume."}
                  </p>
                </div>

                <div className="resume-suggestion-status">
                  {suggestion?.completed ? (
                    <span className="suggestion-done">Completed</span>
                  ) : (
                    <span className="suggestion-pending">Pending</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="resume-empty-state">
            <Sparkles size={28} />

            <h3>No suggestions yet</h3>

            <p>
              Analyze your resume/profile to generate personalized improvement
              suggestions.
            </p>

            <button
              type="button"
              onClick={handleAnalyze}
              disabled={analyzing || !resumeUploaded}
            >
              <Sparkles size={17} />
              Analyze Now
            </button>
          </div>
        )}
      </section>

      {/* Main Flow Navigation */}
      <section className="resume-bottom-actions">
        <div>
          <span>Resume Analysis Complete?</span>

          <h2>Continue through your career preparation journey.</h2>
        </div>

        <div className="resume-bottom-buttons">
          <button
            type="button"
            className="resume-secondary-button"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </button>

          <button
            type="button"
            className="resume-primary-button"
            onClick={() => navigate("/roadmap")}
          >
            Continue to Roadmap
            <ArrowRight size={17} />
          </button>
        </div>
      </section>
    </div>
  );
}

export default ResumeAnalyzer;
