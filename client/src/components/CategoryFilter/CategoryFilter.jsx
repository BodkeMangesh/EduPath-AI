import "./CategoryFilter.css";

function CategoryFilter({
  categories = [],
  selectedCategory = "",
  onCategoryChange,
}) {
  return (
    <div className="category-filter">
      <button
        className={
          selectedCategory === "" ? "category-btn active" : "category-btn"
        }
        onClick={() => onCategoryChange("")}
      >
        All Careers
      </button>

      {categories.map((category) => (
        <button
          key={category._id}
          className={
            selectedCategory === category.slug
              ? "category-btn active"
              : "category-btn"
          }
          onClick={() => onCategoryChange(category.slug)}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}

export default CategoryFilter;
