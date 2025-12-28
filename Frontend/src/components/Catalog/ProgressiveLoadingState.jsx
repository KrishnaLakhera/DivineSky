// src/components/Catalog/ProgressiveLoadingState.jsx
import "../../styles/Catalog/ProgressiveLoadingState.css";

export default function ProgressiveLoadingState({ productsLoaded = 0 }) {
  return (
    <div className="progressive-loading-container">
      <div className="progressive-loading-content">
        <div className="loading-spinner-wrapper">
          <div className="loading-spinner"></div>
        </div>
        <div className="loading-text">
          <h3>Loading products...</h3>
          {productsLoaded > 0 ? (
            <p className="products-count">
              {productsLoaded} products loaded so far
            </p>
          ) : (
            <p>Please wait while we fetch all categories</p>
          )}
        </div>
        <div className="loading-progress-bar">
          <div className="progress-bar-fill"></div>
        </div>
      </div>

      {/* Skeleton Grid */}
      <div className="skeleton-grid">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="skeleton-card">
            <div className="skeleton-image"></div>
            <div className="skeleton-content">
              <div className="skeleton-title"></div>
              <div className="skeleton-category"></div>
              <div className="skeleton-price"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
