import { useEffect, useState } from "react";

import { getResources } from "../../services/resourceService";

import ResourceCard from "../../components/ResourceCard/ResourceCard";

import "./Resources.css";

function Resources() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadResources = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getResources();

      setData(response.data.data);
    } catch (err) {
      console.error("Failed to load resources:", err);

      setError("Unable to load resources.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  if (loading) {
    return (
      <div className="resources-page">
        <div className="resources-loading">
          Loading personalized resources...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="resources-page">
        <div className="resources-error">
          <p>{error}</p>

          <button onClick={loadResources}>Retry</button>
        </div>
      </div>
    );
  }

  const resources = data?.resources || {};

  const allResources = [
    ...(resources.youtube || []).map((item) => ({
      ...item,
      type: "YouTube",
    })),

    ...(resources.documentation || []).map((item) => ({
      ...item,
      type: "Documentation",
    })),

    ...(resources.practice || []).map((item) => ({
      ...item,
      type: "Practice",
    })),
  ];

  return (
    <div className="resources-page">
      <div className="resources-container">
        <section className="resources-hero">
          <span className="resources-label">Personalized Learning</span>

          <h1>Learning Resources</h1>

          <p>
            Resources recommended specifically for your current learning
            journey.
          </p>
        </section>

        {data?.career && (
          <div className="resource-context">
            <div>
              <span>Career</span>
              <strong>{data.career}</strong>
            </div>

            <div>
              <span>Current Phase</span>
              <strong>Phase {data.currentPhase}</strong>
            </div>

            <div>
              <span>Next Topic</span>
              <strong>{data.nextTopic || "All topics completed"}</strong>
            </div>
          </div>
        )}

        {allResources.length === 0 ? (
          <div className="no-resources">
            <h2>No resources available</h2>

            <p>
              We couldn't find personalized resources for your current learning
              path.
            </p>
          </div>
        ) : (
          <section className="resources-grid">
            {allResources.map((resource, index) => (
              <ResourceCard
                key={`${resource.title}-${index}`}
                resource={resource}
              />
            ))}
          </section>
        )}

        {resources.projects?.length > 0 && (
          <section className="projects-section">
            <h2>Recommended Projects</h2>

            <div className="resources-grid">
              {resources.projects.map((project, index) => (
                <ResourceCard
                  key={`${project.title}-${index}`}
                  resource={{
                    ...project,
                    type: "Project",
                  }}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default Resources;
