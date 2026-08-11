import { useMemo, useState } from "react";

import CareerCard from "../CareerCard/CareerCard";
import EmptyState from "../EmptyState/EmptyState";

function CareerSearch({ careers = [] }) {
  const [search, setSearch] = useState("");

  // Make sure careers is always an array
  const careerList = Array.isArray(careers) ? careers : careers?.careers || [];

  const filteredCareers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return careerList;
    }

    return careerList.filter((career) => {
      const name = career.name?.toLowerCase() || "";

      const description = career.description?.toLowerCase() || "";

      const category =
        typeof career.category === "string"
          ? career.category.toLowerCase()
          : career.category?.name?.toLowerCase() || "";

      const skills = Array.isArray(career.skills)
        ? career.skills.some((skill) =>
            String(skill).toLowerCase().includes(keyword),
          )
        : false;

      const tags = Array.isArray(career.tags)
        ? career.tags.some((tag) => String(tag).toLowerCase().includes(keyword))
        : false;

      return (
        name.includes(keyword) ||
        description.includes(keyword) ||
        category.includes(keyword) ||
        skills ||
        tags
      );
    });
  }, [search, careerList]);

  return (
    <div className="career-search">
      <input
        type="text"
        placeholder="🔍 Search your career..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-box"
      />

      {filteredCareers.length === 0 ? (
        <EmptyState
          title="No Careers Found"
          message="Try another keyword or choose another category."
        />
      ) : (
        <div className="career-grid">
          {filteredCareers.map((career) => (
            <CareerCard key={career._id} career={career} />
          ))}
        </div>
      )}
    </div>
  );
}

export default CareerSearch;
