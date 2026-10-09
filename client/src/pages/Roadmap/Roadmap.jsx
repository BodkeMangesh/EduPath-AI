import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Code2,
  Lock,
  MessageSquareText,
  Play,
  Target,
  TrendingUp,
  Trophy,
} from "lucide-react";

import { getRoadmap } from "../../services/roadmapService";
import RoadmapCard from "../../components/RoadmapCard/RoadmapCard";

import "./Roadmap.css";

function Roadmap() {
  const navigate = useNavigate();
  const location = useLocation();

  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================================
  // CAREER ID
  // ==========================================================

  const careerId = useMemo(() => {
    return (
      location?.state?.careerId ||
      new URLSearchParams(location.search).get("careerId") ||
      localStorage.getItem("selectedCareerId") ||
      ""
    );
  }, [location?.search, location?.state?.careerId]);

  // ==========================================================
  // LOAD ROADMAP
  // ==========================================================

  const loadRoadmap = useCallback(async () => {
    try {
      if (!careerId) {
        throw new Error(
          "Selected career information is missing. Please select a career first.",
        );
      }

      setLoading(true);
      setError("");

      const response = await getRoadmap(careerId);

      /*
       * Backend response:
       *
       * {
       *   success: true,
       *   message: "...",
       *   data: roadmap
       * }
       *
       * Axios wraps that inside response.data.
       */

      const responseBody = response?.data ?? response;

      const roadmapData =
        responseBody?.data ?? responseBody?.roadmap ?? responseBody ?? null;

      if (!roadmapData || typeof roadmapData !== "object") {
        throw new Error("Roadmap data not found.");
      }

      setRoadmap(roadmapData);
    } catch (err) {
      console.error("Failed to load roadmap:", err);

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to load roadmap.";

      setError(message);

      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [careerId]);

  useEffect(() => {
    loadRoadmap();
  }, [loadRoadmap]);

  // ==========================================================
  // MAIN FLOW NAVIGATION
  // ==========================================================

  const handleBackToResume = () => {
    navigate("/resume-analyzer");
  };

  const handleContinueToLearning = () => {
    navigate("/learning");
  };

  // ==========================================================
  // SAFE HELPERS
  // ==========================================================

  const safeArray = (value) => {
    return Array.isArray(value) ? value : [];
  };

  const safeNumber = (value, fallback = 0) => {
    const number = Number(value);

    return Number.isFinite(number) ? number : fallback;
  };

  const clampPercentage = (value) => {
    return Math.min(Math.max(safeNumber(value), 0), 100);
  };

  const formatValue = (value, fallback = "—") => {
    if (value === null || value === undefined || value === "") {
      return fallback;
    }

    return value;
  };

  // ==========================================================
  // NAVIGATION
  // ==========================================================

  const openResources = ({
    phase,
    phaseTitle,
    topic,
    topics = [],
    pendingTopics = [],
    action = "start",
    source = "roadmap",
  }) => {
    if (!careerId) {
      toast.error("Career information is missing.");
      return;
    }

    navigate("/resources", {
      state: {
        careerId,
        phase,
        phaseTitle,
        topic,
        topics,
        pendingTopics,
        learningAction: action,
        source,
      },
    });
  };

  // ==========================================================
  // TODAY'S PLAN
  // ==========================================================

  const handleTodayPlan = () => {
    if (!todayPlan?.available) {
      toast.error("Today's learning plan is not available.");
      return;
    }

    const planTopic = todayPlan?.topic || roadmap?.nextTopic;

    if (!planTopic) {
      toast.error("No learning topic is available for today.");
      return;
    }

    openResources({
      phase: todayPlan?.phase || currentPhase,
      phaseTitle: todayPlan?.phaseTitle || currentPhaseData?.title || "",
      topic: planTopic,
      topics: [planTopic],
      pendingTopics: [planTopic],
      action: "continue",
      source: "today-plan",
    });
  };

  // ==========================================================
  // NEXT TOPIC
  // ==========================================================

  const handleNextTopic = () => {
    if (!roadmap?.nextTopic) {
      toast.success("You have completed all available learning topics.");
      return;
    }

    openResources({
      phase: currentPhase,
      phaseTitle: currentPhaseData?.title || "",
      topic: roadmap.nextTopic,
      topics: [roadmap.nextTopic],
      pendingTopics: [roadmap.nextTopic],
      action: "continue",
      source: "next-topic",
    });
  };

  // ==========================================================
  // PHASE ACTION
  // ==========================================================

  const handlePhaseLearning = (phase) => {
    if (!phase) {
      return;
    }

    const pendingTopics = safeArray(phase.pendingTopics);
    const phaseTopics = safeArray(phase.topics);

    const nextPhaseTopic =
      phase.nextTopic || pendingTopics[0] || phaseTopics[0] || "";

    if (!nextPhaseTopic) {
      toast.success("This phase has no pending learning topic.");
      return;
    }

    openResources({
      phase: phase.phase,
      phaseTitle: phase.title,
      topic: nextPhaseTopic,
      topics: [nextPhaseTopic],
      pendingTopics:
        pendingTopics.length > 0 ? pendingTopics : [nextPhaseTopic],
      action: phase.status === "locked" ? "locked" : "continue",
      source: "phase-roadmap",
    });
  };

  // ==========================================================
  // PROJECT
  // ==========================================================

  const handleProject = () => {
    if (!roadmap?.nextProject) {
      toast.error("No project is currently available.");
      return;
    }

    /*
     * We intentionally send project information through the
     * existing resources flow for now.
     *
     * Later, when the Learning Engine / Project Engine is ready,
     * this handler can directly navigate to the project workspace
     * without changing the Roadmap data structure.
     */

    openResources({
      phase: currentPhase,
      phaseTitle: currentPhaseData?.title || "",
      topic: roadmap.nextProject,
      topics: [roadmap.nextProject],
      pendingTopics: [roadmap.nextProject],
      action: "project",
      source: "roadmap-project",
    });
  };

  // ==========================================================
  // INTERVIEW PREPARATION
  // ==========================================================

  const handleInterviewPreparation = () => {
    const topics = safeArray(
      roadmap?.interview?.pendingTopics ||
        roadmap?.interview?.topics ||
        roadmap?.currentInterviewTopics,
    );

    if (topics.length === 0) {
      toast.success("Interview preparation topics are not available yet.");
      return;
    }

    const firstTopic =
      typeof topics[0] === "string"
        ? topics[0]
        : topics[0]?.title || topics[0]?.name || "";

    if (!firstTopic) {
      toast.error("Interview topic information is incomplete.");
      return;
    }

    openResources({
      phase: currentPhase,
      phaseTitle: currentPhaseData?.title || "",
      topic: firstTopic,
      topics,
      pendingTopics: topics,
      action: "interview",
      source: "interview-preparation",
    });
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <main className="roadmap-page">
        <div className="roadmap-loading">
          <div className="roadmap-loader"></div>

          <p>Building your personalized roadmap...</p>

          <span>Analyzing your learning journey</span>
        </div>
      </main>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error) {
    return (
      <main className="roadmap-page">
        <div className="roadmap-error">
          <div className="roadmap-error-icon">!</div>

          <h2>Unable to Load Roadmap</h2>

          <p>{error}</p>

          <div className="roadmap-error-actions">
            <button type="button" onClick={loadRoadmap}>
              Try Again
            </button>

            <button
              type="button"
              className="secondary"
              onClick={() => navigate("/career-selection")}
            >
              Select Career
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!roadmap) {
    return null;
  }

  // ==========================================================
  // DATA
  // ==========================================================

  const phases = safeArray(roadmap.phases);

  const todayPlan = roadmap.todayPlan || {};

  const userProfile = roadmap.userProfile || {};

  const skillGap = roadmap.skillGap || {};

  const readiness = roadmap.readiness || {};

  const journey = roadmap.journey || {};

  const projects = roadmap.projects || {};

  const interview = roadmap.interview || {};

  const overallCompletion = clampPercentage(
    roadmap.overallCompletion ??
      roadmap.progress?.overallCompletion ??
      roadmap.progress?.completion ??
      0,
  );

  const currentPhase = safeNumber(
    roadmap.currentPhase ?? roadmap.progress?.currentPhase ?? 1,
    1,
  );

  const currentPhaseData =
    phases.find((phase) => Number(phase.phase) === Number(currentPhase)) ||
    phases[0];

  const completedTopics = safeArray(
    roadmap.completedTopics || roadmap.progress?.completedTopics,
  );

  const pendingTopics = safeArray(
    roadmap.pendingTopics || roadmap.progress?.pendingTopics,
  );

  const totalCompleted =
    safeNumber(journey.completedTopics, completedTopics.length) ||
    completedTopics.length;

  const totalPending =
    safeNumber(journey.pendingTopics, pendingTopics.length) ||
    pendingTopics.length;

  // ==========================================================
  // PHASE STATS
  // ==========================================================

  const completedPhases = phases.filter(
    (phase) =>
      phase.status === "completed" || clampPercentage(phase.completion) >= 100,
  ).length;

  const phaseCount =
    safeNumber(journey.totalPhases, phases.length) || phases.length;

  // ==========================================================
  // SKILL GAP
  // ==========================================================

  const requiredSkills = safeArray(
    skillGap.requiredSkills || roadmap.requiredSkills,
  );

  const matchedSkills = safeArray(
    skillGap.matchedSkills || roadmap.matchedSkills,
  );

  const missingSkills = safeArray(
    skillGap.missingSkills || roadmap.missingSkills,
  );

  const skillMatchPercentage = clampPercentage(
    skillGap.skillMatchPercentage ??
      skillGap.matchPercentage ??
      roadmap.skillMatchPercentage ??
      0,
  );

  const totalRequiredSkills =
    safeNumber(
      skillGap.totalRequiredSkills,
      requiredSkills.length || matchedSkills.length + missingSkills.length,
    ) ||
    requiredSkills.length ||
    matchedSkills.length + missingSkills.length;

  // ==========================================================
  // READINESS
  // ==========================================================

  const readinessScore = clampPercentage(
    readiness.score ?? readiness.readinessScore ?? roadmap.careerReadiness ?? 0,
  );

  const readinessLevel =
    readiness.level || readiness.readinessLevel || "Developing";

  const readinessRoadmapCompletion = clampPercentage(
    readiness.breakdown?.roadmapCompletion ??
      readiness.roadmapCompletion ??
      overallCompletion,
  );

  const readinessSkillMatch = clampPercentage(
    readiness.breakdown?.skillMatch ??
      readiness.skillMatch ??
      skillMatchPercentage,
  );

  const readinessProjectCompletion = clampPercentage(
    readiness.breakdown?.projectCompletion ?? readiness.projectCompletion ?? 0,
  );

  const readinessInterviewPreparation = clampPercentage(
    readiness.breakdown?.interviewPreparation ??
      readiness.interviewPreparation ??
      0,
  );

  // ==========================================================
  // PROJECT DATA
  // ==========================================================

  const totalProjects = safeNumber(projects.total, journey.totalProjects || 0);

  const completedProjects = safeNumber(projects.completed, 0);

  const pendingProjects = safeNumber(
    projects.pending,
    Math.max(totalProjects - completedProjects, 0),
  );

  // ==========================================================
  // INTERVIEW DATA
  // ==========================================================

  const totalInterviewTopics = safeNumber(
    interview.total,
    journey.totalInterviewTopics || 0,
  );

  const completedInterviewTopics = safeNumber(interview.completed, 0);

  const pendingInterviewTopics = safeNumber(
    interview.pending,
    Math.max(totalInterviewTopics - completedInterviewTopics, 0),
  );

  const interviewCompletion = clampPercentage(
    interview.completion ??
      (totalInterviewTopics > 0
        ? (completedInterviewTopics / totalInterviewTopics) * 100
        : 0),
  );

  const interviewTopics = safeArray(
    interview.pendingTopics ||
      interview.topics ||
      roadmap.currentInterviewTopics,
  );

  // ==========================================================
  // NEXT ACTION
  // ==========================================================

  const nextAction = roadmap.nextAction || {};

  const nextActionTitle =
    typeof nextAction === "string"
      ? nextAction
      : nextAction.title ||
        nextAction.action ||
        roadmap.nextTopic ||
        "Continue your learning journey";

  // ==========================================================
  // READINESS DESCRIPTION
  // ==========================================================

  const readinessDescription =
    readiness.description ||
    readiness.message ||
    "Your readiness is calculated from learning progress, skill coverage, projects, and interview preparation.";

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <main className="roadmap-page">
      {/* ======================================================
          MAIN FLOW NAVIGATION - TOP
      ====================================================== */}

      <section className="roadmap-flow-navigation roadmap-flow-navigation-top">
        <button
          type="button"
          className="roadmap-flow-button roadmap-flow-back"
          onClick={handleBackToResume}
        >
          <ArrowLeft size={17} />
          <span>Resume Analyzer</span>
        </button>

        <div className="roadmap-flow-current">
          <span>Step 2</span>
          <strong>Roadmap</strong>
        </div>

        <button
          type="button"
          className="roadmap-flow-button roadmap-flow-next"
          onClick={handleContinueToLearning}
        >
          <span>Learning</span>
          <ArrowRight size={17} />
        </button>
      </section>

      {/* ======================================================
          HERO
      ====================================================== */}

      <section className="roadmap-hero">
        <div className="roadmap-hero-main">
          <div className="roadmap-eyebrow">
            <BookOpen size={15} />

            <span>Personalized Learning Roadmap</span>
          </div>

          <h1>{formatValue(roadmap.career, "Your Career Path")}</h1>

          <p className="roadmap-description">
            {roadmap.description ||
              "Follow your personalized learning journey step by step and build the skills required for your target career."}
          </p>

          <div className="roadmap-meta">
            {roadmap.category && <span>{roadmap.category}</span>}

            {roadmap.difficulty && <span>{roadmap.difficulty}</span>}

            {roadmap.estimatedDuration && (
              <span>
                <Clock3 size={14} />

                {roadmap.estimatedDuration}
              </span>
            )}
          </div>

          {roadmap.careerId && (
            <div className="roadmap-career-status">
              <CheckCircle2 size={15} />

              <span>Career path active</span>
            </div>
          )}
        </div>

        {/* Hero Progress */}

        <div className="hero-progress-card">
          <div className="hero-progress-top">
            <span>Overall Progress</span>

            <strong>{overallCompletion}%</strong>
          </div>

          <div className="hero-progress-track">
            <div
              className="hero-progress-fill"
              style={{
                width: `${overallCompletion}%`,
              }}
            />
          </div>

          <div className="hero-progress-bottom">
            <span>{totalCompleted} topics completed</span>

            <span>{totalPending} remaining</span>
          </div>
        </div>
      </section>

      {/* ======================================================
          OVERVIEW
      ====================================================== */}

      <section className="roadmap-overview">
        <article className="overview-card">
          <div className="overview-icon blue">
            <TrendingUp size={19} />
          </div>

          <div>
            <span>Overall Progress</span>

            <strong>{overallCompletion}%</strong>
          </div>
        </article>

        <article className="overview-card">
          <div className="overview-icon purple">
            <Target size={19} />
          </div>

          <div>
            <span>Current Phase</span>

            <strong>Phase {currentPhase}</strong>
          </div>
        </article>

        <article className="overview-card">
          <div className="overview-icon orange">
            <BookOpen size={19} />
          </div>

          <div>
            <span>Next Topic</span>

            <strong>{roadmap.nextTopic || "Completed"}</strong>
          </div>
        </article>

        <article className="overview-card">
          <div className="overview-icon green">
            <CheckCircle2 size={19} />
          </div>

          <div>
            <span>Phases Completed</span>

            <strong>
              {completedPhases}/{phaseCount}
            </strong>
          </div>
        </article>
      </section>

      {/* ======================================================
          NEXT ACTION
      ====================================================== */}

      <section className="roadmap-next-action">
        <div className="next-action-icon">
          <Play size={19} />
        </div>

        <div className="next-action-content">
          <span>Recommended Next Action</span>

          <h2>{nextActionTitle}</h2>

          <p>
            Keep your momentum by completing the next meaningful step in your
            career journey.
          </p>
        </div>

        {roadmap.nextTopic && (
          <button
            type="button"
            className="next-action-button"
            onClick={handleNextTopic}
          >
            <span>Continue Learning</span>

            <ArrowRight size={17} />
          </button>
        )}
      </section>

      {/* ======================================================
          TODAY'S PLAN
      ====================================================== */}

      {todayPlan?.available && (
        <section className="today-plan">
          <div className="today-plan-header">
            <div className="today-plan-title">
              <div className="today-plan-icon">
                <Target size={20} />
              </div>

              <div>
                <span>Today's Plan</span>

                <h2>{todayPlan.title || "Today's Learning Plan"}</h2>
              </div>
            </div>

            <div className="today-plan-time">
              <Clock3 size={15} />

              <strong>{safeNumber(todayPlan.totalMinutes)} min</strong>
            </div>
          </div>

          <div className="today-plan-body">
            <div className="today-topic">
              <span>Phase {todayPlan.phase || currentPhase}</span>

              <strong>
                {todayPlan.phaseTitle ||
                  currentPhaseData?.title ||
                  "Current Phase"}
              </strong>

              <p>
                Today's focus:{" "}
                <b>
                  {todayPlan.topic || roadmap.nextTopic || "Continue learning"}
                </b>
              </p>
            </div>

            <div className="today-tasks">
              {safeArray(todayPlan.tasks).map((task, index) => (
                <div
                  className="today-task"
                  key={`${task?.order || index + 1}-${task?.type || "task"}`}
                >
                  <div className="task-number">{task?.order || index + 1}</div>

                  <div className="task-content">
                    <strong>{task?.title || "Learning task"}</strong>

                    <span>{safeNumber(task?.durationMinutes, 0)} min</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="today-plan-button"
              onClick={handleTodayPlan}
            >
              <span>Continue Today's Plan</span>

              <ArrowRight size={17} />
            </button>
          </div>
        </section>
      )}

      {/* ======================================================
          USER LEARNING PROFILE
      ====================================================== */}

      <section className="roadmap-profile-strip">
        <div>
          <span>Learning Style</span>

          <strong>{userProfile.learningStyle || "Mixed"}</strong>
        </div>

        <div>
          <span>Daily Study</span>

          <strong>
            {formatValue(userProfile.dailyStudyHours, "2")} hr/day
          </strong>
        </div>

        <div>
          <span>Experience</span>

          <strong>{userProfile.experienceLevel || "Beginner"}</strong>
        </div>

        <div>
          <span>Placement Focus</span>

          <strong>{userProfile.placementFocus || "Both"}</strong>
        </div>
      </section>

      {/* ======================================================
          CAREER READINESS
      ====================================================== */}

      <section className="roadmap-readiness">
        <div className="roadmap-section-heading">
          <div>
            <span>Career Readiness</span>

            <h2>How Ready Are You?</h2>

            <p>{readinessDescription}</p>
          </div>

          <div className="readiness-score">
            <strong>{readinessScore}%</strong>

            <span>{readinessLevel}</span>
          </div>
        </div>

        <div className="readiness-grid">
          <article className="readiness-card">
            <div className="readiness-card-top">
              <div className="readiness-card-icon blue">
                <BookOpen size={17} />
              </div>

              <span>Roadmap</span>

              <strong>{readinessRoadmapCompletion}%</strong>
            </div>

            <div className="readiness-track">
              <div
                style={{
                  width: `${readinessRoadmapCompletion}%`,
                }}
              />
            </div>
          </article>

          <article className="readiness-card">
            <div className="readiness-card-top">
              <div className="readiness-card-icon purple">
                <Code2 size={17} />
              </div>

              <span>Skills</span>

              <strong>{readinessSkillMatch}%</strong>
            </div>

            <div className="readiness-track">
              <div
                style={{
                  width: `${readinessSkillMatch}%`,
                }}
              />
            </div>
          </article>

          <article className="readiness-card">
            <div className="readiness-card-top">
              <div className="readiness-card-icon orange">
                <BriefcaseBusiness size={17} />
              </div>

              <span>Projects</span>

              <strong>{readinessProjectCompletion}%</strong>
            </div>

            <div className="readiness-track">
              <div
                style={{
                  width: `${readinessProjectCompletion}%`,
                }}
              />
            </div>
          </article>

          <article className="readiness-card">
            <div className="readiness-card-top">
              <div className="readiness-card-icon green">
                <MessageSquareText size={17} />
              </div>

              <span>Interview</span>

              <strong>{readinessInterviewPreparation}%</strong>
            </div>

            <div className="readiness-track">
              <div
                style={{
                  width: `${readinessInterviewPreparation}%`,
                }}
              />
            </div>
          </article>
        </div>
      </section>

      {/* ======================================================
          SKILL GAP
      ====================================================== */}

      <section className="roadmap-skill-gap">
        <div className="roadmap-section-heading">
          <div>
            <span>Skill Gap Analysis</span>

            <h2>Skills You Need for This Career</h2>

            <p>
              Your roadmap is connected to the skills required for your selected
              career.
            </p>
          </div>

          <div className="skill-match-score">
            <strong>{skillMatchPercentage}%</strong>

            <span>Skill Match</span>
          </div>
        </div>

        <div className="skill-gap-progress">
          <div className="skill-gap-progress-header">
            <span>
              {matchedSkills.length} of{" "}
              {totalRequiredSkills || requiredSkills.length} skills matched
            </span>

            <strong>{skillMatchPercentage}%</strong>
          </div>

          <div className="skill-gap-track">
            <div
              style={{
                width: `${skillMatchPercentage}%`,
              }}
            />
          </div>
        </div>

        <div className="skill-columns">
          <div className="skill-column matched">
            <div className="skill-column-heading">
              <CheckCircle2 size={17} />

              <h3>Matched Skills</h3>

              <span>{matchedSkills.length}</span>
            </div>

            {matchedSkills.length > 0 ? (
              <div className="skill-list">
                {matchedSkills.map((skill, index) => (
                  <span
                    className="skill-pill matched"
                    key={`${skill}-${index}`}
                  >
                    <CheckCircle2 size={13} />

                    {typeof skill === "string"
                      ? skill
                      : skill?.name || skill?.skill || "Skill"}
                  </span>
                ))}
              </div>
            ) : (
              <p className="skill-empty">No matched skills reported yet.</p>
            )}
          </div>

          <div className="skill-column missing">
            <div className="skill-column-heading">
              <Target size={17} />

              <h3>Skills to Build</h3>

              <span>{missingSkills.length}</span>
            </div>

            {missingSkills.length > 0 ? (
              <div className="skill-list">
                {missingSkills.map((skill, index) => (
                  <span
                    className="skill-pill missing"
                    key={`${skill}-${index}`}
                  >
                    <Target size={13} />

                    {typeof skill === "string"
                      ? skill
                      : skill?.name || skill?.skill || "Skill"}
                  </span>
                ))}
              </div>
            ) : (
              <p className="skill-empty">No missing skills reported.</p>
            )}
          </div>
        </div>
      </section>

      {/* ======================================================
          LEARNING PATH
      ====================================================== */}

      <section className="roadmap-path">
        <div className="roadmap-section-heading">
          <div>
            <span>Your Learning Journey</span>

            <h2>Learning Path</h2>

            <p>
              Complete each phase to unlock the next step of your personalized
              career journey.
            </p>
          </div>

          <div className="path-counter">
            <strong>{completedPhases}</strong>

            <span>/ {phaseCount} phases</span>
          </div>
        </div>

        <div className="roadmap-horizontal">
          {phases.map((phase, index) => {
            const isLast = index === phases.length - 1;

            return (
              <div
                className="roadmap-phase-wrapper"
                key={phase?.phase ?? `${phase?.title || "phase"}-${index}`}
              >
                <RoadmapCard
                  phase={phase}
                  careerId={roadmap.careerId || careerId}
                />

                {!isLast && (
                  <div className="phase-connector">
                    <ArrowRight size={18} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ======================================================
          CURRENT PHASE ACTION
      ====================================================== */}

      {currentPhaseData && (
        <section className="roadmap-current-phase">
          <div className="current-phase-icon">
            {currentPhaseData.status === "locked" ? (
              <Lock size={20} />
            ) : (
              <Play size={20} />
            )}
          </div>

          <div className="current-phase-content">
            <span>Current Learning Phase</span>

            <h2>
              Phase {currentPhaseData.phase}: {currentPhaseData.title}
            </h2>

            <p>
              {currentPhaseData.description ||
                "Continue with the pending topics in your current phase."}
            </p>
          </div>

          {currentPhaseData.status !== "locked" && (
            <button
              type="button"
              onClick={() => handlePhaseLearning(currentPhaseData)}
            >
              <span>
                {currentPhaseData.status === "completed"
                  ? "Review Phase"
                  : "Continue Phase"}
              </span>

              <ChevronRight size={17} />
            </button>
          )}
        </section>
      )}

      {/* ======================================================
          PROJECTS
      ====================================================== */}

      <section className="roadmap-project-section">
        <div className="roadmap-section-heading">
          <div>
            <span>Practical Experience</span>

            <h2>Build Projects</h2>

            <p>
              Projects turn your learning into practical experience and
              strengthen your portfolio.
            </p>
          </div>

          <div className="project-summary">
            <strong>{completedProjects}</strong>

            <span>/ {totalProjects} completed</span>
          </div>
        </div>

        <div className="project-overview">
          <div className="project-progress">
            <div className="project-progress-header">
              <span>Project Progress</span>

              <strong>
                {totalProjects > 0
                  ? Math.round((completedProjects / totalProjects) * 100)
                  : 0}
                %
              </strong>
            </div>

            <div className="project-progress-track">
              <div
                style={{
                  width: `${
                    totalProjects > 0
                      ? Math.min((completedProjects / totalProjects) * 100, 100)
                      : 0
                  }%`,
                }}
              />
            </div>

            <div className="project-progress-meta">
              <span>{completedProjects} completed</span>

              <span>{pendingProjects} remaining</span>
            </div>
          </div>

          {roadmap.nextProject ? (
            <button
              type="button"
              className="roadmap-project"
              onClick={handleProject}
            >
              <div className="project-icon">
                <BriefcaseBusiness size={20} />
              </div>

              <div className="project-content">
                <span>Recommended Next Project</span>

                <h2>{roadmap.nextProject}</h2>

                <p>
                  Build this project to strengthen your practical skills and
                  improve your portfolio.
                </p>
              </div>

              <ArrowRight className="project-arrow" size={21} />
            </button>
          ) : (
            <div className="project-empty">
              <Trophy size={22} />

              <div>
                <strong>No next project is available yet.</strong>

                <span>
                  Complete your current learning phase to unlock practical
                  project work.
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ======================================================
          INTERVIEW PREPARATION
      ====================================================== */}

      <section className="roadmap-interview-section">
        <div className="roadmap-section-heading">
          <div>
            <span>Placement Preparation</span>

            <h2>Interview Preparation</h2>

            <p>
              Prepare interview topics alongside your technical learning
              journey.
            </p>
          </div>

          <div className="interview-summary">
            <strong>{interviewCompletion}%</strong>

            <span>Prepared</span>
          </div>
        </div>

        <div className="interview-card">
          <div className="interview-main">
            <div className="interview-icon">
              <MessageSquareText size={21} />
            </div>

            <div>
              <h3>Interview readiness</h3>

              <p>
                {completedInterviewTopics} of {totalInterviewTopics} interview
                topics completed.
              </p>
            </div>
          </div>

          <div className="interview-progress">
            <div className="interview-progress-track">
              <div
                style={{
                  width: `${interviewCompletion}%`,
                }}
              />
            </div>

            <span>{pendingInterviewTopics} topics remaining</span>
          </div>

          {interviewTopics.length > 0 && (
            <div className="interview-topics">
              {interviewTopics.slice(0, 4).map((topic, index) => (
                <span key={`${topic}-${index}`}>
                  {typeof topic === "string"
                    ? topic
                    : topic?.title || topic?.name || "Interview Topic"}
                </span>
              ))}
            </div>
          )}

          {interviewTopics.length > 0 && (
            <button
              type="button"
              className="interview-button"
              onClick={handleInterviewPreparation}
            >
              <span>Start Interview Preparation</span>

              <ArrowRight size={17} />
            </button>
          )}
        </div>
      </section>

      {/* ======================================================
          NEXT MILESTONE
      ====================================================== */}

      {roadmap.nextMilestone && (
        <section className="roadmap-milestone">
          <div className="milestone-left">
            <div className="milestone-icon">
              <Target size={20} />
            </div>

            <div>
              <span>Next Milestone</span>

              <h3>{roadmap.nextMilestone}</h3>
            </div>
          </div>

          {roadmap.nextTopic && (
            <button type="button" onClick={handleNextTopic}>
              Continue
              <ArrowRight size={16} />
            </button>
          )}
        </section>
      )}

      {/* ======================================================
          JOURNEY SUMMARY
      ====================================================== */}

      <section className="roadmap-journey-summary">
        <div className="roadmap-section-heading">
          <div>
            <span>Career Journey</span>

            <h2>Your Progress So Far</h2>

            <p>
              A complete view of the journey you are building toward your
              selected career.
            </p>
          </div>
        </div>

        <div className="journey-summary-grid">
          <article className="journey-summary-card">
            <div className="journey-summary-icon">
              <BookOpen size={18} />
            </div>

            <span>Topics</span>

            <strong>
              {totalCompleted}/{totalCompleted + totalPending}
            </strong>

            <small>completed</small>
          </article>

          <article className="journey-summary-card">
            <div className="journey-summary-icon">
              <BriefcaseBusiness size={18} />
            </div>

            <span>Projects</span>

            <strong>
              {completedProjects}/{totalProjects}
            </strong>

            <small>completed</small>
          </article>

          <article className="journey-summary-card">
            <div className="journey-summary-icon">
              <MessageSquareText size={18} />
            </div>

            <span>Interview</span>

            <strong>
              {completedInterviewTopics}/{totalInterviewTopics}
            </strong>

            <small>prepared</small>
          </article>

          <article className="journey-summary-card">
            <div className="journey-summary-icon">
              <Trophy size={18} />
            </div>

            <span>Readiness</span>

            <strong>{readinessScore}%</strong>

            <small>{readinessLevel}</small>
          </article>
        </div>
      </section>

      {/* ======================================================
          FINAL LEARNING CTA
      ====================================================== */}

      {roadmap.nextTopic && (
        <section className="roadmap-final-cta">
          <div className="final-cta-icon">
            <Play size={22} />
          </div>

          <div className="final-cta-content">
            <span>Your next step</span>

            <h2>Continue with {roadmap.nextTopic}</h2>

            <p>
              Your roadmap is ready. Start the next learning activity and keep
              building your career path.
            </p>
          </div>

          <button type="button" onClick={handleNextTopic}>
            Start Learning
            <ArrowRight size={18} />
          </button>
        </section>
      )}

      {/* ======================================================
          MAIN FLOW NAVIGATION - BOTTOM
      ====================================================== */}

      <section className="roadmap-flow-navigation roadmap-flow-navigation-bottom">
        <button
          type="button"
          className="roadmap-flow-button roadmap-flow-back"
          onClick={handleBackToResume}
        >
          <ArrowLeft size={17} />
          <span>Back to Resume Analyzer</span>
        </button>

        <div className="roadmap-flow-current">
          <span>Current Step</span>
          <strong>Roadmap</strong>
        </div>

        <button
          type="button"
          className="roadmap-flow-button roadmap-flow-next"
          onClick={handleContinueToLearning}
        >
          <span>Continue to Learning</span>
          <ArrowRight size={17} />
        </button>
      </section>
    </main>
  );
}

export default Roadmap;
