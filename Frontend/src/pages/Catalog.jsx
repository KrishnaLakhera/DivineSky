import { useState, useEffect } from "react";
import ProductCard from "../components/Catalog/ProductCard";
import "../styles/Catalog/catalog.css";

export default function Catalog({ search }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [hoveredCategory, setHoveredCategory] = useState(null); // ✅ NEW: Track hovered category

  // ✅ NEW: Categories with subcategories
  const categories = [
    { 
      value: "all", 
      label: "All Products",
      subCategories: []
    },
    { 
      value: "altars", 
      label: "Altars & Temple Setups",
      subCategories: [
        { value: "medium", label: "Medium Size",image:"" },
        { value: "small", label: "Small Size",image:"" },
        { value: "large", label: "Large Size",image:"" },
        { value: "tovp", label: "TOVP Style Altar",image:"" },        
        { value: "sp-altar", label: "Prabhupada Altar", image:"" },
      ]
    },
    { 
      value: "deities", 
      label: "Deity Statues",
      subCategories: [
        { value: "sp", label: "SP Deity",image:"" },
        { value: "guru-parampara", label: "Guru Parampara",image:"" },
        { value: "haridas", label: "Srila Haridas Thakur Deity",image:"" },
        { value: "yashoda-damodara", label: "Yashoda Damodara",image:"" },
        { value: "custom-deity", label: "Custom Deity",image:"" },
      ]
    },
    { 
      value: "sculptures", 
      label: "3D Reviels",
      subCategories: [
        { value: "Gaura-Lila", label: "Gaura Lila",image:"" },
        { value: "Krishna-Lila", label: "Krishna Lila",image:"" },
        { value: "Other-Deities", label: "Other Deities",image:"" },
      ]
    },
    { 
      value: "custom", 
      label: "Divine Gifts",
      subCategories: [
        { value: "laser-engravings", label: "Laser Engravings",image:"" },
      ]
    },
    { 
      value: "furniture", 
      label: "Spiritual Furniture",
      subCategories: [
        { value: "tulsi-table", label: "Tulsi Table",image:"" },
        { value: "reception-table", label: "Reception Table",image:"" },
        { value: "doors", label: "Temple Doors",image:"" },
        { value: "vyasasan", label: "Vyasasan",image:"" },
        { value: "bookshelf", label: "Bookshelf", image:"" },
        { value: "mridangam-stand", label: "Mridangam Stand", image:"" },
      ]
    },
  ];

  // Fetch products from backend
  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("📥 Fetching products...");
      console.log("Category:", selectedCategory);

      let url = "http://localhost:5000/products";
      
      // If specific category selected, fetch only that category
      if (selectedCategory !== "all") {
        url = `http://localhost:5000/products/${selectedCategory}`;
      }

      console.log("Fetching from:", url);

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetched data:", data);

      if (data.success) {
        const productsArray = Array.isArray(data.products) 
          ? data.products 
          : Object.values(data.products || {});

        console.log("Products count:", productsArray.length);
        setProducts(productsArray);
      } else {
        setProducts([]);
      }

      setLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
      setLoading(false);
      setProducts([]);
    }
  };

  // ✅ NEW: Handle category change
  const handleCategoryChange = (categoryValue) => {
    setSelectedCategory(categoryValue);
    setSelectedSubCategory(""); // Reset subcategory when category changes
  };

  // ✅ NEW: Handle subcategory change
  const handleSubCategoryChange = (categoryValue, subCategoryValue) => {
    setSelectedCategory(categoryValue);
    setSelectedSubCategory(subCategoryValue);
  };

  // ✅ UPDATED: Filter products based on search and subcategory
  const filteredProducts = products.filter((p) => {
    // Search filter
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                         p.category.toLowerCase().includes(search.toLowerCase());
    
    // Subcategory filter
    const matchesSubCategory = !selectedSubCategory || p.subCategory === selectedSubCategory;
    
    return matchesSearch && matchesSubCategory;
  });

  return (
    <div className="catalog-wrapper">
      {/* Tesla-Style Category Bar with Dropdown */}
      <div className="category-bar">
        <nav 
          className="category-nav"
          onMouseLeave={() => setHoveredCategory(null)}
        >
          {categories.map((cat) => (
            <div
              key={cat.value}
              className={`category-item ${selectedCategory === cat.value ? "active" : ""} ${hoveredCategory === cat.value ? "hovered" : ""}`}
              onMouseEnter={() => cat.subCategories.length > 0 && setHoveredCategory(cat.value)}
            >
              <button
                className="category-trigger"
                onClick={() => handleCategoryChange(cat.value)}
              >
                {cat.label}
              </button>
            </div>
          ))}
        </nav>

        {/* ✅ NEW: Single mega menu that shows different content based on hovered category */}
        {hoveredCategory && categories.find(c => c.value === hoveredCategory)?.subCategories.length > 0 && (
          <div 
            className="subcategory-dropdown active"
            onMouseEnter={() => setHoveredCategory(hoveredCategory)}
            onMouseLeave={() => setHoveredCategory(null)}
          >
            <div className="subcategory-content">
              <h4 className="subcategory-title">
                {categories.find(c => c.value === hoveredCategory)?.label}
              </h4>
              <div className="subcategory-grid">
                {categories.find(c => c.value === hoveredCategory)?.subCategories.map((sub) => (
                  <button
                    key={sub.value}
                    className={`subcategory-link ${
                      selectedCategory === hoveredCategory && selectedSubCategory === sub.value 
                        ? "active" 
                        : ""
                    }`}
                    onClick={() => {
                      handleSubCategoryChange(hoveredCategory, sub.value);
                      setHoveredCategory(null);
                    }}
                  >
                    <span>{sub.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ✅ NEW: Active Filter Display */}
      {selectedSubCategory && (
        <div className="active-filters">
          <span className="filter-label">Filtered by:</span>
          <span className="filter-tag">
            {categories.find(c => c.value === selectedCategory)?.subCategories.find(s => s.value === selectedSubCategory)?.label}
            <button 
              className="filter-remove"
              onClick={() => setSelectedSubCategory("")}
            >
              ✕
            </button>
          </span>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading products...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="error-state">
          <p>Error loading products: {error}</p>
          <button onClick={fetchProducts} className="retry-btn">
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredProducts.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <p>No products found</p>
          {search && <p className="empty-hint">Try a different search term</p>}
          {selectedSubCategory && (
            <button 
              onClick={() => setSelectedSubCategory("")} 
              className="view-all-btn"
            >
              Clear Filter
            </button>
          )}
          {selectedCategory !== "all" && !search && !selectedSubCategory && (
            <button 
              onClick={() => handleCategoryChange("all")} 
              className="view-all-btn"
            >
              View All Products
            </button>
          )}
        </div>
      )}

      {/* Products Grid */}
      {!loading && !error && filteredProducts.length > 0 && (
        <>
          <div className="catalog-stats">
            <p>Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}</p>
          </div>

          <div className="catalog-grid">
            {filteredProducts.map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}