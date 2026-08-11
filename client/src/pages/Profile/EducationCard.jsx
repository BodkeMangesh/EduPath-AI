import "./EducationCard.css";

function EducationCard({ profile }) {
  const education = profile?.education;

  return (
    <div className="profile-card">
      <h2>🎓 Education</h2>

      <div className="info-grid">
        <div className="info-item">
          <label>College</label>
          <p>{education?.collegeName || "Not Added"}</p>
        </div>

        <div className="info-item">
          <label>University</label>
          <p>{education?.university || "Not Added"}</p>
        </div>

        <div className="info-item">
          <label>Degree</label>
          <p>{education?.degree || "Not Added"}</p>
        </div>

        <div className="info-item">
          <label>Branch</label>
          <p>{education?.branch || "Not Added"}</p>
        </div>

        <div className="info-item">
          <label>Semester</label>
          <p>{education?.semester}</p>
        </div>
      </div>
    </div>
  );
}

export default EducationCard;
