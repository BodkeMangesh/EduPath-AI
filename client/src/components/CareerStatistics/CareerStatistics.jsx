import "./CareerStatistics.css";

function CareerStatistics({ statistics }) {
  return (
    <div className="career-statistics">
      <div className="stat-card">
        <h2>{statistics?.totalCareers || 0}</h2>
        <p>Total Careers</p>
      </div>

      <div className="stat-card">
        <h2>{statistics?.totalCategories || 0}</h2>
        <p>Career Categories</p>
      </div>
    </div>
  );
}

export default CareerStatistics;
