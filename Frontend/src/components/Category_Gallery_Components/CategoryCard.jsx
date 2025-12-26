// CategoryCard.jsx
import "../../styles/Category_Gallery/CategoryCard.css";

const CategoryCard = ({ category, onClick }) => {
  return (
    <div className="category-slide" onClick={onClick}>
      <div className="category-slide-icon">
        <img src={category.image} alt={category.title} />
      </div>
      <h3>{category.title}</h3>
      <span className="category-cta">Explore →</span>
    </div>
  );
};

export default CategoryCard;