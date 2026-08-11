import { useNavigate } from "react-router-dom";
import "./ResourcesCard.css";

function ResourcesCard({ dashboard }) {
  const navigate = useNavigate();

  const resources = dashboard?.resources || [];

  return (
    <div className="resources-card">
      <h3>📚 Recommended Resources</h3>

      {resources.length > 0 ? (
        resources.slice(0, 3).map((resource, index) => (
          <div className="resource-item" key={index}>
            <h4>{resource.skill || resource.title}</h4>

            <p>
              {resource.type || "Learning Resource"}{" "}
              {resource.provider ? `• ${resource.provider}` : ""}
            </p>
          </div>
        ))
      ) : (
        <div className="resource-item">
          <p>No recommended resources available yet.</p>
        </div>
      )}

      <button className="resource-btn" onClick={() => navigate("/learning")}>
        View Learning Resources →
      </button>
    </div>
  );
}

export default ResourcesCard;
