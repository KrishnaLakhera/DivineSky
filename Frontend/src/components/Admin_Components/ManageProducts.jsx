import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import EditProduct from "./EditProduct.jsx";
import "../../styles/Admin/ManageProducts.css";

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllProducts();
  }, []);

  const fetchAllProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://divinesky.onrender.com/products");
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.products);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching products:", err);
      setLoading(false);
    }
  };

  const deleteProduct = async (product, event) => {
    // Prevent row click navigation
    event.stopPropagation();
    
    if (!confirm(`Delete "${product.name}"? This action cannot be undone.`)) return;

    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(
        `https://divinesky.onrender.com/admin/products/${product.category}/${product.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage({ type: "success", text: "✅ Product deleted successfully" });
        fetchAllProducts();
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        setMessage({ type: "error", text: data.message });
      }
    } catch (err) {
      console.error("Delete error:", err);
      setMessage({ type: "error", text: "Failed to delete product" });
    }
  };

  const handleProductClick = (product) => {
    navigate(`/admin/products/edit/${product.category}/${product.id}`);
  };

  if (loading) {
    return (
      <div className="manage-loading">
        <div className="spinner"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div className="manage-container">
      <div className="manage-header">
        <h2>Manage Products</h2>
        <p className="subtitle">Click on any product to view and edit details</p>
      </div>

      {/* Status Message */}
      {message.text && (
        <div className={`message message-${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Products Table */}
      <div className="products-table-wrapper">
        <table className="products-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Images</th>
              <th>Video</th>
              <th>3D Model</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr 
                key={product.id}
                onClick={() => handleProductClick(product)}
                className="product-row"
              >
                <td>
                  {product.images?.[0]?.url ? (
                    <img 
                      src={product.images[0].url} 
                      alt={product.name}
                      className="product-thumb"
                    />
                  ) : (
                    <div className="no-thumb">📦</div>
                  )}
                </td>
                <td className="product-name-cell">{product.name}</td>
                <td>
                  <span className="category-badge">{product.category}</span>
                </td>
                <td className="price-cell">
                  ₹{product.price?.toLocaleString('en-IN')}
                </td>
                <td className="text-center">
                  <span className="count-badge">{product.images?.length || 0}</span>
                </td>
                <td className="text-center">
                  {product.video ? (
                    <span className="badge-success">✅</span>
                  ) : (
                    <span className="badge-warning">❌</span>
                  )}
                </td>
                <td className="text-center">
                  {product.hasModel ? (
                    <span className="badge-success">✅</span>
                  ) : (
                    <span className="badge-warning">❌</span>
                  )}
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProductClick(product);
                      }}
                      title="Edit product"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-delete"
                      onClick={(e) => deleteProduct(product, e)}
                      title="Delete product"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {products.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <p>No products found</p>
            <p className="empty-hint">Add your first product to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}