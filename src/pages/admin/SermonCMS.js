"use client"

import React, { useState, useEffect, useMemo } from "react"
import "./SermonCMS.css"
import { getSermons, createSermon, updateSermon, deleteSermon, healthCheck } from "../admin/api/API"
import Swal from "sweetalert2"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { storage } from "../admin/firebase"
import {
  Mic2,
  Plus,
  Calendar,
  User,
  Image as ImageIcon,
  Music,
  Upload,
  Link as LinkIcon,
  Eye,
  Trash2,
  Edit2,
  Search,
  X,
  RotateCw,
  Activity,
  CheckCircle2,
  Clock,
  Headphones
} from "lucide-react"

const SermonCMS = () => {
  const [sermons, setSermons] = useState([])
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)

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
  const [activeTab, setActiveTab] = useState({ image: "file", audio: "file" })

  // Reset form data when editing changes
  useEffect(() => {
    if (editing) {
      setFormData(editing)
      setImagePreview(editing.imageUrl)
      setActiveTab({
        image: editing.imageUrl ? "url" : "file",
        audio: editing.audioUrl ? "url" : "file",
      })
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
      setActiveTab({ image: "file", audio: "file" })
    }
    setSelectedImageFile(null)
    setSelectedAudioFile(null)
  }, [editing])

  const fetchSermons = async () => {
    setIsRefreshing(true)
    try {
      const data = await getSermons()
      const sermonsArray = Array.isArray(data) ? data : []
      setSermons(sermonsArray)
      setError(null)
    } catch (err) {
      console.error("Fetch error:", err)
      const errorMessage = err.response?.data?.message || err.message || "Gagal memuat daftar khotbah"
      setError(errorMessage)

      if (sermons.length === 0) {
        Swal.fire({
          icon: "error",
          title: "Gangguan Koneksi",
          text: errorMessage,
          background: "#131318",
          color: "#f8fafc",
          confirmButtonColor: "#d4a24e"
        })
      }
    } finally {
      setIsRefreshing(false)
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
        text: "File gambar maksimal 2MB.",
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

  // Handle audio file selection
  const handleAudioFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith("audio/")) {
      Swal.fire({
        icon: "error",
        title: "Tipe File Tidak Valid",
        text: "Hanya file audio yang diizinkan (MP3, WAV, dll).",
        background: "#131318",
        color: "#f8fafc",
        confirmButtonColor: "#d4a24e"
      })
      e.target.value = ""
      return
    }

    if (file.size > 50 * 1024 * 1024) {
      Swal.fire({
        icon: "error",
        title: "Ukuran Terlalu Besar",
        text: "File audio maksimal 50MB.",
        background: "#131318",
        color: "#f8fafc",
        confirmButtonColor: "#d4a24e"
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
        title: "Pilih File",
        text: "Pilih file gambar terlebih dahulu.",
        background: "#131318",
        color: "#f8fafc",
        confirmButtonColor: "#d4a24e"
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
        text: "Terjadi masalah saat mengunggah gambar.",
        background: "#131318",
        color: "#f8fafc",
        confirmButtonColor: "#d4a24e"
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
        title: "Pilih File Audio",
        text: "Silakan pilih file audio terlebih dahulu.",
        background: "#131318",
        color: "#f8fafc",
        confirmButtonColor: "#d4a24e"
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

      setFormData((prev) => ({ ...prev, audioUrl: downloadURL }))

      Swal.fire({
        icon: "success",
        title: "Audio Berhasil Diunggah",
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
        background: "#131318",
        color: "#f8fafc"
      })

      setSelectedAudioFile(null)
      const fileInput = document.getElementById("audioFile")
      if (fileInput) fileInput.value = ""
    } catch (error) {
      console.error("Audio upload error:", error)
      Swal.fire({
        icon: "error",
        title: "Gagal Mengunggah Audio",
        text: "Terjadi masalah saat mengunggah berkas audio.",
        background: "#131318",
        color: "#f8fafc",
        confirmButtonColor: "#d4a24e"
      })
    } finally {
      setUploadingAudio(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editing) {
        await updateSermon(editing._id, formData)
      } else {
        await createSermon(formData)
      }

      setEditing(null)
      setError(null)
      await fetchSermons()

      Swal.fire({
        icon: "success",
        title: editing ? "Khotbah Diperbarui" : "Khotbah Ditambahkan",
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
      const errorMessage = err.response?.data?.message || err.message || "Gagal menyimpan khotbah"
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

  const handleEdit = (sermon) => {
    setEditing(sermon)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleDelete = async (id) => {
    const sermon = sermons.find((s) => s._id === id)

    const result = await Swal.fire({
      title: "Hapus Khotbah?",
      html: `<span style="color: #cbd5e1;">Anda akan menghapus rekaman khotbah <strong>"${sermon?.title}"</strong>.<br>Tindakan ini tidak dapat dibatalkan.</span>`,
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
      await deleteSermon(id)
      await fetchSermons()
      setError(null)

      Swal.fire({
        icon: "success",
        title: "Terhapus",
        text: `"${sermon?.title}" berhasil dihapus.`,
        timer: 2500,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
        background: "#131318",
        color: "#f8fafc"
      })
    } catch (err) {
      console.error("Delete error:", err)
      const errorMessage = err.response?.data?.message || err.message || "Gagal menghapus khotbah"
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

  const showSermonDetails = (sermon) => {
    const formattedDate = sermon.date
      ? new Date(sermon.date).toLocaleDateString("id-ID", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "-"

    Swal.fire({
      title: `
        <div style="display: flex; align-items: center; gap: 8px; font-size: 1.2rem; font-weight: 700; color: #f8fafc; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 12px; text-align: left;">
          <span>${sermon.title}</span>
        </div>
      `,
      html: `
        <div style="text-align: left; font-size: 0.9rem; color: #cbd5e1; margin-top: 14px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: #1c1c24; padding: 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.06); margin-bottom: 14px;">
            <div>
              <span style="display: block; font-size: 0.72rem; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Pembicara / Pengkhotbah</span>
              <span style="font-weight: 600; color: #f8fafc;">${sermon.preacher || "-"}</span>
            </div>
            <div>
              <span style="display: block; font-size: 0.72rem; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Waktu Khotbah</span>
              <span style="font-weight: 600; color: #d4a24e;">${sermon.time || "-"} WIB</span>
            </div>
            <div style="grid-column: span 2;">
              <span style="display: block; font-size: 0.72rem; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Hari & Tanggal</span>
              <span style="color: #f8fafc;">${formattedDate}</span>
            </div>
          </div>
          
          <div style="margin-bottom: 14px;">
            <span style="display: block; font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-bottom: 4px;">Ringkasan / Ayat Firman:</span>
            <p style="margin: 0; line-height: 1.6; color: #e2e8f0; white-space: pre-wrap;">${sermon.description || "Tidak ada keterangan."}</p>
          </div>

          ${
            sermon.audioUrl
              ? `<div style="background: #1c1c24; padding: 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08); margin-bottom: 14px;">
                  <span style="display: block; font-size: 0.72rem; font-weight: 700; color: #d4a24e; text-transform: uppercase; margin-bottom: 8px;">Audio Rekaman Khotbah:</span>
                  <audio controls style="width: 100%; border-radius: 8px;">
                    <source src="${sermon.audioUrl}" />
                    Browser Anda tidak mendukung audio player.
                  </audio>
                </div>`
              : ""
          }

          ${
            sermon.imageUrl
              ? `<div style="text-align: center; margin-top: 10px;">
                  <img src="${sermon.imageUrl}" alt="${sermon.title}" style="width: 100%; max-height: 260px; object-fit: cover; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1);" />
                </div>`
              : ""
          }
        </div>
      `,
      width: "580px",
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

  const filteredSermons = useMemo(() => {
    if (!searchTerm.trim()) return sermons
    const term = searchTerm.toLowerCase().trim()
    return sermons.filter(
      (s) =>
        (s.title && s.title.toLowerCase().includes(term)) ||
        (s.preacher && s.preacher.toLowerCase().includes(term)) ||
        (s.description && s.description.toLowerCase().includes(term)) ||
        (s.date && s.date.toLowerCase().includes(term))
    )
  }, [sermons, searchTerm])

  return (
    <div className="sermon-cms-container">
      {/* Modern Minimalist Header */}
      <div className="sermon-header-card">
        <div className="sermon-header-title-group">
          <div className="sermon-header-icon-badge">
            <Mic2 size={22} />
          </div>
          <div className="sermon-header-text">
            <h1>Sermon Management</h1>
            <p>Arsip firman, publikasi rekaman audio, dan manajemen khotbah gereja</p>
          </div>
        </div>

        <div className="sermon-header-actions">
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
            onClick={fetchSermons}
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
        <div className="sermon-error-alert">
          <span>{error}</span>
          <button onClick={fetchSermons} className="btn-retry-alert">
            Coba Lagi
          </button>
        </div>
      )}

      {/* Minimalist Form Card */}
      <div className="sermon-form-card">
        <div className="sermon-form-card-header">
          <div className="flex items-center gap-2">
            {editing ? <Edit2 size={18} className="text-amber-400" /> : <Plus size={18} className="text-amber-400" />}
            <h2>{editing ? "Perbarui Informasi Khotbah" : "Tambahkan Khotbah Baru"}</h2>
          </div>
          <span className="text-xs text-slate-400">
            {editing ? "Ubah detail rekaman dan naskah di bawah" : "Isi rincian khotbah dengan lengkap"}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="sermon-form-body">
          {/* Row 1: Title & Preacher */}
          <div className="sermon-form-grid-2">
            <div className="sermon-form-group">
              <label htmlFor="title">Judul Khotbah</label>
              <input
                id="title"
                name="title"
                type="text"
                placeholder="cth: Kuasa Dalam Pengharapan"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
            <div className="sermon-form-group">
              <label htmlFor="preacher">Pengkhotbah</label>
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
          <div className="sermon-form-grid-2">
            <div className="sermon-form-group">
              <label htmlFor="date">Tanggal</label>
              <input id="date" name="date" type="date" value={formData.date} onChange={handleChange} required />
            </div>

            <div className="sermon-form-group">
              <label htmlFor="time">Waktu / Jam</label>
              <input id="time" name="time" type="time" value={formData.time} onChange={handleChange} required />
            </div>
          </div>

          {/* Row 3: Description */}
          <div className="sermon-form-group">
            <label htmlFor="description">Ringkasan & Ayat Firman</label>
            <textarea
              id="description"
              name="description"
              placeholder="Tuliskan nats ayat, poin-poin khotbah, atau pesan firman..."
              value={formData.description}
              onChange={handleChange}
              rows={3}
              required
            />
          </div>

          {/* Row 4: Image & Audio Upload Sections */}
          <div className="sermon-media-grid">
            {/* Image Section */}
            <div className="sermon-media-box">
              <div className="sermon-media-box-header">
                <label className="text-xs font-bold text-slate-300 uppercase">Poster Khotbah</label>
                <div className="sermon-tab-pills">
                  <button
                    type="button"
                    className={`sermon-tab-pill ${activeTab.image === "file" ? "active" : ""}`}
                    onClick={() => setActiveTab((p) => ({ ...p, image: "file" }))}
                  >
                    <Upload size={12} />
                    <span>File</span>
                  </button>
                  <button
                    type="button"
                    className={`sermon-tab-pill ${activeTab.image === "url" ? "active" : ""}`}
                    onClick={() => setActiveTab((p) => ({ ...p, image: "url" }))}
                  >
                    <LinkIcon size={12} />
                    <span>URL</span>
                  </button>
                </div>
              </div>

              {activeTab.image === "file" ? (
                <div className="sermon-file-upload-row">
                  <input
                    id="imageFile"
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="sermon-file-input"
                  />
                  <button
                    type="button"
                    onClick={handleImageUpload}
                    disabled={!selectedImageFile || uploadingImage}
                    className="btn-media-upload"
                  >
                    {uploadingImage ? "Mengunggah..." : "Unggah"}
                  </button>
                </div>
              ) : (
                <input
                  name="imageUrl"
                  type="url"
                  placeholder="https://... URL gambar"
                  value={formData.imageUrl}
                  onChange={(e) => {
                    handleChange(e)
                    setImagePreview(e.target.value)
                  }}
                  className="sermon-input"
                />
              )}

              {imagePreview && (
                <div className="sermon-preview-badge">
                  <img src={imagePreview} alt="Pratinjau" className="sermon-preview-thumb" />
                  <span className="text-xs text-slate-300 truncate">Poster aktif</span>
                  <button
                    type="button"
                    className="ml-auto text-red-400 hover:text-red-300"
                    onClick={() => {
                      setImagePreview(null)
                      setFormData((p) => ({ ...p, imageUrl: "" }))
                      setSelectedImageFile(null)
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Audio Section */}
            <div className="sermon-media-box">
              <div className="sermon-media-box-header">
                <label className="text-xs font-bold text-slate-300 uppercase">Rekaman Audio</label>
                <div className="sermon-tab-pills">
                  <button
                    type="button"
                    className={`sermon-tab-pill ${activeTab.audio === "file" ? "active" : ""}`}
                    onClick={() => setActiveTab((p) => ({ ...p, audio: "file" }))}
                  >
                    <Upload size={12} />
                    <span>File</span>
                  </button>
                  <button
                    type="button"
                    className={`sermon-tab-pill ${activeTab.audio === "url" ? "active" : ""}`}
                    onClick={() => setActiveTab((p) => ({ ...p, audio: "url" }))}
                  >
                    <LinkIcon size={12} />
                    <span>URL</span>
                  </button>
                </div>
              </div>

              {activeTab.audio === "file" ? (
                <div className="sermon-file-upload-row">
                  <input
                    id="audioFile"
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioFileChange}
                    className="sermon-file-input"
                  />
                  <button
                    type="button"
                    onClick={handleAudioUpload}
                    disabled={!selectedAudioFile || uploadingAudio}
                    className="btn-media-upload"
                  >
                    {uploadingAudio ? "Mengunggah..." : "Unggah"}
                  </button>
                </div>
              ) : (
                <input
                  name="audioUrl"
                  type="url"
                  placeholder="https://... URL audio .mp3"
                  value={formData.audioUrl}
                  onChange={handleChange}
                  className="sermon-input"
                />
              )}

              {formData.audioUrl && (
                <div className="sermon-audio-player-box">
                  <audio controls className="w-full h-8">
                    <source src={formData.audioUrl} />
                  </audio>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="sermon-form-actions">
            <button type="submit" disabled={loading} className="btn-sermon-submit">
              {loading ? (
                <span>Menyimpan...</span>
              ) : editing ? (
                <>
                  <CheckCircle2 size={16} />
                  <span>Perbarui Khotbah</span>
                </>
              ) : (
                <>
                  <Plus size={16} />
                  <span>Tambah Khotbah</span>
                </>
              )}
            </button>
            {editing && (
              <button type="button" className="btn-sermon-cancel" onClick={cancelEdit}>
                Batal
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Sermons List Section */}
      <div className="sermon-list-section">
        <div className="sermon-list-header">
          <div className="sermon-list-title-group">
            <h2>Daftar Khotbah</h2>
            <span className="sermon-badge-count">{filteredSermons.length} Khotbah</span>
          </div>

          {/* Quick Search */}
          <div className="sermon-search-wrapper">
            <Search size={15} className="sermon-search-icon" />
            <input
              type="text"
              placeholder="Cari judul, pengkhotbah, tema..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="sermon-search-input"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="sermon-search-clear">
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {filteredSermons.length === 0 ? (
          <div className="sermon-empty-state">
            <div className="sermon-empty-icon">
              <Mic2 size={28} />
            </div>
            <h3>{searchTerm ? "Tidak ada khotbah yang cocok" : "Belum ada arsip khotbah"}</h3>
            <p>
              {searchTerm
                ? "Silakan coba kata kunci pencarian yang lain."
                : "Mulai dengan menambahkan arsip khotbah pertama menggunakan formulir di atas."}
            </p>
          </div>
        ) : (
          <div className="sermons-cards-grid">
            {filteredSermons.map((sermon) => {
              const formattedDate = sermon.date
                ? new Date(sermon.date).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "-"

              return (
                <div key={sermon._id} className="sermon-card-modern">
                  <div className="sermon-card-media">
                    <img
                      src={sermon.imageUrl || "https://images.unsplash.com/photo-1519491050282-cf00c82424b4?auto=format&fit=crop&w=600&q=80"}
                      alt={sermon.title}
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1519491050282-cf00c82424b4?auto=format&fit=crop&w=600&q=80"
                      }}
                    />
                    <div className="sermon-card-badges">
                      {sermon.audioUrl && (
                        <span className="sermon-audio-pill" title="Tersedia rekaman audio">
                          <Headphones size={12} />
                          <span>Audio</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="sermon-card-body">
                    <div className="sermon-card-meta-top">
                      <span className="sermon-date-text">
                        <Calendar size={13} />
                        <span>{formattedDate}</span>
                      </span>
                      <span className="sermon-preacher-text">
                        <User size={13} />
                        <span>{sermon.preacher || "Pengkhotbah"}</span>
                      </span>
                    </div>

                    <h3 className="sermon-card-title">{sermon.title}</h3>
                    <p className="sermon-card-desc">{sermon.description}</p>

                    <div className="sermon-card-actions">
                      <button
                        type="button"
                        className="btn-card-action btn-card-view"
                        onClick={() => showSermonDetails(sermon)}
                        title="Lihat Rincian & Audio"
                      >
                        <Eye size={14} />
                        <span>Detail</span>
                      </button>
                      <button
                        type="button"
                        className="btn-card-action btn-card-edit"
                        onClick={() => handleEdit(sermon)}
                        title="Edit Khotbah"
                      >
                        <Edit2 size={14} />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        className="btn-card-action btn-card-delete"
                        onClick={() => sermon._id && handleDelete(sermon._id)}
                        title="Hapus Khotbah"
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

export default SermonCMS
