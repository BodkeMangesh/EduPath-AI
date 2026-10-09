import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  Circle,
  FileText,
  MessageSquareText,
  RefreshCw,
  Target,
  Trophy,
  Wrench,
} from "lucide-react";

import {
  getPlacement,
  updatePlacementChecklistItem,
} from "../../services/placementService";

import "./Placement.css";

const getScore = (value) => {
  const score = Number(value);

  if (Number.isNaN(score)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
};

const getReadinessLabel = (score) => {
  if (score >= 80) return "Placement Ready";
  if (score >= 60) return "Almost Ready";
  if (score >= 40) return "Building Readiness";
  if (score >= 20) return "Getting Started";

  return "Needs Preparation";
};

const getPriorityClass = (priority) => {
  switch (String(priority || "").toLowerCase()) {
    case "high":
      return "placement-priority placement-priority-high";

    case "medium":
      return "placement-priority placement-priority-medium";

    case "low":
      return "placement-priority placement-priority-low";

    default:
      return "placement-priority";
  }
};

const getChecklistIcon = (category) => {
  switch (category) {
    case "skills":
      return Wrench;

    case "dsa":
      return BarChart3;

    case "projects":
      return BriefcaseBusiness;

    case "resume":
      return FileText;

    case "interview":
      return MessageSquareText;

    case "communication":
      return Trophy;

    default:
      return Target;
  }
};

const Placement = () => {
  const navigate = useNavigate();

  const [placement, setPlacement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [updatingChecklist, setUpdatingChecklist] = useState("");

  const loadPlacement = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const data = await getPlacement();

      setPlacement(data);
    } catch (err) {
      console.error("Placement loading error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load placement dashboard.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadPlacement();
  }, [loadPlacement]);

  const readinessCards = useMemo(() => {
    if (!placement?.readiness) {
      return [];
    }

    return [
      {
        key: "technicalSkills",
        title: "Technical Skills",
        score: getScore(placement.readiness.technicalSkills),
        icon: Wrench,
        description: "Required skills for your selected career.",
      },
      {
        key: "dsa",
        title: "DSA",
        score: getScore(placement.readiness.dsa),
        icon: BarChart3,
        description: "Problem solving and data structures practice.",
      },
      {
        key: "projects",
        title: "Projects",
        score: getScore(placement.readiness.projects),
        icon: BriefcaseBusiness,
        description: "Placement-ready projects and portfolio work.",
      },
      {
        key: "resume",
        title: "Resume",
        score: getScore(placement.readiness.resume),
        icon: FileText,
        description: "Resume quality and career alignment.",
      },
      {
        key: "interview",
        title: "Interview",
        score: getScore(placement.readiness.interview),
        icon: MessageSquareText,
        description: "Technical and mock interview preparation.",
      },
      {
        key: "communication",
        title: "Communication",
        score: getScore(placement.readiness.communication),
        icon: Trophy,
        description: "Communication and interview confidence.",
      },
    ];
  }, [placement]);

  const overallScore = getScore(placement?.readiness?.overall);

  const skillGaps = placement?.skillGaps || [];
  const checklist = placement?.checklist || [];

  const handleChecklistToggle = async (item) => {
    if (!item?._id || updatingChecklist) {
      return;
    }

    const newCompletedState = !item.completed;

    try {
      setUpdatingChecklist(item._id);

      await updatePlacementChecklistItem(item._id, newCompletedState);

      setPlacement((previous) => {
        if (!previous) {
          return previous;
        }

        return {
          ...previous,
          checklist: (previous.checklist || []).map((checklistItem) =>
            checklistItem._id === item._id
              ? {
                  ...checklistItem,
                  completed: newCompletedState,
                  completedAt: newCompletedState
                    ? new Date().toISOString()
                    : null,
                }
              : checklistItem,
          ),
        };
      });
    } catch (err) {
      console.error("Checklist update error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to update checklist item.",
      );
    } finally {
      setUpdatingChecklist("");
    }
  };

  const completedChecklistCount = checklist.filter(
    (item) => item.completed,
  ).length;

  const checklistProgress =
    checklist.length > 0
      ? Math.round((completedChecklistCount / checklist.length) * 100)
      : 0;

  /*
   * Main application flow:
   *
   * Dashboard
   *   ↓
   * Resume Analyzer
   *   ↓
   * Roadmap
   *   ↓
   * Learning
   *   ↓
   * Progress
   *   ↓
   * Placement
   *
   * Placement is the final page of this main flow.
   */

  const handleBackToProgress = () => {
    navigate("/progress");
  };

  /*
   * Placement should not open Resources directly because Resources
   * requires learning context such as careerId / phase / topic.
   *
   * Therefore we first send the user to Learning, where the correct
   * learning context is available.
   */
  const handleExploreResources = () => {
    navigate("/learning");
  };

  if (loading) {
    return (
      <div className="placement-page">
        <div className="placement-loading">
          <div className="placement-loading-spinner">
            <RefreshCw size={28} />
          </div>

          <h2>Loading Placement Dashboard...</h2>

          <p>We are checking your career, skills and placement readiness.</p>
        </div>
      </div>
    );
  }

  if (error && !placement) {
    return (
      <div className="placement-page">
        <div className="placement-error-state">
          <div className="placement-error-icon">
            <AlertCircle size={32} />
          </div>

          <h2>Unable to Load Placement Dashboard</h2>

          <p>{error}</p>

          <button
            type="button"
            className="placement-primary-button"
            onClick={() => loadPlacement()}
          >
            <RefreshCw size={18} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="placement-page">
      <div className="placement-container">
        {error && (
          <div className="placement-inline-error">
            <AlertCircle size={18} />
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

        {/* Main Flow Navigation - Top */}
        <nav
          className="placement-flow-navigation"
          aria-label="Main learning flow"
        >
          <button
            type="button"
            className="placement-flow-button placement-flow-back"
            onClick={handleBackToProgress}
          >
            <ArrowLeft size={17} />
            Back to Progress
          </button>

          <span className="placement-flow-current">Placement</span>

          <span
            className="placement-flow-complete"
            aria-label="Final step in the main learning flow"
          >
            Final Step
          </span>
        </nav>

        {/* Header */}
        <header className="placement-header">
          <div>
            <span className="placement-eyebrow">PLACEMENT HUB</span>

            <h1>Placement Readiness</h1>

            <p>
              Track your preparation and understand what you should improve
              before applying for jobs.
            </p>
          </div>

          <button
            type="button"
            className="placement-refresh-button"
            onClick={() => loadPlacement(true)}
            disabled={refreshing}
          >
            <RefreshCw
              size={17}
              className={refreshing ? "placement-spin" : ""}
            />

            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </header>

        {/* Career Target */}
        <section className="placement-target-card">
          <div className="placement-target-main">
            <div className="placement-target-icon">
              <Target size={25} />
            </div>

            <div>
              <span className="placement-section-label">
                YOUR TARGET CAREER
              </span>

              <h2>
                {placement?.career?.name ||
                  placement?.targetRole ||
                  "Career not selected"}
              </h2>

              <p>
                Target Role:{" "}
                <strong>
                  {placement?.targetRole ||
                    placement?.career?.name ||
                    "Not set"}
                </strong>
              </p>
            </div>
          </div>

          <div className="placement-target-company">
            <span>Dream Company</span>

            <strong>{placement?.dreamCompany || "Not set yet"}</strong>
          </div>

          <button
            type="button"
            className="placement-outline-button"
            onClick={() => navigate("/roadmap")}
          >
            View Roadmap
            <ArrowRight size={17} />
          </button>
        </section>

        {/* Overall Readiness */}
        <section className="placement-overview-grid">
          <div className="placement-readiness-card">
            <div className="placement-card-heading">
              <div>
                <span className="placement-section-label">
                  OVERALL READINESS
                </span>

                <h2>{getReadinessLabel(overallScore)}</h2>
              </div>

              <div className="placement-score-circle">
                <span>{overallScore}</span>
                <small>%</small>
              </div>
            </div>

            <div className="placement-progress-track">
              <div
                className="placement-progress-fill"
                style={{ width: `${overallScore}%` }}
              />
            </div>

            <p className="placement-card-description">
              Your readiness is calculated from technical skills, DSA, projects,
              resume, interviews and communication.
            </p>
          </div>

          <div className="placement-next-action-card">
            <div className="placement-next-action-icon">
              <ArrowRight size={24} />
            </div>

            <div className="placement-next-action-content">
              <span className="placement-section-label">NEXT BEST ACTION</span>

              <h3>
                {placement?.nextAction?.title ||
                  "Start your placement preparation"}
              </h3>

              <p>
                {placement?.nextAction?.description ||
                  "Build your skills and complete the placement checklist."}
              </p>

              {placement?.nextAction?.priority && (
                <span
                  className={getPriorityClass(placement.nextAction.priority)}
                >
                  {placement.nextAction.priority} priority
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Readiness Breakdown */}
        <section className="placement-section">
          <div className="placement-section-header">
            <div>
              <span className="placement-section-label">
                READINESS BREAKDOWN
              </span>

              <h2>Where you stand</h2>
            </div>

            <button
              type="button"
              className="placement-text-button"
              onClick={() => navigate("/learning")}
            >
              Continue Learning
              <ChevronRight size={17} />
            </button>
          </div>

          <div className="placement-readiness-grid">
            {readinessCards.map((card) => {
              const Icon = card.icon;

              return (
                <div className="placement-readiness-item" key={card.key}>
                  <div className="placement-readiness-item-top">
                    <div className="placement-readiness-item-icon">
                      <Icon size={20} />
                    </div>

                    <span className="placement-readiness-score">
                      {card.score}%
                    </span>
                  </div>

                  <h3>{card.title}</h3>

                  <p>{card.description}</p>

                  <div className="placement-mini-progress">
                    <div
                      className="placement-mini-progress-fill"
                      style={{ width: `${card.score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Skills + DSA */}
        <section className="placement-two-column">
          {/* Skill Gaps */}
          <div className="placement-panel">
            <div className="placement-panel-header">
              <div>
                <span className="placement-section-label">SKILL GAPS</span>

                <h2>Skills to improve</h2>
              </div>

              <span className="placement-panel-count">{skillGaps.length}</span>
            </div>

            {skillGaps.length === 0 ? (
              <div className="placement-empty-state">
                <CheckCircle2 size={30} />

                <h3>No major skill gaps</h3>

                <p>Your current skills cover the required career skills.</p>
              </div>
            ) : (
              <div className="placement-skill-list">
                {skillGaps.map((gap, index) => (
                  <div
                    className="placement-skill-item"
                    key={`${gap.skill}-${index}`}
                  >
                    <div className="placement-skill-icon">
                      <Wrench size={17} />
                    </div>

                    <div className="placement-skill-content">
                      <div className="placement-skill-title-row">
                        <h3>{gap.skill}</h3>

                        <span className={getPriorityClass(gap.priority)}>
                          {gap.priority || "medium"}
                        </span>
                      </div>

                      <p>
                        {gap.reason ||
                          `Improve ${gap.skill} for your target career.`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* DSA */}
          <div className="placement-panel">
            <div className="placement-panel-header">
              <div>
                <span className="placement-section-label">DSA PREPARATION</span>

                <h2>Problem solving</h2>
              </div>

              <BarChart3 size={22} />
            </div>

            <div className="placement-dsa-summary">
              <div className="placement-dsa-level">
                <span>Current Level</span>

                <strong>
                  {placement?.dsa?.level
                    ? placement.dsa.level.replace("_", " ")
                    : "Not started"}
                </strong>
              </div>

              <div className="placement-dsa-stat">
                <span>Questions Solved</span>

                <strong>{placement?.dsa?.questionsSolved || 0}</strong>
              </div>

              <div className="placement-dsa-stat">
                <span>Topics Completed</span>

                <strong>{placement?.dsa?.topicsCompleted?.length || 0}</strong>
              </div>
            </div>

            <button
              type="button"
              className="placement-panel-action"
              onClick={() => navigate("/learning")}
            >
              Practice through Learning
              <ArrowRight size={17} />
            </button>
          </div>
        </section>

        {/* Checklist */}
        <section className="placement-section">
          <div className="placement-section-header">
            <div>
              <span className="placement-section-label">
                PLACEMENT CHECKLIST
              </span>

              <h2>Build your placement readiness</h2>

              <p>Complete these milestones step by step.</p>
            </div>

            <div className="placement-checklist-progress">
              <strong>{completedChecklistCount}</strong>
              <span>/ {checklist.length} completed</span>
            </div>
          </div>

          <div className="placement-checklist-bar">
            <div
              className="placement-checklist-bar-fill"
              style={{ width: `${checklistProgress}%` }}
            />
          </div>

          {checklist.length === 0 ? (
            <div className="placement-empty-state placement-checklist-empty">
              <Circle size={30} />

              <h3>Checklist is empty</h3>

              <p>Placement milestones will appear here.</p>
            </div>
          ) : (
            <div className="placement-checklist">
              {checklist.map((item) => {
                const Icon = getChecklistIcon(item.category);
                const isUpdating = updatingChecklist === item._id;

                return (
                  <button
                    type="button"
                    key={item._id}
                    className={`placement-checklist-item ${
                      item.completed ? "placement-checklist-completed" : ""
                    }`}
                    onClick={() => handleChecklistToggle(item)}
                    disabled={Boolean(updatingChecklist)}
                  >
                    <div className="placement-checklist-check">
                      {item.completed ? (
                        <CheckCircle2 size={22} />
                      ) : (
                        <Circle size={22} />
                      )}
                    </div>

                    <div className="placement-checklist-icon">
                      <Icon size={19} />
                    </div>

                    <div className="placement-checklist-content">
                      <h3>{item.title}</h3>

                      <span>{item.category || "placement"}</span>
                    </div>

                    {isUpdating ? (
                      <RefreshCw size={18} className="placement-spin" />
                    ) : (
                      <ChevronRight size={18} />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Career Information */}
        <section className="placement-career-card">
          <div className="placement-career-content">
            <span className="placement-section-label">TARGET CAREER</span>

            <h2>{placement?.career?.name || "Your Career"}</h2>

            <p>
              {placement?.career?.description ||
                "Keep improving the skills required for your target career."}
            </p>

            {placement?.career?.skills?.length > 0 && (
              <div className="placement-career-skills">
                {placement.career.skills.map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>
            )}
          </div>

          <div className="placement-career-actions">
            <button
              type="button"
              className="placement-primary-button"
              onClick={() => navigate("/roadmap")}
            >
              Open Career Roadmap
              <ArrowRight size={18} />
            </button>

            <button
              type="button"
              className="placement-outline-button"
              onClick={handleExploreResources}
            >
              Continue Learning
            </button>
          </div>
        </section>

        {/* Main Flow Navigation - Bottom */}
        <nav
          className="placement-flow-navigation placement-flow-navigation-bottom"
          aria-label="Main learning flow"
        >
          <button
            type="button"
            className="placement-flow-button placement-flow-back"
            onClick={handleBackToProgress}
          >
            <ArrowLeft size={17} />
            Back to Progress
          </button>

          <span className="placement-flow-current">Placement</span>

          <span
            className="placement-flow-complete"
            aria-label="Final step in the main learning flow"
          >
            Placement Complete
          </span>
        </nav>
      </div>
    </div>
  );
};

export default Placement;
