import { useNavigate } from "react-router-dom";
import { Lock, CheckCircle2, ArrowRight, Play } from "lucide-react";

import "./RoadmapCard.css";

function RoadmapCard({ phase, careerId }) {
  const navigate = useNavigate();

  if (!phase) {
    return null;
  }

  // ==========================================================
  // NORMALIZE PHASE DATA
  // ==========================================================

  const phaseNumber = phase.phase ?? phase.phaseNumber ?? phase.number ?? "";

  const phaseTitle = phase.title || phase.phaseTitle || `Phase ${phaseNumber}`;

  const topics = Array.isArray(phase.topics) ? phase.topics : [];

  const completedTopics = Array.isArray(phase.completedTopics)
    ? phase.completedTopics
    : [];

  const pendingTopics = Array.isArray(phase.pendingTopics)
    ? phase.pendingTopics
    : [];

  const completion = Number(phase.completion) || 0;

  const status = phase.status || "locked";

  const action = phase.action || "locked";

  const isCompleted = status === "completed" || completion >= 100;

  const isLocked = status === "locked" || action === "locked";

  const isCurrent = Boolean(phase.isCurrent) && !isLocked && !isCompleted;

  // ==========================================================
  // START / CONTINUE LEARNING
  // ==========================================================

  const handleLearning = () => {
    /*
     * Career ID priority:
     *
     * 1. Career ID passed from Roadmap
     * 2. Career ID attached to phase
     * 3. Local storage
     */

    const selectedCareerId =
      careerId ||
      phase.careerId ||
      localStorage.getItem("selectedCareerId") ||
      "";

    if (!selectedCareerId) {
      console.error("RoadmapCard: Career ID is missing.", {
        careerId,
        phase,
      });

      return;
    }

    if (isLocked || isCompleted) {
      return;
    }

    // ========================================================
    // FIND FIRST PENDING TOPIC
    // ========================================================

    const firstPendingTopic =
      pendingTopics.length > 0
        ? pendingTopics[0]
        : topics.find((topic) => {
            return !completedTopics.some(
              (completedTopic) =>
                String(completedTopic).trim().toLowerCase() ===
                String(topic).trim().toLowerCase(),
            );
          }) || "";

    if (!phaseNumber) {
      console.error("RoadmapCard: Phase number is missing.", {
        phase,
        phaseNumber,
      });

      return;
    }

    if (!firstPendingTopic) {
      console.error("RoadmapCard: Learning topic is missing.", {
        phase,
        topics,
        pendingTopics,
      });

      return;
    }

    // ========================================================
    // DEBUG
    // ========================================================

    console.log("RoadmapCard → Resources navigation:", {
      careerId: selectedCareerId,
      phase: phaseNumber,
      phaseTitle,
      topic: firstPendingTopic,
      topics,
      pendingTopics,
    });

    // ========================================================
    // NAVIGATE TO RESOURCES
    // ========================================================
    //
    // We send the data in BOTH:
    //
    // 1. URL query parameters
    // 2. React Router state
    //
    // This makes Resources work even if the route is refreshed.
    //

    const params = new URLSearchParams({
      careerId: String(selectedCareerId),
      phase: String(phaseNumber),
      phaseTitle: String(phaseTitle),
      topic: String(firstPendingTopic),
    });

    navigate(`/resources?${params.toString()}`, {
      state: {
        careerId: selectedCareerId,
        phase: phaseNumber,
        phaseTitle,
        topic: firstPendingTopic,
        topics,
        pendingTopics,
        learningAction: action === "continue" ? "continue" : "start",
        source: "roadmap-card",
      },
    });
  };

  // ==========================================================
  // STATUS
  // ==========================================================

  const getStatusText = () => {
    if (isCompleted) {
      return "Completed";
    }

    if (isLocked) {
      return "Locked";
    }

    if (action === "continue") {
      return "In Progress";
    }

    return "Ready to Start";
  };

  // ==========================================================
  // BUTTON
  // ==========================================================

  const getButtonText = () => {
    if (action === "continue") {
      return "Continue";
    }

    return "Start Learning";
  };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <article
      className={`roadmap-card
        ${isCompleted ? "is-completed" : ""}
        ${isLocked ? "is-locked" : ""}
        ${isCurrent ? "is-current" : ""}
      `}
    >
      {/* =====================================================
          CARD TOP
      ===================================================== */}

      <div className="roadmap-card-top">
        <div className="phase-badge">
          <span>PHASE</span>

          <strong>{phaseNumber || "—"}</strong>
        </div>

        <div className="phase-status">
          {isCompleted && (
            <>
              <CheckCircle2 size={16} />
              <span>Completed</span>
            </>
          )}

          {isLocked && !isCompleted && (
            <>
              <Lock size={15} />
              <span>Locked</span>
            </>
          )}

          {isCurrent && (
            <>
              <span className="status-dot" />

              <span>{getStatusText()}</span>
            </>
          )}
        </div>
      </div>

      {/* =====================================================
          TITLE
      ===================================================== */}

      <div className="roadmap-card-content">
        <h3>{phaseTitle}</h3>

        <p className="phase-duration">
          {phase.duration || "Flexible duration"}
        </p>
      </div>

      {/* =====================================================
          PROGRESS
      ===================================================== */}

      <div className="phase-progress-section">
        <div className="phase-progress-info">
          <span>Phase Progress</span>

          <strong>{completion}%</strong>
        </div>

        <div className="phase-progress-track">
          <div
            className="phase-progress-fill"
            style={{
              width: `${Math.min(Math.max(completion, 0), 100)}%`,
            }}
          />
        </div>
      </div>

      {/* =====================================================
          TOPICS
      ===================================================== */}

      <div className="roadmap-card-topics">
        <div className="topics-heading">
          <span>Topics</span>

          <strong>
            {completedTopics.length}/{topics.length}
          </strong>
        </div>

        <div className="topics-preview">
          {topics.slice(0, 4).map((topic, index) => {
            const completed = completedTopics.some(
              (completedTopic) =>
                String(completedTopic).trim().toLowerCase() ===
                String(topic).trim().toLowerCase(),
            );

            return (
              <div
                className={`topic-item ${completed ? "completed" : ""}`}
                key={`${topic}-${index}`}
              >
                <span className="topic-check">{completed ? "✓" : "○"}</span>

                <span className="topic-text">{topic}</span>
              </div>
            );
          })}
        </div>

        {topics.length > 4 && (
          <span className="more-topics">+{topics.length - 4} more topics</span>
        )}
      </div>

      {/* =====================================================
          ACTION
      ===================================================== */}

      <div className="roadmap-card-action">
        {isCompleted ? (
          <div className="completed-message">
            <CheckCircle2 size={18} />

            <span>Phase successfully completed</span>
          </div>
        ) : isLocked ? (
          <div className="locked-message">
            <Lock size={17} />

            <span>Complete the previous phase to unlock</span>
          </div>
        ) : (
          <button
            type="button"
            className="phase-action-button"
            onClick={handleLearning}
          >
            <span className="action-icon">
              {action === "continue" ? (
                <ArrowRight size={18} />
              ) : (
                <Play size={17} />
              )}
            </span>

            <span>{getButtonText()}</span>

            <ArrowRight size={17} className="action-arrow" />
          </button>
        )}
      </div>
    </article>
  );
}

export default RoadmapCard;
