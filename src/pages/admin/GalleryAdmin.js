// GalleryAdmin.js
"use client";

import { useState, useEffect } from "react";
import "./EventsAdmin.css";
import Swal from "sweetalert2";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../admin/firebase";
import {
  getGalleryPhotos,
  createGalleryPhoto,
  deleteGalleryPhoto,
} from "../admin/api/API";

const GalleryAdmin = () => {
  const [photos, setPhotos] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    tags: "",
    category: "",
  });
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const fetchPhotos = async () => {
    try {
      const data = await getGalleryPhotos();
      setPhotos(data);
    } catch (err) {
      console.error("Failed to fetch photos", err);
      Swal.fire("Error", "Failed to fetch gallery", "error");
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    try {
      const fileRef = ref(storage, `gallery/${Date.now()}_${selectedFile.name}`);
      await uploadBytes(fileRef, selectedFile);
      const url = await getDownloadURL(fileRef);
      setFormData((prev) => ({ ...prev, imageUrl: url }));
      setPreview(url);
      Swal.fire("Success", "Image uploaded!", "success");
    } catch (err) {
      console.error("Upload failed", err);
      Swal.fire("Error", "Failed to upload image", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(",").map((tag) => tag.trim()),
      };
      await createGalleryPhoto(payload);
      await fetchPhotos();
      setFormData({ title: "", description: "", imageUrl: "", tags: "", category: "" });
      setPreview(null);
      setSelectedFile(null);
      Swal.fire("Success", "Photo added!", "success");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete this photo?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
    });
    if (!confirm.isConfirmed) return;
    try {
      await deleteGalleryPhoto(id);
      await fetchPhotos();
      Swal.fire("Deleted!", "Photo has been removed.", "success");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to delete photo", "error");
    }
  };

  return (
    <div className="events-admin-container">
      <div className="events-admin-header">
        <h1>🖼️ Photo Gallery Admin</h1>
        <p>Manage your photo gallery uploads</p>
      </div>

      <div className="form-card">
        <div className="form-header">
          <h2>➕ Add New Photo</h2>
          <p>Upload photo with details</p>
        </div>

        <form onSubmit={handleSubmit} className="events-form">
          <div className="form-group">
            <label>Title</label>
            <input name="title" value={formData.title} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Tags (comma separated)</label>
            <input name="tags" value={formData.tags} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Category</label>
            <input name="category" value={formData.category} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Upload Image</label>
            <input type="file" accept="image/*" onChange={handleFileChange} />
            <button type="button" className="btn-upload" onClick={handleUpload}>
              📤 Upload Image
            </button>
          </div>

          <div className="form-group">
            <label>OR use Image URL</label>
            <input name="imageUrl" value={formData.imageUrl} onChange={handleChange} />
          </div>

          {preview && (
            <div className="image-preview">
              <img src={preview} alt="Preview" className="preview-image" />
            </div>
          )}

          <div className="form-actions">
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Photo"}
            </button>
          </div>
        </form>
      </div>

      <div className="events-section">
        <div className="section-header">
          <h2>📸 All Photos</h2>
          <div className="section-actions">
            <span className="events-count">{photos.length} Photo(s)</span>
            <button className="btn-refresh" onClick={fetchPhotos}>
              🔄 Refresh
            </button>
          </div>
        </div>

        {photos.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🖼️</div>
            <h3>No Photos Yet</h3>
            <p>Add your first photo above.</p>
          </div>
        ) : (
          <div className="events-grid">
            {photos.map((photo) => (
              <div className="event-card" key={photo._id}>
                <div className="event-image">
                  <img src={photo.imageUrl} alt={photo.title} />
                </div>
                <div className="event-content">
                  <h3 className="event-title">{photo.title}</h3>
                  <p className="event-description">{photo.description}</p>
                  <div className="event-actions">
                    <button className="btn-delete" onClick={() => handleDelete(photo._id)}>
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryAdmin;
