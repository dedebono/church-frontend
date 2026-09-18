"use client"

import React, { useState, useEffect, useMemo } from "react"
import "./EventsAdmin.css"
import { getEvents, createEvent, updateEvent, deleteEvent, healthCheck } from "../admin/api/API"
import Swal from "sweetalert2"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { storage } from "../admin/firebase"
import {
  Calendar,
  Clock,
  User,
  Plus,
  Edit3,
  Trash2,
  Eye,
  RotateCw,
  UploadCloud,
  Link as LinkIcon,
  Search,
  X,
  Radio,
  FileText,
  Activity,
  CheckCircle2
} from "lucide-react"

const EventCMS = () => {
  const [events, setEvents] = useState([])
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [uploadTab, setUploadTab] = useState("file") // 'file' or 'url'
  const [isRefreshing, setIsRefreshing] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    preacher: "",
    date: "",
    time: "",
    description: "",
    imageUrl: "",
  })

  // File upload states
  const [selectedImageFile, setSelectedImageFile] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)

  // Reset form data when editing changes
  useEffect(() => {
    if (editing) {
      setFormData(editing)
      setImagePreview(editing.imageUrl)
      if (editing.imageUrl) {
        setUploadTab("url")
      }
    } else {
      setFormData({
        title: "",
        preacher: "",
        date: "",
        time: "",
        description: "",
        imageUrl: "",
      })
      setImagePreview(null)
      setUploadTab("file")
    }
    setSelectedImageFile(null)
  }, [editing])

  const fetchEvent = async () => {
    setIsRefreshing(true)
    try {
      const data = await getEvents()
      const eventsArray = Array.isArray(data) ? data : []
      setEvents(eventsArray)
      setError(null)
    } catch (err) {
      console.error("Fetch error:", err)
      const errorMessage = err.response?.data?.message || err.message || "Gagal mengambil data event"
      setError(errorMessage)

      if (events.length === 0) {
        Swal.fire({
          icon: "error",
          title: "Gangguan Koneksi",
          html: `
            <div style="text-align: left; color: #cbd5e1;">
              <p><strong>Error:</strong> ${errorMessage}</p>
              <p style="margin-top: 8px;">Periksa kembali koneksi jaringan atau hubungi administrator.</p>
            </div>
          `,
          background: "#131318",
          color: "#f8fafc",
          confirmButtonColor: "#d4a24e",
        })
      }
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchEvent()
  }, [])

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  // Handle image file selection
  const handleImageFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      Swal.fire({
        icon: "error",
        title: "Tipe File Tidak Valid",
        text: "Hanya file gambar yang diizinkan.",
        background: "#131318",
        color: "#f8fafc",
        confirmButtonColor: "#d4a24e"
      })
      e.target.value = ""
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      Swal.fire({
        icon: "error",
        title: "Ukuran Terlalu Besar",
        text: "Ukuran file gambar maksimal 2MB.",
        background: "#131318",
        color: "#f8fafc",
        confirmButtonColor: "#d4a24e"
      })
      e.target.value = ""
      return
    }

    setSelectedImageFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setImagePreview(e.target.result)
    reader.readAsDataURL(file)
  }

  // Upload image to Firebase
  const handleImageUpload = async () => {
    if (!selectedImageFile) {
      Swal.fire({
        icon: "warning",
        title: "Pilih File",
        text: "Silakan pilih file gambar terlebih dahulu.",
        background: "#131318",
        color: "#f8fafc",
        confirmButtonColor: "#d4a24e"
      })
      return
    }

    try {
      setUploadingImage(true)
      const timestamp = Date.now()
      const fileName = `event_images/${timestamp}_${selectedImageFile.name}`
      const fileRef = ref(storage, fileName)

      await uploadBytes(fileRef, selectedImageFile)
      const downloadURL = await getDownloadURL(fileRef)

      setFormData((prev) => ({ ...prev, imageUrl: downloadURL }))
      setImagePreview(downloadURL)

      Swal.fire({
        icon: "success",
        title: "Gambar Berhasil Diunggah",
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
        background: "#131318",
        color: "#f8fafc"
      })

      setSelectedImageFile(null)
      const fileInput = document.getElementById("imageFile")
      if (fileInput) fileInput.value = ""
    } catch (error) {
      console.error("Image upload error:", error)
      Swal.fire({
        icon: "error",
        title: "Gagal Mengunggah",
        text: "Terjadi kesalahan saat mengunggah gambar.",
        background: "#131318",
        color: "#f8fafc",
        confirmButtonColor: "#d4a24e"
      })
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editing) {
        await updateEvent(editing._id, formData)
      } else {
        await createEvent(formData)
      }

      setEditing(null)
      setError(null)
      await fetchEvent()

      Swal.fire({
        icon: "success",
        title: editing ? "Ibadah Diperbarui" : "Ibadah Ditambahkan",
        text: `${formData.title} berhasil disimpan.`,
        timer: 2500,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
        background: "#131318",
        color: "#f8fafc"
      })
    } catch (err) {
      console.error("Save error:", err)
      const errorMessage = err.response?.data?.message || err.message || "Gagal menyimpan jadwal ibadah"
      setError(errorMessage)

      Swal.fire({
        icon: "error",
        title: "Gagal Menyimpan",
        text: errorMessage,
        background: "#131318",
        color: "#f8fafc",
        confirmButtonColor: "#d4a24e"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (event) => {
    setEditing(event)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleDelete = async (id) => {
    const event = events.find((s) => s._id === id)

    const result = await Swal.fire({
      title: "Hapus Jadwal Ibadah?",
      html: `<span style="color: #cbd5e1;">Anda akan menghapus ibadah <strong>"${event?.title}"</strong>.<br>Tindakan ini tidak dapat dibatalkan.</span>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#262632",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      background: "#131318",
      color: "#f8fafc",
      reverseButtons: true,
    })

    if (!result.isConfirmed) return

    try {
      await deleteEvent(id)
      await fetchEvent()
      setError(null)

      Swal.fire({
        icon: "success",
        title: "Terhapus",
        text: `"${event?.title}" berhasil dihapus.`,
        timer: 2500,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
        background: "#131318",
        color: "#f8fafc"
      })
    } catch (err) {
      console.error("Delete error:", err)
      const errorMessage = err.response?.data?.message || err.message || "Gagal menghapus ibadah"
      setError(errorMessage)

      Swal.fire({
        icon: "error",
        title: "Gagal Menghapus",
        text: errorMessage,
        background: "#131318",
        color: "#f8fafc",
        confirmButtonColor: "#d4a24e"
      })
    }
  }

  const cancelEdit = () => {
    setEditing(null)
  }

  const showEventDetails = (event) => {
    const formattedDate = event.date
      ? new Date(event.date).toLocaleDateString("id-ID", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "-"

    Swal.fire({
      title: `
        <div style="display: flex; align-items: center; gap: 8px; font-size: 1.2rem; font-weight: 700; color: #f8fafc; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 12px; text-align: left;">
          <span>${event.title}</span>
        </div>
      `,
      html: `
        <div style="text-align: left; font-size: 0.9rem; color: #cbd5e1; margin-top: 14px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: #1c1c24; padding: 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.06); margin-bottom: 14px;">
            <div>
              <span style="display: block; font-size: 0.72rem; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Pelayan Firman</span>
              <span style="font-weight: 600; color: #f8fafc;">${event.preacher || "-"}</span>
            </div>
            <div>
              <span style="display: block; font-size: 0.72rem; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Waktu / Jam</span>
              <span style="font-weight: 600; color: #d4a24e;">${event.time || "-"} WIB</span>
            </div>
            <div style="grid-column: span 2;">
              <span style="display: block; font-size: 0.72rem; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Hari & Tanggal</span>
              <span style="color: #f8fafc;">${formattedDate}</span>
            </div>
          </div>
          
          <div style="margin-bottom: 14px;">
            <span style="display: block; font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-bottom: 4px;">Deskripsi:</span>
            <p style="margin: 0; line-height: 1.6; color: #e2e8f0; white-space: pre-wrap;">${event.description || "Tidak ada deskripsi."}</p>
          </div>

          ${
            event.imageUrl
              ? `<div style="text-align: center; margin-top: 12px;">
                  <img src="${event.imageUrl}" alt="${event.title}" style="width: 100%; max-height: 280px; object-fit: cover; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1);" />
                </div>`
              : ""
          }
        </div>
      `,
      width: "560px",
      background: "#131318",
      color: "#f8fafc",
      showCloseButton: true,
      showConfirmButton: false,
    })
  }

  const testApiConnection = async () => {
    try {
      const health = await healthCheck()
      Swal.fire({
        icon: health.ok ? "success" : "error",
        title: "Uji Koneksi API",
        html: `
          <div style="text-align: left; font-family: monospace; font-size: 0.85rem; background: #1c1c24; padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08); color: #cbd5e1;">
            <p><strong>Status:</strong> ${health.status}</p>
            <p><strong>Koneksi OK:</strong> ${health.ok ? "Ya" : "Tidak"}</p>
            <p><strong>Backend:</strong> ${health.backend || "Default"}</p>
          </div>
        `,
        background: "#131318",
        color: "#f8fafc",
        confirmButtonColor: "#d4a24e"
      })
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Uji Koneksi Gagal",
        text: error.message,
        background: "#131318",
        color: "#f8fafc",
        confirmButtonColor: "#d4a24e"
      })
    }
  }

  // Filter events by search term
  const filteredEvents = useMemo(() => {
    if (!searchTerm.trim()) return events
    const term = searchTerm.toLowerCase().trim()
    return events.filter(
      (ev) =>
        (ev.title && ev.title.toLowerCase().includes(term)) ||
        (ev.preacher && ev.preacher.toLowerCase().includes(term)) ||
        (ev.description && ev.description.toLowerCase().includes(term)) ||
        (ev.date && ev.date.toLowerCase().includes(term))
    )
  }, [events, searchTerm])

  return (
    <div className="event-cms-container">
      {/* Modern Minimalist Header */}
      <div className="event-header-card">
        <div className="event-header-title-group">
          <div className="event-header-icon-badge">
            <Radio size={22} />
          </div>
          <div className="event-header-text">
            <h1>Event Management System</h1>
            <p>Kelola jadwal ibadah raya, pelayan firman, dan agenda gereja</p>
          </div>
        </div>

        <div className="event-header-actions">
          <button
            type="button"
            onClick={testApiConnection}
            className="btn-header-secondary"
            title="Uji status endpoint backend"
          >
            <Activity size={14} />
            <span>Tes API</span>
          </button>
          <button
            type="button"
            onClick={fetchEvent}
            disabled={isRefreshing}
            className="btn-header-secondary"
            title="Muat ulang data"
          >
            <RotateCw size={14} className={isRefreshing ? "animate-spin" : ""} />
            <span>{isRefreshing ? "Memuat..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="event-error-alert">
          <span>{error}</span>
          <button onClick={fetchEvent} className="btn-retry-alert">
            Coba Lagi
          </button>
        </div>
      )}

      {/* Minimalist Form Card */}
      <div className="event-form-card">
        <div className="event-form-card-header">
          <div className="flex items-center gap-2">
            {editing ? <Edit3 size={18} className="text-amber-400" /> : <Plus size={18} className="text-amber-400" />}
            <h2>{editing ? "Perbarui Jadwal Ibadah" : "Tambahkan Jadwal Ibadah Baru"}</h2>
          </div>
          <span className="text-xs text-slate-400">
            {editing ? "Ubah detail informasi ibadah di bawah" : "Isi rincian ibadah dengan lengkap"}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="event-form-body">
          {/* Row 1: Title & Preacher */}
          <div className="event-form-grid-2">
            <div className="event-form-group">
              <label htmlFor="title">Nama Ibadah</label>
              <input
                id="title"
                name="title"
                type="text"
                placeholder="cth: Ibadah Raya Minggu Pagi"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
            <div className="event-form-group">
              <label htmlFor="preacher">Pelayan Firman</label>
              <input
                id="preacher"
                name="preacher"
                type="text"
                placeholder="cth: Pdt. Dr. John Doe"
                value={formData.preacher}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Row 2: Date & Time */}
          <div className="event-form-grid-2">
            <div className="event-form-group">
              <label htmlFor="date">Tanggal</label>
              <input id="date" name="date" type="date" value={formData.date} onChange={handleChange} required />
            </div>

            <div className="event-form-group">
              <label htmlFor="time">Waktu / Jam</label>
              <input id="time" name="time" type="time" value={formData.time} onChange={handleChange} required />
            </div>
          </div>

          {/* Row 3: Description */}
          <div className="event-form-group">
            <label htmlFor="description">Deskripsi / Tema Firman</label>
            <textarea
              id="description"
              name="description"
              placeholder="Tuliskan ringkasan tema, ayat pokok, atau keterangan ibadah..."
              value={formData.description}
              onChange={handleChange}
              rows={3}
              required
            />
          </div>

          {/* Row 4: Image Upload Section with Minimalist Tabs */}
          <div className="event-media-section">
            <div className="event-media-tabs-header">
              <label className="text-sm font-semibold text-slate-200">Poster / Banner Ibadah</label>
              <div className="event-upload-tabs">
                <button
                  type="button"
                  className={`event-upload-tab ${uploadTab === "file" ? "active" : ""}`}
                  onClick={() => setUploadTab("file")}
                >
                  <UploadCloud size={14} />
                  <span>Unggah File</span>
                </button>
                <button
                  type="button"
                  className={`event-upload-tab ${uploadTab === "url" ? "active" : ""}`}
                  onClick={() => setUploadTab("url")}
                >
                  <LinkIcon size={14} />
                  <span>Tautan URL</span>
                </button>
              </div>
            </div>

            <div className="event-upload-body">
              {uploadTab === "file" ? (
                <div className="event-dropzone-row">
                  <input
                    id="imageFile"
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="event-file-input"
                  />
                  <button
                    type="button"
                    onClick={handleImageUpload}
                    disabled={!selectedImageFile || uploadingImage}
                    className="btn-upload-action"
                  >
                    <UploadCloud size={15} />
                    <span>{uploadingImage ? "Mengunggah..." : "Unggah Gambar"}</span>
                  </button>
                </div>
              ) : (
                <div className="event-url-row">
                  <input
                    name="imageUrl"
                    type="url"
                    placeholder="https://images.unsplash.com/... atau URL gambar langsung"
                    value={formData.imageUrl}
                    onChange={(e) => {
                      handleChange(e)
                      setImagePreview(e.target.value)
                    }}
                    className="event-input"
                  />
                </div>
              )}

              {/* Image Preview */}
              {imagePreview && (
                <div className="event-preview-container">
                  <img src={imagePreview} alt="Pratinjau poster" className="event-preview-img" />
                  <button
                    type="button"
                    className="btn-remove-preview"
                    onClick={() => {
                      setImagePreview(null)
                      setFormData((p) => ({ ...p, imageUrl: "" }))
                      setSelectedImageFile(null)
                    }}
                    title="Hapus gambar"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="event-form-actions">
            <button type="submit" disabled={loading} className="btn-event-submit">
              {loading ? (
                <span>Menyimpan...</span>
              ) : editing ? (
                <>
                  <CheckCircle2 size={16} />
                  <span>Perbarui Ibadah</span>
                </>
              ) : (
                <>
                  <Plus size={16} />
                  <span>Tambah Ibadah</span>
                </>
              )}
            </button>
            {editing && (
              <button type="button" className="btn-event-cancel" onClick={cancelEdit}>
                Batal
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Events List Section */}
      <div className="event-list-section">
        <div className="event-list-header">
          <div className="event-list-title-group">
            <h2>Daftar Jadwal Ibadah</h2>
            <span className="event-badge-count">{filteredEvents.length} Event</span>
          </div>

          {/* Quick Search */}
          <div className="event-search-wrapper">
            <Search size={15} className="event-search-icon" />
            <input
              type="text"
              placeholder="Cari judul, pelayan, tanggal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="event-search-input"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="event-search-clear">
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="event-empty-state">
            <div className="event-empty-icon">
              <Calendar size={28} />
            </div>
            <h3>{searchTerm ? "Tidak ada jadwal yang cocok" : "Belum ada jadwal ibadah"}</h3>
            <p>
              {searchTerm
                ? "Silakan coba kata kunci pencarian yang lain."
                : "Mulai dengan menambahkan agenda ibadah baru menggunakan formulir di atas."}
            </p>
          </div>
        ) : (
          <div className="events-cards-grid">
            {filteredEvents.map((event) => {
              const formattedDate = event.date
                ? new Date(event.date).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "-"

              return (
                <div key={event._id} className="event-card-modern">
                  <div className="event-card-media">
                    <img
                      src={event.imageUrl || "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=600&q=80"}
                      alt={event.title}
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=600&q=80"
                      }}
                    />
                    <div className="event-card-badges">
                      <span className="event-time-pill">
                        <Clock size={12} />
                        <span>{event.time || "-"}</span>
                      </span>
                    </div>
                  </div>

                  <div className="event-card-body">
                    <div className="event-card-meta-top">
                      <span className="event-date-text">
                        <Calendar size={13} />
                        <span>{formattedDate}</span>
                      </span>
                      <span className="event-preacher-text">
                        <User size={13} />
                        <span>{event.preacher || "Pembicara"}</span>
                      </span>
                    </div>

                    <h3 className="event-card-title">{event.title}</h3>
                    <p className="event-card-desc">{event.description}</p>

                    <div className="event-card-actions">
                      <button
                        type="button"
                        className="btn-card-action btn-card-view"
                        onClick={() => showEventDetails(event)}
                        title="Lihat Rincian"
                      >
                        <Eye size={14} />
                        <span>Detail</span>
                      </button>
                      <button
                        type="button"
                        className="btn-card-action btn-card-edit"
                        onClick={() => handleEdit(event)}
                        title="Edit Ibadah"
                      >
                        <Edit3 size={14} />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        className="btn-card-action btn-card-delete"
                        onClick={() => event._id && handleDelete(event._id)}
                        title="Hapus Ibadah"
                      >
                        <Trash2 size={14} />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default EventCMS
