import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  FileText,
  GraduationCap,
  Loader2,
  Map,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

import { getDashboard } from "../../services/dashboardService";

import "./Dashboard.css";

function getSafeObject(value) {
  return value && typeof value === "object" ? value : {};
}

function getFirstValue(...values) {
  return values.find(
    (value) =>
      value !== undefined && value !== null && String(value).trim() !== "",
  );
}

function getUserName(dashboard) {
  const user = getSafeObject(dashboard?.user);
  const profile = getSafeObject(dashboard?.profile);

  return (
    getFirstValue(
      dashboard?.name,
      dashboard?.userName,
      dashboard?.username,
      user?.name,
      user?.fullName,
      user?.username,
      profile?.name,
      profile?.fullName,
    ) || "Learner"
  );
}

function getCareerName(dashboard) {
  const career = getSafeObject(dashboard?.career);
  const selectedCareer = getSafeObject(dashboard?.selectedCareer);

  return (
    getFirstValue(
      dashboard?.targetCareer,
      dashboard?.targetRole,
      dashboard?.careerName,
      career?.name,
      career?.title,
      selectedCareer?.name,
      selectedCareer?.title,
    ) || "Career not selected"
  );
}

function getOverallProgress(dashboard) {
  const progress = getSafeObject(dashboard?.progress);
  const overview = getSafeObject(progress?.overview);

  const value = getFirstValue(
    dashboard?.overallProgress,
    dashboard?.progressPercentage,
    dashboard?.completion,
    progress?.overallCompletion,
    overview?.overallCompletion,
  );

  const number = Number(value);

  if (Number.isNaN(number)) {
    return 0;
  }

  return Math.max(0, Math.min(100, number));
}

function getReadinessScore(dashboard) {
  const readiness = getSafeObject(dashboard?.readiness);
  const placement = getSafeObject(dashboard?.placement);

  const value = getFirstValue(
    dashboard?.readinessScore,
    readiness?.score,
    readiness?.overallScore,
    placement?.readinessScore,
  );

  const number = Number(value);

  if (Number.isNaN(number)) {
    return 0;
  }

  return Math.max(0, Math.min(100, number));
}

function getCurrentPhase(dashboard) {
  const progress = getSafeObject(dashboard?.progress);
  const overview = getSafeObject(progress?.overview);

  return (
    getFirstValue(
      dashboard?.currentPhase,
      progress?.currentPhase,
      overview?.currentPhase,
    ) || "Not started"
  );
}

function getNextAction(dashboard) {
  const progress = getSafeObject(dashboard?.progress);
  const nextAction = getSafeObject(progress?.nextAction);

  return {
    label:
      getFirstValue(
        dashboard?.nextAction?.actionLabel,
        dashboard?.nextAction?.label,
        progress?.nextAction?.actionLabel,
        progress?.nextAction?.label,
        nextAction?.actionLabel,
        nextAction?.label,
      ) || "Continue your journey",

    description:
      getFirstValue(
        dashboard?.nextAction?.description,
        progress?.nextAction?.description,
        nextAction?.description,
      ) || "Continue working on your career preparation.",
  };
}

function getSafeArray(value) {
  return Array.isArray(value) ? value : [];
}

function getStats(dashboard) {
  const progress = getSafeObject(dashboard?.progress);
  const overview = getSafeObject(progress?.overview);

  return {
    completedTopics:
      Number(
        getFirstValue(
          dashboard?.completedTopics,
          progress?.completedTopics?.length,
          overview?.completedTopics?.length,
        ),
      ) || 0,

    totalStudyHours:
      Number(
        getFirstValue(
          dashboard?.totalStudyHours,
          progress?.totalStudyHours,
          overview?.totalStudyHours,
        ),
      ) || 0,

    currentStreak:
      Number(
        getFirstValue(
          dashboard?.currentStreak,
          progress?.currentStreak,
          overview?.streak,
        ),
      ) || 0,
  };
}

const JOURNEY_CARDS = [
  {
    id: "resume",
    title: "Resume Analyzer",
    description:
      "Analyze your resume, ATS compatibility, skills, keywords and career alignment.",
    path: "/resume-analyzer",
    icon: FileText,
    className: "dashboard-module-resume",
  },
  {
    id: "assessment",
    title: "Skill Assessment",
    description:
      "Evaluate your current skills and understand where you need improvement.",
    path: "/skill-assessment",
    icon: Target,
    className: "dashboard-module-assessment",
  },
  {
    id: "roadmap",
    title: "Career Roadmap",
    description:
      "Follow your personalized career roadmap and understand what to learn next.",
    path: "/roadmap",
    icon: Map,
    className: "dashboard-module-roadmap",
  },
  {
    id: "learning",
    title: "Learning",
    description:
      "Continue your learning journey, topics, projects and practical preparation.",
    path: "/learning",
    icon: BookOpen,
    className: "dashboard-module-learning",
  },
  {
    id: "progress",
    title: "Progress",
    description:
      "Track learning progress, study activity, sessions and career milestones.",
    path: "/progress",
    icon: TrendingUp,
    className: "dashboard-module-progress",
  },
  {
    id: "placement",
    title: "Placement",
    description:
      "Check your placement readiness, skill gaps, DSA, resume and interview preparation.",
    path: "/placement",
    icon: BriefcaseBusiness,
    className: "dashboard-module-placement",
  },
  {
    id: "chat",
    title: "Chat with Mentor",
    description:
      "Get guidance, ask career questions and discuss your learning and placement journey.",
    path: "/chat",
    icon: Sparkles,
    className: "dashboard-module-chat",
  },
];

function Dashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const careerId = localStorage.getItem("selectedCareerId");

  const loadDashboard = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const data = await getDashboard();

      console.log("Dashboard Data:", data);
      console.log("Selected Career ID:", careerId);

      setDashboard(data);
    } catch (err) {
      console.error("Dashboard Error:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to load your dashboard.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const userName = useMemo(() => {
    return getUserName(dashboard);
  }, [dashboard]);

  const careerName = useMemo(() => {
    return getCareerName(dashboard);
  }, [dashboard]);

  const overallProgress = useMemo(() => {
    return getOverallProgress(dashboard);
  }, [dashboard]);

  const readinessScore = useMemo(() => {
    return getReadinessScore(dashboard);
  }, [dashboard]);

  const currentPhase = useMemo(() => {
    return getCurrentPhase(dashboard);
  }, [dashboard]);

  const nextAction = useMemo(() => {
    return getNextAction(dashboard);
  }, [dashboard]);

  const stats = useMemo(() => {
    return getStats(dashboard);
  }, [dashboard]);

  const insights = useMemo(() => {
    const dashboardInsights = getSafeArray(dashboard?.insights);

    const progress = getSafeObject(dashboard?.progress);

    const progressInsights = getSafeArray(progress?.insights);

    return [...dashboardInsights, ...progressInsights].slice(0, 3);
  }, [dashboard]);

  const handleModuleNavigation = (path) => {
    navigate(path);
  };

  const handleNextAction = () => {
    const action = getSafeObject(dashboard?.nextAction);

    const actionType = String(
      getFirstValue(action?.type, action?.action, action?.destination, ""),
    ).toLowerCase();

    if (actionType.includes("resume")) {
      navigate("/resume-analyzer");
      return;
    }

    if (actionType.includes("assessment")) {
      navigate("/skill-assessment");
      return;
    }

    if (actionType.includes("roadmap")) {
      navigate("/roadmap");
      return;
    }

    if (actionType.includes("learning")) {
      navigate("/learning");
      return;
    }

    if (actionType.includes("progress")) {
      navigate("/progress");
      return;
    }

    if (actionType.includes("placement")) {
      navigate("/placement");
      return;
    }

    navigate("/roadmap");
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">
          <div className="dashboard-loading-icon">
            <Loader2 size={28} className="dashboard-spin" />
          </div>

          <h2>Loading your dashboard...</h2>

          <p>Preparing your career journey.</p>
        </div>
      </div>
    );
  }

  if (error && !dashboard) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-error-state">
          <div className="dashboard-error-icon">
            <Sparkles size={26} />
          </div>

          <h2>Unable to load dashboard</h2>

          <p>{error}</p>

          <button
            type="button"
            className="dashboard-primary-button"
            onClick={() => loadDashboard()}
          >
            <RefreshCw size={17} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <main className="dashboard-main">
        {/* Top Navigation */}
        <header className="dashboard-topbar">
          <div className="dashboard-brand">
            <div className="dashboard-brand-icon">
              <GraduationCap size={24} />
            </div>

            <div>
              <strong>EduPath-AI</strong>
              <span>Career & Placement Journey</span>
            </div>
          </div>

          <div className="dashboard-topbar-actions">
            <button
              type="button"
              className="dashboard-refresh-button"
              onClick={() => loadDashboard(true)}
              disabled={refreshing}
              title="Refresh dashboard"
            >
              <RefreshCw
                size={17}
                className={refreshing ? "dashboard-spin" : ""}
              />

              <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
            </button>

            <button
              type="button"
              className="dashboard-profile-button"
              onClick={() => navigate("/profile")}
            >
              <span className="dashboard-profile-avatar">
                {userName.charAt(0).toUpperCase()}
              </span>

              <span>{userName}</span>
            </button>
          </div>
        </header>

        {/* Error Banner */}
        {error && dashboard && (
          <section className="dashboard-error-banner">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => loadDashboard(true)}
              disabled={refreshing}
            >
              Retry
            </button>
          </section>
        )}

        {/* Welcome */}
        <section className="dashboard-welcome-section">
          <div className="dashboard-welcome-content">
            <span className="dashboard-eyebrow">
              <Sparkles size={15} />
              Your personalized career dashboard
            </span>

            <h1>
              Welcome back, <span>{userName}</span>
            </h1>

            <p>
              Keep building your skills, follow your roadmap and prepare
              yourself for your placement journey.
            </p>

            <div className="dashboard-career-badge">
              <Target size={16} />

              <span>Target Career</span>

              <strong>{careerName}</strong>
            </div>
          </div>

          <div className="dashboard-welcome-progress">
            <div
              className="dashboard-progress-ring"
              style={{ "--progress": overallProgress }}
            >
              <div className="dashboard-progress-ring-inner">
                <strong>{overallProgress}%</strong>
                <span>Journey</span>
              </div>
            </div>

            <p>Overall journey progress</p>
          </div>
        </section>

        {/* Journey Stats */}
        <section className="dashboard-stats-grid">
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-icon">
              <TrendingUp size={20} />
            </div>

            <div>
              <span>Journey Progress</span>
              <strong>{overallProgress}%</strong>
            </div>
          </div>

          <div className="dashboard-stat-card">
            <div className="dashboard-stat-icon">
              <BookOpen size={20} />
            </div>

            <div>
              <span>Topics Completed</span>
              <strong>{stats.completedTopics}</strong>
            </div>
          </div>

          <div className="dashboard-stat-card">
            <div className="dashboard-stat-icon">
              <BarChart3 size={20} />
            </div>

            <div>
              <span>Study Hours</span>
              <strong>{stats.totalStudyHours}</strong>
            </div>
          </div>

          <div className="dashboard-stat-card">
            <div className="dashboard-stat-icon">
              <Target size={20} />
            </div>

            <div>
              <span>Placement Readiness</span>
              <strong>{readinessScore}%</strong>
            </div>
          </div>
        </section>

        {/* Current Journey */}
        <section className="dashboard-current-section">
          <div className="dashboard-section-heading">
            <div>
              <span>Current Journey</span>
              <h2>Where you are right now</h2>
            </div>

            <div className="dashboard-current-phase">
              <span>Current Phase</span>
              <strong>{currentPhase}</strong>
            </div>
          </div>

          <div className="dashboard-current-card">
            <div className="dashboard-current-icon">
              <Map size={25} />
            </div>

            <div className="dashboard-current-content">
              <span>Career Roadmap</span>

              <h3>{careerName}</h3>

              <p>
                Continue your personalized roadmap and keep moving toward your
                target career.
              </p>
            </div>

            <button
              type="button"
              className="dashboard-outline-button"
              onClick={() => navigate("/roadmap")}
            >
              Open Roadmap
              <ArrowRight size={17} />
            </button>
          </div>
        </section>

        {/* Main Modules */}
        <section className="dashboard-modules-section">
          <div className="dashboard-section-heading">
            <div>
              <span>Your Career Journey</span>
              <h2>Choose what you want to work on</h2>
            </div>

            <p>
              Access your main career, learning and placement tools from one
              place.
            </p>
          </div>

          <div className="dashboard-module-grid">
            {JOURNEY_CARDS.map((card) => {
              const Icon = card.icon;

              return (
                <button
                  type="button"
                  key={card.id}
                  className={`dashboard-module-card ${card.className}`}
                  onClick={() => handleModuleNavigation(card.path)}
                >
                  <div className="dashboard-module-top">
                    <div className="dashboard-module-icon">
                      <Icon size={23} />
                    </div>

                    <ChevronRight size={20} />
                  </div>

                  <div className="dashboard-module-content">
                    <h3>{card.title}</h3>

                    <p>{card.description}</p>
                  </div>

                  <span className="dashboard-module-link">
                    Open {card.title}
                    <ArrowRight size={16} />
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Next Action + Readiness */}
        <section className="dashboard-action-grid">
          <div className="dashboard-next-action-card">
            <div className="dashboard-action-icon">
              <Sparkles size={22} />
            </div>

            <div className="dashboard-action-content">
              <span>Recommended Next Step</span>

              <h2>{nextAction.label}</h2>

              <p>{nextAction.description}</p>

              <button
                type="button"
                className="dashboard-primary-button"
                onClick={handleNextAction}
              >
                Continue Journey
                <ArrowRight size={17} />
              </button>
            </div>
          </div>

          <div className="dashboard-readiness-card">
            <div className="dashboard-readiness-header">
              <div>
                <span>Placement Preparation</span>
                <h2>Readiness</h2>
              </div>

              <strong>{readinessScore}%</strong>
            </div>

            <div className="dashboard-readiness-bar">
              <div
                style={{
                  width: `${readinessScore}%`,
                }}
              />
            </div>

            <p>
              Your placement readiness is based on the preparation data
              available in your career journey.
            </p>

            <button
              type="button"
              className="dashboard-text-button"
              onClick={() => navigate("/placement")}
            >
              View Placement Readiness
              <ArrowRight size={16} />
            </button>
          </div>
        </section>

        {/* Insights */}
        {insights.length > 0 && (
          <section className="dashboard-insights-section">
            <div className="dashboard-section-heading">
              <div>
                <span>Career Insights</span>
                <h2>Keep improving</h2>
              </div>
            </div>

            <div className="dashboard-insights-grid">
              {insights.map((insight, index) => {
                const text =
                  typeof insight === "string"
                    ? insight
                    : getFirstValue(
                        insight?.message,
                        insight?.description,
                        insight?.text,
                        insight?.title,
                      );

                if (!text) {
                  return null;
                }

                return (
                  <div
                    className="dashboard-insight-card"
                    key={insight?._id || insight?.id || `${text}-${index}`}
                  >
                    <CheckCircle2 size={18} />

                    <p>{text}</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Quick Navigation */}
        <section className="dashboard-quick-section">
          <div className="dashboard-section-heading">
            <div>
              <span>Quick Navigation</span>
              <h2>Other areas</h2>
            </div>
          </div>

          <div className="dashboard-quick-links">
            <button type="button" onClick={() => navigate("/profile")}>
              Profile
              <ArrowRight size={16} />
            </button>

            <button type="button" onClick={() => navigate("/chat")}>
              Chat with Mentor
              <ArrowRight size={16} />
            </button>

            <button type="button" onClick={() => navigate("/resources")}>
              Resources
              <ArrowRight size={16} />
            </button>

            <button type="button" onClick={() => navigate("/settings")}>
              Settings
              <ArrowRight size={16} />
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="dashboard-footer">
          <div>
            <strong>EduPath-AI</strong>

            <span>
              Personalized career preparation, learning and placement journey.
            </span>
          </div>

          <div className="dashboard-footer-links">
            <button type="button" onClick={() => navigate("/privacy-policy")}>
              Privacy
            </button>

            <button
              type="button"
              onClick={() => navigate("/terms-and-conditions")}
            >
              Terms
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default Dashboard;
