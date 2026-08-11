import "./ProfessionalCard.css";

function ProfessionalCard({ profile }) {
  const professional = profile?.professional;

  return (
    <div className="profile-card">
      <h2>💼 Professional Details</h2>

      <div className="info-grid">
        <div className="info-item">
          <label>Experience Level</label>
          <p>{professional?.experienceLevel || "Not Added"}</p>
        </div>

        <div className="info-item">
          <label>Skills</label>
          <p>
            {professional?.skills?.length
              ? professional.skills.join(", ")
              : "No Skills Added"}
          </p>
        </div>

        <div className="info-item">
          <label>Certifications</label>
          <p>
            {professional?.certifications?.length
              ? professional.certifications.join(", ")
              : "No Certifications"}
          </p>
        </div>

        <div className="info-item">
          <label>Projects</label>
          <p>
            {professional?.projects?.length ? professional.projects.length : 0}{" "}
            Projects
          </p>
        </div>

        <div className="info-item">
          <label>Resume</label>

          {professional?.resumeUrl ? (
            <a href={professional.resumeUrl} target="_blank" rel="noreferrer">
              View Resume
            </a>
          ) : (
            <p>No Resume Uploaded</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfessionalCard;
