import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../../config/api";
import "../../styles/Admin/ManageTestimonials.css";

export default function ManageTestimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    message: "",
    order: 0,
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.testimonials.getAll());
      const data = await response.json();

      if (data.success) {
        setTestimonials(data.testimonials);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching testimonials:", err);
      setMessage({ type: "error", text: "Failed to load testimonials" });
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("admin_token");
    const submitData = new FormData();
    submitData.append("name", formData.name);
    submitData.append("role", formData.role);
    submitData.append("message", formData.message);
    submitData.append("order", formData.order);
    if (formData.image) {
      submitData.append("image", formData.image);
    }

    try {
      const url = editingId 
        ? API_ENDPOINTS.testimonials.update(editingId)
        : API_ENDPOINTS.testimonials.create();
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: submitData,
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ 
          type: "success", 
          text: editingId ? "✅ Testimonial updated" : "✅ Testimonial created" 
        });
        fetchTestimonials();
        resetForm();
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        setMessage({ type: "error", text: data.message || "Failed to save testimonial" });
      }
    } catch (err) {
      console.error("Error saving testimonial:", err);
      setMessage({ type: "error", text: "Failed to save testimonial" });
    }
  };

  const handleEdit = (testimonial) => {
    setFormData({
      name: testimonial.name,
      role: testimonial.role,
      message: testimonial.message,
      order: testimonial.order,
      image: null,
    });
    setImagePreview(testimonial.image);
    setEditingId(testimonial.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this testimonial? This action cannot be undone.")) return;

    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`/api/testimonials/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: "success", text: "✅ Testimonial deleted" });
        fetchTestimonials();
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        setMessage({ type: "error", text: data.message || "Failed to delete" });
      }
    } catch (err) {
      console.error("Delete error:", err);
      setMessage({ type: "error", text: "Failed to delete testimonial" });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      role: "",
      message: "",
      order: testimonials.length,
      image: null,
    });
    setImagePreview(null);
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="manage-loading">
        <div className="spinner"></div>
        <p>Loading testimonials...</p>
      </div>
    );
  }

  return (
    <div className="manage-container">
      <div className="manage-header">
        <div>
          <h2>Manage Testimonials</h2>
          <p className="subtitle">Add and manage testimonials from devotees</p>
        </div>
        <button 
          className="btn-add-new"
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) resetForm();
          }}
        >
          {showForm ? "✕ Cancel" : "+ Add New Testimonial"}
        </button>
      </div>

      {/* Status Message */}
      {message.text && (
        <div className={`message message-${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="testimonial-form-card">
          <h3>{editingId ? "Edit Testimonial" : "Add New Testimonial"}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="HG Hridaya Chaitanya Prabhu"
                  required
                />
              </div>
              <div className="form-group">
                <label>Role/Title *</label>
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  placeholder="GBC, Europe"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Message/Testimonial *</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Enter testimonial message..."
                rows="4"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Display Order</label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleInputChange}
                  min="0"
                />
                <small>Lower numbers appear first</small>
              </div>

              <div className="form-group">
                <label>Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {imagePreview && (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Preview" />
                  </div>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-submit">
                {editingId ? "Update Testimonial" : "Create Testimonial"}
              </button>
              <button type="button" className="btn-cancel" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Testimonials List */}
      <div className="testimonials-list">
        {testimonials.length > 0 ? (
          <div className="testimonials-grid">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="testimonial-item">
                {testimonial.image && (
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="testimonial-image"
                  />
                )}
                <div className="testimonial-content">
                  <h4>{testimonial.name}</h4>
                  <p className="role">{testimonial.role}</p>
                  <p className="message">"{testimonial.message}"</p>
                  <div className="testimonial-meta">
                    <span className="order-badge">Order: {testimonial.order}</span>
                    <span className="date">
                      {new Date(testimonial.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="testimonial-actions">
                  <button
                    className="btn-edit"
                    onClick={() => handleEdit(testimonial)}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(testimonial.id)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">💬</div>
            <p>No testimonials yet</p>
            <p className="empty-hint">Click "Add New Testimonial" to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}