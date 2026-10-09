import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import { getResources } from "../../services/resourceService";

import "./Resources.css";

function Resources() {
  const location = useLocation();
  const navigate = useNavigate();

  const routeState = location.state || {};

  /*
   * ==========================================================
   * ROUTE CONTEXT
   * ==========================================================
   */

  const searchParams = new URLSearchParams(location.search);

  const queryCareerId = searchParams.get("careerId") || "";

  const queryPhase =
    searchParams.get("phase") || searchParams.get("currentPhase") || "";

  const queryPhaseTitle =
    searchParams.get("phaseTitle") ||
    searchParams.get("currentPhaseTitle") ||
    "";

  const queryTopic =
    searchParams.get("topic") ||
    searchParams.get("currentTopic") ||
    searchParams.get("nextTopic") ||
    "";

  const routeCareerId =
    routeState.careerId ||
    queryCareerId ||
    localStorage.getItem("selectedCareerId") ||
    "";

  const routePhase =
    routeState.phase || routeState.currentPhase || queryPhase || "";

  const routePhaseTitle =
    routeState.phaseTitle ||
    routeState.currentPhaseTitle ||
    queryPhaseTitle ||
    "";

  /*
   * Topic can arrive from different Roadmap actions.
   *
   * Priority:
   * 1. Explicit topic
   * 2. nextTopic
   * 3. currentTopic
   * 4. first pending topic
   * 5. first phase topic
   *
   * We do NOT create a fake/default topic.
   */

  const routeTopics = Array.isArray(routeState.topics) ? routeState.topics : [];

  const routePendingTopics = Array.isArray(routeState.pendingTopics)
    ? routeState.pendingTopics
    : [];

  const resolvedRouteTopic =
    routeState.topic ||
    routeState.nextTopic ||
    routeState.currentTopic ||
    queryTopic ||
    routePendingTopics[0] ||
    routeTopics[0] ||
    "";

  const learningAction = routeState.learningAction || "start";

  /*
   * ==========================================================
   * STATE
   * ==========================================================
   */

  const [resourceData, setResourceData] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  /*
   * ==========================================================
   * FETCH RESOURCES
   * ==========================================================
   */

  useEffect(() => {
    let mounted = true;

    const loadResources = async () => {
      /*
       * --------------------------------------------------------
       * CAREER VALIDATION
       * --------------------------------------------------------
       */

      if (!routeCareerId) {
        if (mounted) {
          setError(
            "Career information is missing. Please return to your roadmap and select a career.",
          );

          setLoading(false);
        }

        return;
      }

      /*
       * --------------------------------------------------------
       * PHASE VALIDATION
       * --------------------------------------------------------
       */

      if (!routePhase) {
        if (mounted) {
          setError(
            "Learning phase is missing. Please return to your roadmap and select a learning phase.",
          );

          setLoading(false);
        }

        return;
      }

      /*
       * --------------------------------------------------------
       * TOPIC VALIDATION
       * --------------------------------------------------------
       *
       * Important:
       * We use the resolved topic instead of checking only
       * routeState.topic.
       */

      if (!resolvedRouteTopic) {
        if (mounted) {
          setError(
            "Learning topic is missing. Please return to your roadmap and select a learning topic.",
          );

          setLoading(false);
        }

        return;
      }

      try {
        setLoading(true);
        setError("");

        console.log("Loading resources with:", {
          careerId: routeCareerId,
          phase: routePhase,
          phaseTitle: routePhaseTitle,
          topic: resolvedRouteTopic,
          topics: routeTopics,
          pendingTopics: routePendingTopics,
          learningAction,
        });

        const response = await getResources({
          careerId: routeCareerId,
          phase: routePhase,
          topic: resolvedRouteTopic,
        });

        if (!mounted) {
          return;
        }

        console.log("Resources API response:", response);

        /*
         * Backend response:
         *
         * {
         *   success: true,
         *   message: "...",
         *   data: {
         *      career,
         *      careerId,
         *      currentPhase,
         *      overallCompletion,
         *      nextTopic,
         *      currentTopic,
         *      resources: {
         *         youtube,
         *         documentation,
         *         articles,
         *         practice,
         *         projects,
         *         revision,
         *         objectives
         *      }
         *   }
         * }
         */

        const data = response?.data?.data || response?.data || response;

        if (!data) {
          throw new Error(
            "Personalized resources were not returned by the server.",
          );
        }

        setResourceData(data);
      } catch (err) {
        console.error("Resources loading error:", err);

        if (!mounted) {
          return;
        }

        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Unable to load personalized resources.";

        setError(message);

        toast.error(message);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadResources();

    return () => {
      mounted = false;
    };
  }, [
    routeCareerId,
    routePhase,
    routePhaseTitle,
    resolvedRouteTopic,
    learningAction,
  ]);

  /*
   * ==========================================================
   * DERIVED DATA
   * ==========================================================
   */

  const career =
    resourceData?.career ||
    routeState.careerTitle ||
    routeCareerId ||
    "Selected Career";

  const currentPhase = resourceData?.currentPhase || routePhase || 1;

  /*
   * Backend may return its own current topic.
   * Otherwise use the topic which was resolved from route state.
   */

  const currentTopic =
    resourceData?.currentTopic ||
    resourceData?.nextTopic ||
    resolvedRouteTopic ||
    "Current Topic";

  const overallCompletion = Number(resourceData?.overallCompletion) || 0;

  /*
   * ==========================================================
   * RESOURCE GROUP
   * ==========================================================
   */

  const resourceGroup = resourceData?.resources || resourceData || {};

  const youtube = Array.isArray(resourceGroup.youtube)
    ? resourceGroup.youtube
    : [];

  const documentation = Array.isArray(resourceGroup.documentation)
    ? resourceGroup.documentation
    : [];

  const articles = Array.isArray(resourceGroup.articles)
    ? resourceGroup.articles
    : [];

  const practice = Array.isArray(resourceGroup.practice)
    ? resourceGroup.practice
    : [];

  const projects = Array.isArray(resourceGroup.projects)
    ? resourceGroup.projects
    : [];

  const revision = Array.isArray(resourceGroup.revision)
    ? resourceGroup.revision
    : [];

  const objectives = resourceGroup.objectives || {};

  /*
   * ==========================================================
   * TOTAL RESOURCE COUNT
   * ==========================================================
   */

  const totalResources = useMemo(() => {
    return (
      youtube.length +
      documentation.length +
      articles.length +
      practice.length +
      projects.length +
      revision.length
    );
  }, [
    youtube.length,
    documentation.length,
    articles.length,
    practice.length,
    projects.length,
    revision.length,
  ]);

  /*
   * ==========================================================
   * BACK TO ROADMAP
   * ==========================================================
   */

  const handleBackToRoadmap = () => {
    navigate(
      `/roadmap${
        routeCareerId ? `?careerId=${encodeURIComponent(routeCareerId)}` : ""
      }`,
    );
  };

  /*
   * ==========================================================
   * OPEN EXTERNAL RESOURCE
   * ==========================================================
   */

  const handleOpenResource = (url, title = "Resource") => {
    if (!url) {
      toast.error(`No valid link available for "${title}".`);

      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  };

  /*
   * ==========================================================
   * START LEARNING SESSION
   * ==========================================================
   */

  const handleStartLearning = (resource = null) => {
    if (!routeCareerId) {
      toast.error("Career ID is missing.");

      return;
    }

    const learningTopic =
      resource?.topic || resource?.title || currentTopic || resolvedRouteTopic;

    if (!learningTopic) {
      toast.error(
        "Learning topic is missing. Please return to the roadmap and select a topic.",
      );

      return;
    }

    navigate("/learning-session", {
      state: {
        careerId: routeCareerId,

        phase: currentPhase,

        phaseTitle: routePhaseTitle || routeState.currentPhaseTitle || "",

        topic: learningTopic,

        topics: routeTopics.length > 0 ? routeTopics : [learningTopic],

        pendingTopics:
          routePendingTopics.length > 0 ? routePendingTopics : [learningTopic],

        learningAction: "continue",

        resource,

        sessionType: "learn",

        plannedDurationMinutes:
          Number(resource?.durationMinutes) > 0
            ? Number(resource.durationMinutes)
            : 30,

        learningStyle:
          resourceData?.learningStyle || routeState.learningStyle || "mixed",
      },
    });
  };

  /*
   * ==========================================================
   * GENERIC RESOURCE CARD
   * ==========================================================
   */

  const renderResourceCard = ({
    resource,
    icon,
    sectionClass = "",
    actionLabel = "Open Resource →",
    startLearning = false,
  }) => {
    if (!resource) {
      return null;
    }

    const title = resource.title || "Learning Resource";

    const provider = resource.provider || "Recommended Resource";

    const description =
      resource.description ||
      resource.reason ||
      "Personalized resource selected for your current learning stage.";

    const reason = resource.reason || "";

    const level = resource.level || "";

    const duration =
      Number(resource.durationMinutes) > 0
        ? `${resource.durationMinutes} min`
        : "";

    const priority = resource.priority || "";

    const url = resource.url || "";

    return (
      <article
        key={`${title}-${provider}-${url}`}
        className={`resource-card ${sectionClass}`}
      >
        <div className="resource-card-top">
          <div className="resource-card-icon">{icon}</div>

          {priority && (
            <span
              className={`resource-priority priority-${String(
                priority,
              ).toLowerCase()}`}
            >
              {priority}
            </span>
          )}
        </div>

        <div className="resource-card-content">
          <span className="resource-provider">{provider}</span>

          <h3>{title}</h3>

          <p>{description}</p>

          {reason && (
            <div className="resource-reason">
              <span>Why this?</span>

              <p>{reason}</p>
            </div>
          )}

          <div className="resource-meta">
            {level && <span>Level: {level}</span>}

            {duration && <span>{duration}</span>}
          </div>
        </div>

        <button
          type="button"
          className="resource-action-btn"
          onClick={() =>
            startLearning
              ? handleStartLearning(resource)
              : handleOpenResource(url, title)
          }
          disabled={!url}
        >
          {url ? actionLabel : "Link Unavailable"}
        </button>
      </article>
    );
  };

  /*
   * ==========================================================
   * LOADING
   * ==========================================================
   */

  if (loading) {
    return (
      <main className="resources-page">
        <section className="resources-loading">
          <div className="resources-loading-spinner" />

          <span>PERSONALIZING YOUR LEARNING</span>

          <h1>Generating your resources...</h1>

          <p>
            EduPath AI is selecting resources based on your career, current
            phase, learning style and progress.
          </p>
        </section>
      </main>
    );
  }

  /*
   * ==========================================================
   * ERROR
   * ==========================================================
   */

  if (error) {
    return (
      <main className="resources-page">
        <section className="resources-error">
          <div className="resources-error-icon">!</div>

          <span>RESOURCE GENERATION FAILED</span>

          <h1>We couldn't load your resources.</h1>

          <p>{error}</p>

          <div className="resources-error-actions">
            <button type="button" onClick={() => window.location.reload()}>
              Try Again
            </button>

            <button type="button" onClick={handleBackToRoadmap}>
              ← Back to Roadmap
            </button>
          </div>
        </section>
      </main>
    );
  }

  /*
   * ==========================================================
   * MAIN PAGE
   * ==========================================================
   */

  return (
    <main className="resources-page">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="resources-header">
        <button
          type="button"
          className="resources-back-btn"
          onClick={handleBackToRoadmap}
        >
          ← Roadmap
        </button>

        <div className="resources-header-main">
          <div className="resources-header-eyebrow">
            {learningAction === "continue"
              ? "CONTINUE LEARNING"
              : "START LEARNING"}
          </div>

          <h1>{currentTopic}</h1>

          <p>Personalized resources for your current learning phase.</p>
        </div>

        <div className="resources-header-status">
          <span>PHASE</span>

          <strong>{currentPhase}</strong>
        </div>
      </header>

      {/* ======================================================
          CONTEXT
      ====================================================== */}

      <section className="resources-context">
        <div className="context-item">
          <span>Career</span>
          <strong>{career}</strong>
        </div>

        <div className="context-item">
          <span>Current Phase</span>
          <strong>Phase {currentPhase}</strong>
        </div>

        <div className="context-item">
          <span>Current Topic</span>
          <strong>{currentTopic}</strong>
        </div>

        <div className="context-item">
          <span>Overall Progress</span>
          <strong>{overallCompletion}%</strong>
        </div>

        <div className="context-item">
          <span>Resources</span>
          <strong>{totalResources}</strong>
        </div>
      </section>

      {/* ======================================================
          OBJECTIVE
      ====================================================== */}

      <section className="learning-objective-card">
        <div className="objective-icon">🎯</div>

        <div className="objective-content">
          <span>TODAY'S LEARNING OBJECTIVE</span>

          <h2>Master {currentTopic}</h2>

          <p>
            {objectives?.learn ||
              `Build a strong understanding of ${currentTopic}, learn the core concepts and prepare yourself for practical application.`}
          </p>
        </div>

        <div className="objective-progress">
          <span>ROADMAP</span>

          <strong>{overallCompletion}%</strong>
        </div>
      </section>

      {/* ======================================================
          LEARN
      ====================================================== */}

      <section className="resource-section">
        <div className="section-heading">
          <div className="section-heading-title">
            <span>01</span>

            <div>
              <small>UNDERSTAND</small>

              <h2>Learn</h2>
            </div>
          </div>

          <p>
            Understand the concepts through carefully selected learning
            material.
          </p>
        </div>

        {youtube.length === 0 &&
        documentation.length === 0 &&
        articles.length === 0 ? (
          <div className="resource-empty-state">
            <span>📚</span>

            <h3>Learning resources are being prepared.</h3>

            <p>No learning resources are currently available for this topic.</p>
          </div>
        ) : (
          <div className="resource-grid">
            {youtube.map((resource) =>
              renderResourceCard({
                resource,
                icon: "🎥",
                sectionClass: "youtube-resource-card",
                actionLabel: "Start Learning →",
                startLearning: true,
              }),
            )}

            {documentation.map((resource) =>
              renderResourceCard({
                resource,
                icon: "📖",
                sectionClass: "documentation-resource-card",
                actionLabel: "Open Documentation →",
              }),
            )}

            {articles.map((resource) =>
              renderResourceCard({
                resource,
                icon: "📄",
                sectionClass: "article-resource-card",
                actionLabel: "Read Article →",
              }),
            )}
          </div>
        )}
      </section>

      {/* ======================================================
          PRACTICE
      ====================================================== */}

      <section className="resource-section">
        <div className="section-heading">
          <div className="section-heading-title">
            <span>02</span>

            <div>
              <small>APPLY</small>

              <h2>Practice</h2>
            </div>
          </div>

          <p>
            Apply what you learned through hands-on exercises and coding
            practice.
          </p>
        </div>

        {practice.length === 0 ? (
          <div className="resource-empty-state">
            <span>💻</span>

            <h3>Practice resources are not available yet.</h3>

            <p>Practice resources will appear when available for this topic.</p>
          </div>
        ) : (
          <div className="resource-grid">
            {practice.map((resource) =>
              renderResourceCard({
                resource,
                icon: "💻",
                sectionClass: "practice-card",
                actionLabel: "Start Practice →",
              }),
            )}
          </div>
        )}
      </section>

      {/* ======================================================
          PROJECT
      ====================================================== */}

      <section className="resource-section">
        <div className="section-heading">
          <div className="section-heading-title">
            <span>03</span>

            <div>
              <small>BUILD</small>

              <h2>Project</h2>
            </div>
          </div>

          <p>
            Turn your knowledge into a practical project related to your current
            topic.
          </p>
        </div>

        {projects.length === 0 ? (
          <div className="resource-empty-state">
            <span>🚀</span>

            <h3>Project recommendation not available.</h3>

            <p>
              A project will appear when it is appropriate for your current
              learning stage.
            </p>
          </div>
        ) : (
          <div className="resource-project-grid">
            {projects.map((project, index) => (
              <article
                key={`${project.title || "project"}-${index}`}
                className="resource-project-card"
              >
                <div className="project-card-number">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div className="project-card-icon">🚀</div>

                <span>RECOMMENDED PROJECT</span>

                <h3>{project.title || "Practical Project"}</h3>

                <p>
                  {project.description ||
                    project.reason ||
                    `Build a practical project using ${currentTopic}.`}
                </p>

                {project.reason && project.description && (
                  <div className="project-reason">
                    <strong>Why build this?</strong>

                    <p>{project.reason}</p>
                  </div>
                )}

                <div className="project-meta">
                  {project.level && <span>{project.level}</span>}

                  {Number(project.durationMinutes) > 0 && (
                    <span>{project.durationMinutes} min</span>
                  )}
                </div>

                {project.url && (
                  <button
                    type="button"
                    onClick={() =>
                      handleOpenResource(project.url, project.title)
                    }
                  >
                    Open Project Resource →
                  </button>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      {/* ======================================================
          REVISION
      ====================================================== */}

      <section className="resource-section">
        <div className="section-heading">
          <div className="section-heading-title">
            <span>04</span>

            <div>
              <small>REMEMBER</small>

              <h2>Revision</h2>
            </div>
          </div>

          <p>
            Quickly revise the important concepts before completing the topic.
          </p>
        </div>

        {revision.length === 0 ? (
          <div className="revision-card">
            <div className="revision-icon">🔄</div>

            <div>
              <span>QUICK REVISION</span>

              <h3>Revise {currentTopic}</h3>

              <p>
                Review the key concepts you learned today before moving to the
                next topic.
              </p>
            </div>
          </div>
        ) : (
          <div className="resource-grid">
            {revision.map((resource) =>
              renderResourceCard({
                resource,
                icon: "🔄",
                sectionClass: "revision-resource-card",
                actionLabel: "Start Revision →",
              }),
            )}
          </div>
        )}
      </section>

      {/* ======================================================
          CURRENT PHASE TOPICS
      ====================================================== */}

      <section className="phase-topics-card">
        <div className="phase-topics-header">
          <div>
            <span>CURRENT ROADMAP PHASE</span>

            <h2>{routePhaseTitle || `Phase ${currentPhase}`}</h2>
          </div>

          <div className="phase-topics-count">
            <strong>{routeTopics.length}</strong>

            <span>Topics</span>
          </div>
        </div>

        <div className="phase-topic-list">
          {routeTopics.length === 0 ? (
            <div className="phase-topic-item current">
              <span>▶</span>

              <strong>{currentTopic}</strong>
            </div>
          ) : (
            routeTopics.map((item, index) => {
              const normalizedItem = String(item).trim().toLowerCase();

              const normalizedCurrent = String(currentTopic)
                .trim()
                .toLowerCase();

              const isCurrent = normalizedItem === normalizedCurrent;

              const isPending = routePendingTopics.some(
                (pendingTopic) =>
                  String(pendingTopic).trim().toLowerCase() === normalizedItem,
              );

              return (
                <div
                  key={`${item}-${index}`}
                  className={`phase-topic-item ${isCurrent ? "current" : ""} ${
                    !isCurrent && !isPending ? "completed" : ""
                  }`}
                >
                  <span>{isCurrent ? "▶" : isPending ? "○" : "✓"}</span>

                  <strong>{item}</strong>

                  {isCurrent && <small>CURRENT</small>}
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* ======================================================
          SUMMARY
      ====================================================== */}

      <section className="resources-summary-card">
        <div className="summary-icon">✦</div>

        <div className="summary-content">
          <span>AI PERSONALIZED LEARNING</span>

          <h2>
            Your resources are built around your current learning journey.
          </h2>

          <p>
            EduPath AI uses your career, roadmap phase, current topic, learning
            style and learning progress to keep your learning focused.
          </p>
        </div>

        <div className="summary-stats">
          <div>
            <strong>{totalResources}</strong>

            <span>Resources</span>
          </div>

          <div>
            <strong>{overallCompletion}%</strong>

            <span>Progress</span>
          </div>
        </div>
      </section>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <footer className="resources-footer">
        <button type="button" onClick={handleBackToRoadmap}>
          ← Return to Roadmap
        </button>

        <span>
          Phase {currentPhase} • {currentTopic}
        </span>
      </footer>
    </main>
  );
}

export default Resources;
