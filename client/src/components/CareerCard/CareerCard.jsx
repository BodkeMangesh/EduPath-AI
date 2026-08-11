import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CareerCard.css";

import { selectCareer } from "../../services/careerService";

function CareerCard({ career }) {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const handleSelectCareer = async () => {
    try {
      setLoading(true);

      await selectCareer(career._id);

      // Store selected career
      localStorage.setItem("selectedCareerId", career._id);
      localStorage.setItem("careerName", career.name);

      // Go to assessment
      navigate("/skill-assessment");
    } catch (error) {
      console.error("Career Selection Error:", error);

      alert(error.response?.data?.message || "Unable to select career.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="career-card">
      <div className="career-header">
        <h3>{career.name}</h3>

        <span className="career-category">{career.category?.name}</span>
      </div>

      <p className="career-description">{career.description}</p>

      {career.skills && career.skills.length > 0 && (
        <div className="career-skills">
          {career.skills.slice(0, 4).map((skill, index) => (
            <span key={index} className="skill-tag">
              {skill}
            </span>
          ))}
        </div>
      )}

      <button
        className="career-btn"
        onClick={handleSelectCareer}
        disabled={loading}
      >
        {loading ? "Selecting..." : "Choose Career"}
      </button>
    </div>
  );
}

export default CareerCard;
