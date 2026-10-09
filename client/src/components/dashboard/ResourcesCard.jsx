import { useNavigate } from "react-router-dom";
import "./ResourcesCard.css";

function ResourcesCard({ dashboard }) {
  const navigate = useNavigate();

  const resources = dashboard?.resources;

  if (!resources) {
    return (
      <div className="dashboard-card resources-card">
        <h3>📚 Recommended Resources</h3>

        <div className="resources-empty">
          <p>No recommended resources available yet.</p>
        </div>

        <button className="resource-btn" onClick={() => navigate("/learning")}>
          View Learning Resources →
        </button>
      </div>
    );
  }

  const youtube = resources.youtube || [];
  const documentation = resources.documentation || [];
  const practice = resources.practice || [];
  const projects = resources.projects || [];

  return (
    <div className="dashboard-card resources-card">
      {/* Header */}
      <div className="resources-header">
        <div className="resources-title">
          <span>📚</span>

          <div>
            <h3>Recommended Resources</h3>
            <p>AI-powered learning recommendations</p>
          </div>
        </div>
      </div>

      <div className="resources-content">
        {/* Next Topic */}
        {resources.nextTopic && (
          <div className="resource-topic">
            <span className="resource-topic-label">Next Topic</span>

            <strong>🎯 {resources.nextTopic}</strong>
          </div>
        )}

        {/* YouTube */}
        {youtube.length > 0 && (
          <div className="resource-section">
            <h4 className="resource-section-title">▶️ YouTube</h4>

            <div className="resource-list">
              {youtube.slice(0, 2).map((resource, index) => (
                <div className="resource-item" key={index}>
                  <div className="resource-info">
                    <strong>{resource.title}</strong>

                    <span>{resource.provider || "YouTube"}</span>

                    {resource.reason && (
                      <p className="resource-reason">{resource.reason}</p>
                    )}

                    {resource.level && (
                      <span className="resource-level">{resource.level}</span>
                    )}
                  </div>

                  {resource.url && (
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="resource-link"
                    >
                      Open
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Documentation */}
        {documentation.length > 0 && (
          <div className="resource-section">
            <h4 className="resource-section-title">📖 Documentation</h4>

            <div className="resource-list">
              {documentation.slice(0, 2).map((resource, index) => (
                <div className="resource-item" key={index}>
                  <div className="resource-info">
                    <strong>{resource.title}</strong>

                    <span>{resource.provider || "Documentation"}</span>

                    {resource.reason && (
                      <p className="resource-reason">{resource.reason}</p>
                    )}
                  </div>

                  {resource.url && (
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="resource-link"
                    >
                      Open
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Practice */}
        {practice.length > 0 && (
          <div className="resource-section">
            <h4 className="resource-section-title">💻 Practice</h4>

            <div className="resource-list">
              {practice.slice(0, 2).map((resource, index) => (
                <div className="resource-item" key={index}>
                  <div className="resource-info">
                    <strong>{resource.title}</strong>

                    <span>{resource.provider || "Practice Platform"}</span>

                    {resource.reason && (
                      <p className="resource-reason">{resource.reason}</p>
                    )}
                  </div>

                  {resource.url && (
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="resource-link"
                    >
                      Practice
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div className="resource-section">
            <h4 className="resource-section-title">🛠️ Project</h4>

            <div className="resource-list">
              {projects.slice(0, 1).map((project, index) => (
                <div className="resource-project" key={index}>
                  <strong>{project.title}</strong>

                  {project.reason && <p>{project.reason}</p>}

                  {project.url && (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="resource-link"
                    >
                      View Project
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* View All */}
      <button className="resource-btn" onClick={() => navigate("/resources")}>
        View Learning Resources →
      </button>
    </div>
  );
}

export default ResourcesCard;
