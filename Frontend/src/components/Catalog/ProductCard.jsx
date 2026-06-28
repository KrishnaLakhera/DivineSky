import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Catalog/ProductCard.css";

export default function ProductCard({ 
  product, // ✅ NEW: Accept product object
  id, 
  name, 
  price, 
  images, 
  image,
  category,
  hidePrice,
  hasModel,
}) {
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();
  
  // ✅ Support both passing methods
  const productData = product || {
    id,
    name,
    price,
    images,
    image,
    category,
    hidePrice,
    hasModel
  };
  
  // Get the first image only (handle both old and new format)
  const productImage = productData.images && productData.images.length > 0 
    ? productData.images[0].url 
    : productData.image;

  // Format price in Indian Rupees
  const formatPrice = (priceValue) => {
    if (productData.hidePrice) return "📞 Call / WhatsApp: +91 97136 00059";
    else {
      const numPrice = parseFloat(priceValue) || 0;
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(numPrice);
    }
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

  // ✅ Whole-card navigation
  const handleCardClick = () => {
    navigate(`/product/${productData.category}/${productData.id}`);
  };

  // ✅ Allow keyboard users (Enter/Space) to activate the card
  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardClick();
    }
  };

  return (
    <div
      className="product-card"
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      style={{ cursor: "pointer" }}
    >
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
            alt={productData.name}
            onError={handleImageError}
            loading="lazy"
          />
        )}
        
        {/* Category Badge */}
        <div className="product-category-badge">
          {getCategoryLabel(productData.category)}
        </div>

        {/* 3D Model Badge */}
        {productData.hasModel && (
          <div className="model-badge" title="3D Model Available">
            🎨
          </div>
        )}

        {/* Image Count Badge 
        {productData.images && productData.images.length > 1 && (
          <div className="image-count-badge">
            📸 {productData.images.length}
          </div>
        )}
        */}
      </div>
      

      {/* Product Info */}
      <div className="product-info">
        <h3 className="product-name">{productData.name}</h3>

        <div className="product-footer">
          <span className="product-price">{formatPrice(productData.price)}</span>
          <button
            className="product-view-btn"
            onClick={(e) => {
              e.stopPropagation(); // prevent double-trigger from bubbling
              handleCardClick();
            }}
          >
            View Details →
          </button> 
        </div>
      </div>
    </div>
  );
}