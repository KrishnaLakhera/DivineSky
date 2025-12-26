import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Catalog/ProductCard.css";

export default function ProductCard({ 
  id, 
  name, 
  price, 
  images, 
  image, // Backward compatibility
  category,
  hasModel,
}) {
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();
  
  // Get the first image only (handle both old and new format)
  const productImage = images && images.length > 0 
    ? images[0].url 
    : image;

  // Format price in Indian Rupees
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Get category display name
  const getCategoryLabel = (cat) => {
    const categoryMap = {
      "altars": "Altars",
      "deities": "Deities",
      "sculptures": "3D Reviels",
      "custom": "Custom",
      "furniture": "Furniture",
    };
    return categoryMap[cat] || cat;
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="product-card">
      {/* Product Image Preview */}
      <div className="product-image">
        {imageError || !productImage ? (
          <div className="product-placeholder">
            <span className="placeholder-icon">📦</span>
            <span className="placeholder-text">Product Image</span>
          </div>
        ) : (
          <img 
            src={productImage} 
            alt={name}
            onError={handleImageError}
            loading="lazy"
          />
        )}
        
        {/* Category Badge */}
        <div className="product-category-badge">
          {getCategoryLabel(category)}
        </div>

        {/* 3D Model Badge */}
        {hasModel && (
          <div className="model-badge" title="3D Model Available">
            🎨
          </div>
        )}

        {/* Image Count Badge */}
        {images && images.length > 1 && (
          <div className="image-count-badge">
            📸 {images.length}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="product-info">
        <h3 className="product-name">{name}</h3>

       

        <div className="product-footer">
          <span className="product-price">{formatPrice(price)}</span>
          <button
            className="product-view-btn"
            onClick={() => navigate(`/product/${category}/${id}`)}
          >
            View Details →
          </button> 
        </div>
      </div>
    </div>
  );
}