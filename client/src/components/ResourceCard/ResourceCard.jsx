import "./ResourceCard.css";

function ResourceCard({ resource }) {
  return (
    <div className="resource-card">
      <div className="resource-card-header">
        <span className="resource-type">{resource.type || "Resource"}</span>

        {resource.priority && (
          <span
            className={`resource-priority ${resource.priority.toLowerCase()}`}
          >
            {resource.priority}
          </span>
        )}
      </div>

      <h3>{resource.title}</h3>

      {resource.provider && (
        <p className="resource-provider">{resource.provider}</p>
      )}

      {resource.description && (
        <p className="resource-description">{resource.description}</p>
      )}

      {resource.reason && (
        <p className="resource-reason">
          <strong>Why this?</strong> {resource.reason}
        </p>
      )}

      {resource.url && (
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="resource-btn"
        >
          Open Resource →
        </a>
      )}
    </div>
  );
}

export default ResourceCard;
