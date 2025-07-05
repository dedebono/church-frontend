"use client"

import { useState, useEffect } from "react"
import "./GalleryAdmin.css"
import Swal from "sweetalert2"
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"
import { storage } from "../admin/firebase"
import { getGalleryPhotos, createGalleryPhoto, deleteGalleryPhoto } from "../admin/api/API"

const GalleryAdmin = () => {
  const [photos, setPhotos] = useState([])

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    tags: "",
    category: "",
  })

  const [loading, setLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  const MAX_FILE_SIZE_MB = 2

  useEffect(() => {
    fetchPhotos()
  }, [])

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      alert(`File size exceeds ${MAX_FILE_SIZE_MB}MB`)
      setSelectedFile(null)
      setPreview(null)
      return
    }

    setSelectedFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setPreview(reader.result)
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setLoading(true)
    setUploadProgress(0)

    try {
      const fileRef = ref(storage, `gallery/${Date.now()}_${selectedFile.name}`)
      const uploadTask = uploadBytesResumable(fileRef, selectedFile)

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          setUploadProgress(progress)
        },
        (error) => {
          console.error("Upload failed", error)
          Swal.fire("Error", "Failed to upload image", "error")
          setLoading(false)
        },
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref)
          setFormData((prev) => ({ ...prev, imageUrl: url }))
          setPreview(url)
          Swal.fire("Success", "Image uploaded!", "success")
          setLoading(false)
          setUploadProgress(0)
        },
      )
    } catch (err) {
      console.error("Upload failed", err)
      Swal.fire("Error", "Failed to upload image", "error")
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(",").map((tag) => tag.trim()),
      }
      await createGalleryPhoto(payload)
      await fetchPhotos()
      setFormData({ title: "", description: "", imageUrl: "", tags: "", category: "" })
      setPreview(null)
      setSelectedFile(null)
      Swal.fire("Success", "Photo added!", "success")
    } catch (err) {
      console.error(err)
      Swal.fire("Error", err.message, "error")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete this photo?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
    })
    if (!confirm.isConfirmed) return
    try {
      await deleteGalleryPhoto(id)
      await fetchPhotos()
      Swal.fire("Deleted!", "Photo has been removed.", "success")
    } catch (err) {
      console.error(err)
      Swal.fire("Error", "Failed to delete photo", "error")
    }
  }

  const fetchPhotos = async () => {
    try {
      const data = await getGalleryPhotos()
      setPhotos(data)
    } catch (err) {
      console.error("Failed to fetch photos", err)
      Swal.fire("Error", "Failed to fetch gallery", "error")
    }
  }

  return (
    <div className="gallery-admin-container">
      {/* Header */}
      <div className="gallery-admin-header">
        <h1>Photo Gallery Admin</h1>
      </div>

      <div className="gallery-admin-content">
        {/* Add New Photo Form */}
        <div className="form-card">
          <div className="form-header">
            <h2>Add New Photo</h2>
            <p>Upload photo with details</p>
          </div>

          <form onSubmit={handleSubmit} className="gallery-form">
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
              <label>Upload Image (Max {MAX_FILE_SIZE_MB}MB)</label>
              <input type="file" accept="image/*" onChange={handleFileChange} />
              <button type="button" className="btn-upload" onClick={handleUpload} disabled={!selectedFile || loading}>
                Choose File
              </button>

              {loading && uploadProgress > 0 && (
                <div className="progress-bar-container">
                  <div className="progress-bar" style={{ width: `${uploadProgress}%` }}>
                    {uploadProgress.toFixed(0)}%
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>OR use Image URL</label>
              <input name="imageUrl" value={formData.imageUrl} onChange={handleChange} />
            </div>

            {preview && (
              <div className="image-preview">
                <img src={preview || "/placeholder.svg"} alt="Preview" className="preview-image" />
                <p className="preview-text">Sample Photo for upload</p>
              </div>
            )}

            <div className="form-actions">
              <button className="btn-primary" type="submit" disabled={loading || (!formData.imageUrl && !preview)}>
                {loading ? "Saving..." : "Save Photo"}
              </button>
            </div>
          </form>
        </div>

        {/* Photos Grid */}
        <div className="photos-section">
          <div className="section-header">
            <div>
              <h2>All Photos</h2>
              <span className="photos-count">{photos.length} Photo(s)</span>
            </div>
            <button className="btn-refresh" onClick={fetchPhotos}>
              🔄 Refresh
            </button>
          </div>

          {photos.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🖼️</div>
              <h3>No Photos Yet</h3>
              <p>Add your first photo above.</p>
            </div>
          ) : (
            <div className="photos-grid">
              {photos.map((photo) => (
                <div className="photo-card" key={photo._id}>
                  <div className="photo-image">
                    <img src={photo.imageUrl || "/placeholder.svg"} alt={photo.title} />
                    <button className="btn-delete-overlay" onClick={() => handleDelete(photo._id)}>
                      🗑️
                    </button>
                  </div>
                  <button className="btn-title">{photo.title}</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default GalleryAdmin
