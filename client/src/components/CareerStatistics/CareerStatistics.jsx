import "./CareerStatistics.css";

function CareerStatistics({ statistics }) {
  if (!statistics) return null;

  const items = [
    { label: "Career paths", value: statistics.totalCareers },
    { label: "Career categories", value: statistics.totalCategories },
  ];

  return (
    <div className="career-statistics">
      {items.map(({ label, value }) => (
        <article className="career-statistics-card" key={label}>
          <strong>{value ?? 0}</strong>
          <span>{label}</span>
        </article>
      ))}
    </div>
  );
}

export default CareerStatistics;
