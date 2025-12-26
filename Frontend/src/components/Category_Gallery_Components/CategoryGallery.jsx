// CategoryGallery.jsx
import "../../styles/Category_Gallery/CategoryGallery.css";
import CategoryCard from "./CategoryCard";

const CategoryGallery = ({ categories, onCategoryClick }) => {
  return (
    <section className="category-gallery">
      <div className="category-header">
        <h2>Explore Our Sacred Creations</h2>
        <p>
          Browse our handcrafted categories with immersive 3D & gallery views
        </p>
      </div>

      <div className="category-slider">
        {categories.map((cat, index) => (
          <CategoryCard
            key={index}
            category={cat}
            onClick={() => onCategoryClick(cat.slug)}
          />
        ))}
      </div>
    </section>
  );
};

export default CategoryGallery;