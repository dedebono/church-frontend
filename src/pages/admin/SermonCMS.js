"use client"

import { useState, useEffect } from "react"
import "./SermonCMS.css"
import { getSermons, createSermon, updateSermon, deleteSermon, healthCheck } from "../admin/api/API"
import Swal from "sweetalert2"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { storage } from "../admin/firebase" // your Firebase config
import {
  Mic2,
  AlertTriangle,
  Plus,
  Edit,
  Calendar,
  User,
  Image as ImageIcon,
  Music,
  Upload,
  Link,
  Eye,
  Trash2,
  Edit2
} from "lucide-react";

const SermonCMS = () => {
  const [sermons, setSermons] = useState([])
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    title: "",
    preacher: "",
    date: "",
    time: "",
    description: "",
    imageUrl: "",
    audioUrl: "",
  })

  // File upload states
  const [selectedImageFile, setSelectedImageFile] = useState(null)
  const [selectedAudioFile, setSelectedAudioFile] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingAudio, setUploadingAudio] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)

  // UI States
  const [activeTab, setActiveTab] = useState({ image: 'file', audio: 'file' })

  // Reset form data when editing changes
  useEffect(() => {
    if (editing) {
      setFormData(editing)
      setImagePreview(editing.imageUrl)
    } else {
      setFormData({
        title: "",
        preacher: "",
        date: "",
        time: "",
        description: "",
        imageUrl: "",
        audioUrl: "",
      })
      setImagePreview(null)
    }
    // Reset file selections
    setSelectedImageFile(null)
    setSelectedAudioFile(null)
  }, [editing])

  const fetchSermons = async () => {
    try {
      console.log("🔄 Fetching sermons using API utility...")
      const data = await getSermons()
      console.log("📥 Sermons fetched:", data)

      // Ensure data is an array
      const sermonsArray = Array.isArray(data) ? data : []
      setSermons(sermonsArray)
      setError(null)
    } catch (err) {
      console.error("🚨 Fetch error:", err)
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch sermons"
      setError(errorMessage)

      // Only show error alert if it's not a network issue during initial load
      if (sermons.length === 0) {
        Swal.fire({
          icon: "error",
          title: "Connection Error",
          html: `
            <div style="text-align: left;">
              <p><strong>Error:</strong> ${errorMessage}</p>
              <p><strong>This could be due to:</strong></p>
              <ul style="text-align: left; margin: 1rem 0;">
                <li>Server is temporarily unavailable</li>
                <li>Network connectivity issues</li>
                <li>API endpoint changes</li>
              </ul>
              <p>The system will automatically try the backup server if available.</p>
            </div>
          `,
          confirmButtonColor: "#dc2626",
          width: "500px",
        })
      }
    }
  }

  useEffect(() => {
    fetchSermons()
  }, [])

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  // Handle image file selection
  const handleImageFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      Swal.fire({
        icon: "error",
        title: "Invalid File Type",
        text: "Only image files are allowed.",
      })
      e.target.value = ""
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 2 * 1024 * 1024) {
      Swal.fire({
        icon: "error",
        title: "File Too Large",
        text: "Image file size must be under 2MB.",
      })
      e.target.value = ""
      return
    }

    setSelectedImageFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => setImagePreview(e.target.result)
    reader.readAsDataURL(file)
  }

  // Handle audio file selection
  const handleAudioFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("audio/")) {
      Swal.fire({
        icon: "error",
        title: "Invalid File Type",
        text: "Only audio files are allowed.",
      })
      e.target.value = ""
      return
    }

    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      Swal.fire({
        icon: "error",
        title: "File Too Large",
        text: "Audio file size must be under 50MB.",
      })
      e.target.value = ""
      return
    }

    setSelectedAudioFile(file)
  }

  // Upload image to Firebase
  const handleImageUpload = async () => {
    if (!selectedImageFile) {
      Swal.fire({
        icon: "warning",
        title: "No File Selected",
        text: "Please select an image file first.",
      })
      return
    }

    try {
      setUploadingImage(true)

      const timestamp = Date.now()
      const fileName = `sermon_images/${timestamp}_${selectedImageFile.name}`
      const fileRef = ref(storage, fileName)

      await uploadBytes(fileRef, selectedImageFile)
      const downloadURL = await getDownloadURL(fileRef)

      // Update form data with the uploaded image URL
      setFormData((prev) => ({ ...prev, imageUrl: downloadURL }))
      setImagePreview(downloadURL)

      Swal.fire({
        icon: "success",
        title: "Image Uploaded!",
        text: "Image uploaded successfully!",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
      })

      setSelectedImageFile(null)
      // Clear the file input
      const fileInput = document.getElementById("imageFile")
      if (fileInput) fileInput.value = ""
    } catch (error) {
      console.error("Image upload error:", error)
      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text: "An error occurred while uploading the image.",
      })
    } finally {
      setUploadingImage(false)
    }
  }

  // Upload audio to Firebase
  const handleAudioUpload = async () => {
    if (!selectedAudioFile) {
      Swal.fire({
        icon: "warning",
        title: "No File Selected",
        text: "Please select an audio file first.",
      })
      return
    }

    try {
      setUploadingAudio(true)

      const timestamp = Date.now()
      const fileName = `sermon_audio/${timestamp}_${selectedAudioFile.name}`
      const fileRef = ref(storage, fileName)

      await uploadBytes(fileRef, selectedAudioFile)
      const downloadURL = await getDownloadURL(fileRef)

      // Update form data with the uploaded audio URL
      setFormData((prev) => ({ ...prev, audioUrl: downloadURL }))

      Swal.fire({
        icon: "success",
        title: "Audio Uploaded!",
        text: "Audio uploaded successfully!",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
      })

      setSelectedAudioFile(null)
      // Clear the file input
      const fileInput = document.getElementById("audioFile")
      if (fileInput) fileInput.value = ""
    } catch (error) {
      console.error("Audio upload error:", error)
      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text: "An error occurred while uploading the audio.",
      })
    } finally {
      setUploadingAudio(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      let saved
      if (editing) {
        console.log("🔄 Updating sermon:", editing._id)
        saved = await updateSermon(editing._id, formData)
      } else {
        console.log("🔄 Creating new sermon")
        saved = await createSermon(formData)
      }

      console.log(`✅ Sermon ${editing ? "updated" : "added"}:`, saved)

      setEditing(null)
      setError(null)
      await fetchSermons()

      // Success notification
      Swal.fire({
        icon: "success",
        title: editing ? "Sermon Updated!" : "Sermon Added!",
        text: `${formData.title} has been ${editing ? "updated" : "added"} successfully.`,
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
      })
    } catch (err) {
      console.error("🚨 Save error:", err)
      const errorMessage = err.response?.data?.message || err.message || "Failed to save sermon"
      setError(errorMessage)

      // Error notification
      Swal.fire({
        icon: "error",
        title: "Save Failed",
        html: `
          <div style="text-align: left;">
            <p><strong>Error:</strong> ${errorMessage}</p>
            <p><strong>Please check:</strong></p>
            <ul style="text-align: left; margin: 1rem 0;">
              <li>All required fields are filled correctly</li>
              <li>URLs are valid and accessible</li>
              <li>Your internet connection</li>
            </ul>
          </div>
        `,
        confirmButtonColor: "#dc2626",
        width: "500px",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (sermon) => {
    setEditing(sermon)
    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleDelete = async (id) => {
    const sermon = sermons.find((s) => s._id === id)

    const result = await Swal.fire({
      title: "Are you sure?",
      html: `You are about to delete:<br><strong>"${sermon?.title}"</strong><br><br>This action cannot be undone!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    })

    if (!result.isConfirmed) return

    try {
      console.log("🔄 Deleting sermon:", id)
      await deleteSermon(id)
      await fetchSermons()
      setError(null)

      // Success notification
      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: `"${sermon?.title}" has been deleted successfully.`,
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
      })
    } catch (err) {
      console.error("🚨 Delete error:", err)
      const errorMessage = err.response?.data?.message || err.message || "Failed to delete sermon"
      setError(errorMessage)

      // Error notification
      Swal.fire({
        icon: "error",
        title: "Delete Failed",
        text: errorMessage,
        confirmButtonColor: "#dc2626",
      })
    }
  }

  const cancelEdit = () => {
    setEditing(null)
  }

  const showSermonDetails = (sermon) => {
    Swal.fire({
      title: sermon.title,
      html: `
        <div style="text-align: left; margin: 1rem 0;">
          <p><strong>Preacher:</strong> ${sermon.preacher}</p>
          <p><strong>Date:</strong> ${new Date(sermon.date).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${sermon.time}</p>
          <p><strong>Description:</strong></p>
          <p style="margin-top: 0.5rem; color: #666;">${sermon.description}</p>
          ${sermon.imageUrl ? `<img src="${sermon.imageUrl}" alt="${sermon.title}" style="width: 100%; max-width: 300px; margin: 1rem 0; border-radius: 8px;">` : ""}
          ${sermon.audioUrl ? `<p><strong>Audio:</strong> <a href="${sermon.audioUrl}" target="_blank" style="color: #3b82f6;">Listen to sermon</a></p>` : ""}
        </div>
      `,
      width: "600px",
      showCloseButton: true,
      showConfirmButton: false,
      customClass: {
        popup: "sermon-details-popup",
      },
    })
  }

  const refreshSermons = async () => {
    await fetchSermons()
    Swal.fire({
      icon: "success",
      title: "Refreshed!",
      text: "Sermons list has been updated.",
      timer: 2000,
      timerProgressBar: true,
      showConfirmButton: false,
      toast: true,
      position: "top-end",
    })
  }

  const testApiConnection = async () => {
    try {
      console.log("🧪 Testing API connection...")
      const health = await healthCheck()

      Swal.fire({
        icon: health.ok ? "success" : "error",
        title: "API Connection Test",
        html: `
          <div style="text-align: left; font-family: monospace; font-size: 12px;">
            <p><strong>Status:</strong> ${health.status}</p>
            <p><strong>OK:</strong> ${health.ok}</p>
            <p><strong>Backend:</strong> ${health.backend}</p>
            <p><strong>Active Backend Index:</strong> ${health.activeBackendIndex}</p>
            ${health.error ? `<p><strong>Error:</strong> ${health.error}</p>` : ""}
          </div>
        `,
        width: "600px",
      })
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "API Test Failed",
        text: error.message,
      })
    }
  }

  return (
    <div className="sermon-cms-container">
      {/* Header */}
      <div className="cms-header">
        <h1><Mic2 className="inline-icon" size={28} /> Sermon Management</h1>
        <p>Manage your church sermons, recordings, and resources.</p>

        <button
          onClick={testApiConnection}
          style={{ marginTop: '12px', fontSize: '12px', opacity: 0.7 }}
        >
          Test API
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="error-alert">
          <span><AlertTriangle size={18} /> {error}</span>
          <button onClick={refreshSermons} style={{ marginLeft: "auto", fontWeight: 'bold' }}>Retry</button>
        </div>
      )}

      {/* Sermon Form */}
      <div className="form-card">
        <div className="form-header">
          <h2>{editing ? <><Edit size={20} /> Edit Sermon</> : <><Plus size={20} /> Add New Sermon</>}</h2>
          <p>{editing ? "Update the details below" : "Fill in the information to create a new sermon entry"}</p>
        </div>

        <form onSubmit={handleSubmit} className="sermon-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                id="title"
                name="title"
                type="text"
                placeholder="e.g. The Power of Faith"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="preacher">Preacher</label>
              <input
                id="preacher"
                name="preacher"
                type="text"
                placeholder="e.g. Rev. John Doe"
                value={formData.preacher}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">Date</label>
              <input id="date" name="date" type="date" value={formData.date} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label htmlFor="time">Time</label>
              <input id="time" name="time" type="time" value={formData.time} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              placeholder="Brief summary or scripture references..."
              value={formData.description}
              onChange={handleChange}
              rows={4}
              required
            />
          </div>

          {/* Image Upload Section */}
          <div className="form-group upload-group">
            <label>Sermon Image</label>
            <div className="upload-tabs">
              <button
                type="button"
                className={`upload-tab ${activeTab.image === 'file' ? 'active' : ''}`}
                onClick={() => setActiveTab(prev => ({ ...prev, image: 'file' }))}
              >
                <Upload size={14} /> File Upload
              </button>
              <button
                type="button"
                className={`upload-tab ${activeTab.image === 'url' ? 'active' : ''}`}
                onClick={() => setActiveTab(prev => ({ ...prev, image: 'url' }))}
              >
                <Link size={14} /> Media URL
              </button>
            </div>

            {activeTab.image === 'file' ? (
              <div className="upload-area">
                <div className="file-input-wrapper">
                  <input
                    id="imageFile"
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => document.getElementById('imageFile').click()}
                  >
                    {selectedImageFile ? selectedImageFile.name : "Choose Image File"}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleImageUpload}
                  disabled={!selectedImageFile || uploadingImage}
                  className="btn-upload"
                >
                  {uploadingImage ? "Uploading..." : "Upload"}
                </button>
              </div>
            ) : (
              <input
                name="imageUrl"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={formData.imageUrl}
                onChange={handleChange}
              />
            )}

            {imagePreview && (
              <div className="media-preview">
                <img src={imagePreview} alt="Preview" className="preview-image" />
              </div>
            )}
          </div>

          {/* Audio Upload Section */}
          <div className="form-group upload-group">
            <label>Sermon Audio</label>
            <div className="upload-tabs">
              <button
                type="button"
                className={`upload-tab ${activeTab.audio === 'file' ? 'active' : ''}`}
                onClick={() => setActiveTab(prev => ({ ...prev, audio: 'file' }))}
              >
                <Upload size={14} /> File Upload
              </button>
              <button
                type="button"
                className={`upload-tab ${activeTab.audio === 'url' ? 'active' : ''}`}
                onClick={() => setActiveTab(prev => ({ ...prev, audio: 'url' }))}
              >
                <Link size={14} /> Audio URL
              </button>
            </div>

            {activeTab.audio === 'file' ? (
              <div className="upload-area">
                <div className="file-input-wrapper">
                  <input
                    id="audioFile"
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioFileChange}
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => document.getElementById('audioFile').click()}
                  >
                    {selectedAudioFile ? selectedAudioFile.name : "Choose Audio File"}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleAudioUpload}
                  disabled={!selectedAudioFile || uploadingAudio}
                  className="btn-upload"
                >
                  {uploadingAudio ? "Uploading..." : "Upload"}
                </button>
              </div>
            ) : (
              <input
                name="audioUrl"
                type="url"
                placeholder="https://example.com/audio.mp3"
                value={formData.audioUrl}
                onChange={handleChange}
              />
            )}

            {formData.audioUrl && (
              <div className="media-preview" style={{ padding: '10px', width: '100%' }}>
                <audio controls style={{ width: '100%' }}>
                  <source src={formData.audioUrl} />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Saving..." : editing ? "Update Sermon" : "Add Sermon"}
            </button>
            {editing && (
              <button type="button" className="btn-secondary" onClick={cancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Sermons List */}
      <div className="sermons-section">
        <div className="section-header">
          <h2>All Sermons ({sermons.length})</h2>
          <button onClick={refreshSermons} className="btn-refresh">
            Refresh List
          </button>
        </div>

        {sermons.length === 0 ? (
          <div className="empty-state" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            <div className="empty-icon"><Music size={48} /></div>
            <h3>No sermons yet</h3>
            <p>Add your first sermon using the form above.</p>
          </div>
        ) : (
          <div className="sermons-grid">
            {sermons.map((sermon) => (
              <div key={sermon._id} className="sermon-card">
                <div className="sermon-image">
                  <img
                    src={sermon.imageUrl || "/placeholder.svg?height=200&width=300"}
                    alt={sermon.title}
                    onError={(e) => { e.target.src = "https://placehold.co/600x400?text=No+Image" }}
                  />
                </div>
                <div className="sermon-content">
                  <h3 className="sermon-title">{sermon.title}</h3>
                  <div className="sermon-meta">
                    <span className="meta-item"><User size={14} /> {sermon.preacher}</span>
                    <span className="meta-item"><Calendar size={14} /> {new Date(sermon.date).toLocaleDateString()}</span>
                  </div>
                  <p className="sermon-description">{sermon.description}</p>

                  <div className="sermon-actions">
                    <button className="card-btn btn-view" onClick={() => showSermonDetails(sermon)}>
                      <Eye size={16} /> View
                    </button>
                    <button className="card-btn btn-edit" onClick={() => handleEdit(sermon)}>
                      <Edit2 size={16} /> Edit
                    </button>
                    <button className="card-btn btn-delete" onClick={() => sermon._id && handleDelete(sermon._id)}>
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SermonCMS
