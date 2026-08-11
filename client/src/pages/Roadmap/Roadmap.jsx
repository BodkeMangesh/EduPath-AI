import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

import { getRoadmap } from "../../services/roadmapService";
import RoadmapCard from "../../components/RoadmapCard/RoadmapCard";

import "./Roadmap.css";

function Roadmap() {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const careerId = localStorage.getItem("careerId") || "full-stack";

  const loadRoadmap = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getRoadmap(careerId);

      const roadmapData = response?.data?.data;

      if (!roadmapData) {
        throw new Error("Roadmap data not found.");
      }

      setRoadmap(roadmapData);
    } catch (err) {
      console.error("Failed to load roadmap:", err);

      const message =
        err.response?.data?.message || err.message || "Unable to load roadmap.";

      setError(message);

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoadmap();
  }, [careerId]);

  if (loading) {
    return (
      <div className="roadmap-page">
        <div className="roadmap-loading">
          <div className="roadmap-loader"></div>
          <p>Loading your roadmap...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="roadmap-page">
        <div className="roadmap-error">
          <h2>Unable to Load Roadmap</h2>

          <p>{error}</p>

          <button onClick={loadRoadmap}>Retry</button>
        </div>
      </div>
    );
  }

  if (!roadmap) {
    return null;
  }

  return (
    <div className="roadmap-page">
      {/* Header */}
      <section className="roadmap-header">
        <div>
          <span className="roadmap-label">Learning Roadmap</span>

          <h1>{roadmap.career}</h1>

          <p>Follow your personalized learning journey step by step.</p>
        </div>

        <div className="roadmap-duration">
          <span>Estimated Duration</span>
          <strong>{roadmap.estimatedDuration}</strong>
        </div>
      </section>

      {/* Progress Overview */}
      <section className="roadmap-overview">
        <div className="overview-card">
          <span>Overall Progress</span>

          <strong>{roadmap.overallCompletion}%</strong>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${roadmap.overallCompletion}%`,
              }}
            ></div>
          </div>
        </div>

        <div className="overview-card">
          <span>Current Phase</span>

          <strong>Phase {roadmap.currentPhase}</strong>
        </div>

        <div className="overview-card">
          <span>Next Topic</span>

          <strong>{roadmap.nextTopic || "Completed"}</strong>
        </div>

        <div className="overview-card">
          <span>Status</span>

          <strong className={roadmap.status?.toLowerCase()}>
            {roadmap.status}
          </strong>
        </div>
      </section>

      {/* Next Milestone */}
      <section className="next-milestone">
        <div className="milestone-icon">🎯</div>

        <div>
          <span>Next Milestone</span>

          <h3>{roadmap.nextMilestone}</h3>
        </div>
      </section>

      {/* Phases */}
      <section className="roadmap-phases">
        <div className="section-heading">
          <h2>Your Learning Path</h2>

          <p>Complete each phase to move forward in your career journey.</p>
        </div>

        <div className="roadmap-list">
          {Array.isArray(roadmap.phases) &&
            roadmap.phases.map((phase) => (
              <RoadmapCard key={phase.phase} phase={phase} />
            ))}
        </div>
      </section>

      {/* Project */}
      {roadmap.nextProject && (
        <section className="roadmap-project">
          <span>Next Recommended Project</span>

          <h2>{roadmap.nextProject}</h2>

          <p>Build this project to strengthen your practical skills.</p>
        </section>
      )}
    </div>
  );
}

export default Roadmap;
