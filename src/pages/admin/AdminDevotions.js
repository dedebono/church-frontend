"use client"

import { useState, useEffect, useMemo } from "react"
import Calendar from "react-calendar"
import "react-calendar/dist/Calendar.css"
import "./DevotionCalendar.css"
import api from "../admin/api/API"
import Swal from "sweetalert2"
import {
  BookOpen,
  Calendar as CalendarIcon,
  Clock,
  Zap,
  CheckCircle2,
  RotateCw,
  Search,
  Trash2,
  X,
  Eye,
  Plus,
  ChevronLeft,
  ChevronRight,
  Filter,
  FileText,
  Quote,
  AlertCircle
} from "lucide-react"

function DevotionCalendar() {
  const [selectedDate, setSelectedDate] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ title: "", content: "", sendMode: "now", sendTime: "" })
  const [sending, setSending] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState("")

  // Devotions log (view & delete)
  const [devotions, setDevotions] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const [search, setSearch] = useState("")
  const [modeFilter, setModeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [detailDevotion, setDetailDevotion] = useState(null)

  const devotionTemplates = [
    { value: "", label: "Select predefined template" },
    { value: "morning", label: "Morning Prayer Template" },
    { value: "evening", label: "Evening Reflection Template" },
    { value: "scripture", label: "Scripture Study Template" },
    { value: "gratitude", label: "Gratitude & Thanksgiving Template" },
  ]

  useEffect(() => { fetchDevotions() }, [])

  async function fetchDevotions() {
    try {
      setLoading(true)
      const { data } = await api.get("/api/devotions")
      setDevotions(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Failed to fetch devotions:", error)
      Swal.fire("Error", "Failed to fetch devotions", "error")
    } finally {
      setLoading(false)
    }
  }

  // ---- Calendar helpers
  function getDevotionsForDate(date) {
    return devotions.filter((d) => {
      const when = new Date(d.sendDate || d.createdAt)
      return when.toDateString() === date.toDateString()
    })
  }

  function getTileContent({ date, view }) {
    if (view !== "month") return null
    const dayDevotions = getDevotionsForDate(date)
    if (!dayDevotions.length) return null
    return (
      <div className="devotion-indicators">
        {dayDevotions.slice(0, 2).map((devotion, i) => (
          <div
            key={i}
            className={`devotion-dot ${devotion.sendMode === "now" ? "immediate" : "scheduled"}`}
            title={devotion.title}
          />
        ))}
        {dayDevotions.length > 2 && <div className="devotion-count">+{dayDevotions.length - 2}</div>}
      </div>
    )
  }

  function handleDateChange(date) {
    setSelectedDate(date)
    setShowModal(true)
  }

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  function handleTemplateChange(e) {
    setSelectedTemplate(e.target.value)
  }

  // ---- Build a safe local ISO from calendar date + HH:mm (no state mutation)
  function buildLocalISO(date, timeStr) {
    const [hStr = "0", mStr = "0"] = (timeStr || "").split(":")
    const h = Number(hStr)
    const m = Number(mStr)
    if (Number.isNaN(h) || Number.isNaN(m)) return null
    const dt = new Date(date.getFullYear(), date.getMonth(), date.getDate(), h, m, 0, 0)
    return dt.toISOString()
  }

  // ---- Create/save devotion (client expects fast server response)
  async function handleSubmit() {
    if (!formData.title || !formData.content || !formData.sendMode) {
      return Swal.fire("Error", "All fields are required", "error")
    }

    let payload = {
      title: formData.title,
      content: formData.content,
      sendMode: formData.sendMode,
      sendDate: null,
    }

    if (formData.sendMode === "later") {
      if (!selectedDate) {
        return Swal.fire("Error", "Please pick a date on the calendar.", "error")
      }
      if (!formData.sendTime) {
        return Swal.fire("Error", "Please choose a time for the scheduled devotion.", "error")
      }
      const iso = buildLocalISO(selectedDate, formData.sendTime)
      if (!iso) return Swal.fire("Error", "Invalid time format.", "error")
      payload.sendDate = iso
    }

    setSending(true)
    let resp
    try {
      // server should return immediately and push in background when sendMode === 'now'
      resp = await api.post("/api/devotions", payload)
    } catch (error) {
      console.error("Save error:", error)
      const msg = error?.response?.data?.message || error.message || "Failed to save devotion"
      Swal.fire("Error", msg, "error")
      setSending(false)
      return
    }

    // Success UX + reset (message may be 'Queued for immediate send' or 'Devotion scheduled')
    const serverMsg = resp?.data?.message || "Devotion saved"
    Swal.fire({
      title: "Berhasil",
      text: serverMsg,
      icon: "success",
      background: "#131318",
      color: "#f8fafc",
      confirmButtonColor: "#d4a24e",
    })
    setFormData({ title: "", content: "", sendMode: "now", sendTime: "" })
    setSelectedTemplate("")
    setShowModal(false)
    setSending(false)

    // Refresh list; if this fails, do not override the success toast
    try {
      await fetchDevotions()
    } catch {}
  }

  // ---- Open create modal helper
  function handleOpenCreateModal() {
    if (!selectedDate) {
      setSelectedDate(new Date())
    }
    setShowModal(true)
  }

  // ---- Delete devotion
  async function handleDelete(id) {
    const confirm = await Swal.fire({
      title: "Hapus Renungan Ini?",
      text: "Renungan ini akan dihapus secara permanen dari sistem.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#262632",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      background: "#131318",
      color: "#f8fafc",
    })
    if (!confirm.isConfirmed) return

    setDeletingId(id)
    try {
      await api.delete(`/api/devotions/${id}`)
      setDevotions((prev) => prev.filter((d) => d._id !== id))
      if (detailDevotion?._id === id) {
        setDetailDevotion(null)
      }
      Swal.fire({
        title: "Berhasil",
        text: "Konten renungan telah dihapus.",
        icon: "success",
        background: "#131318",
        color: "#f8fafc",
        confirmButtonColor: "#d4a24e",
      })
    } catch (err) {
      console.error(err)
      const msg = err?.response?.data?.message || err.message || "Gagal menghapus renungan"
      Swal.fire({
        title: "Error",
        text: msg,
        icon: "error",
        background: "#131318",
        color: "#f8fafc",
        confirmButtonColor: "#d4a24e",
      })
    } finally {
      setDeletingId(null)
    }
  }

  // ---- Table filtering & pagination
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return devotions.filter((d) => {
      // Search matching
      if (q) {
        const match = [d.title, d.content, d.sendMode, d._id]
          .filter(Boolean)
          .some((x) => String(x).toLowerCase().includes(q))
        if (!match) return false
      }

      // Mode filter
      if (modeFilter !== "all" && d.sendMode !== modeFilter) {
        return false
      }

      // Status filter
      let statusLabel = "Pending"
      if (d.sendMode === "now") statusLabel = d.isSent ? "Sent" : "Queued"
      else statusLabel = d.isSent ? "Sent" : "Pending"

      if (statusFilter !== "all" && statusLabel !== statusFilter) {
        return false
      }

      return true
    })
  }, [devotions, search, modeFilter, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page, pageSize])

  useEffect(() => {
    setPage((p) => (p > totalPages ? totalPages : p))
  }, [totalPages])

  return (
    <div className="devotion-calendar-container">
      <h2 className="h2">Renungan</h2>

      {/* Calendar */}
      <Calendar onClickDay={handleDateChange} tileContent={getTileContent} className="modern-calendar" />

      {/* Legend */}
      <div className="calendar-legend">
        <div className="legend-item"><div className="legend-dot immediate"></div><span>Immediate Devotions</span></div>
        <div className="legend-item"><div className="legend-dot scheduled"></div><span>Scheduled Devotions</span></div>
        <div className="legend-item"><div className="legend-dot today"></div><span>Today</span></div>
        <div className="legend-item"><div className="legend-dot selected"></div><span>Selected</span></div>
      </div>

      {/* Devotions Log Section */}
      <div className="devotions-log-section">
        {/* Header Toolbar */}
        <div className="devotions-header-card">
          <div className="devotions-header-info">
            <div className="devotions-header-icon">
              <BookOpen size={22} />
            </div>
            <div className="devotions-header-text">
              <h3>Konten Renungan</h3>
              <p>Kelola jadwal publikasi, pencarian, dan arsip renungan harian</p>
            </div>
          </div>

          <div className="devotions-header-actions">
            <div className="devotions-count-badge">
              <FileText size={14} />
              <span>{loading ? "Memuat..." : `${filtered.length} Renungan`}</span>
            </div>
            <button
              onClick={fetchDevotions}
              className="btn-devotions-refresh"
              disabled={loading}
              title="Refresh data renungan"
            >
              <RotateCw size={14} className={loading ? "animate-spin" : ""} />
              <span>{loading ? "Memuat..." : "Refresh"}</span>
            </button>
            <button
              onClick={handleOpenCreateModal}
              className="btn-devotions-create"
              title="Buat Renungan Baru"
            >
              <Plus size={15} />
              <span>Buat Renungan</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="devotions-filter-bar">
          <div className="devotions-search-box">
            <Search size={15} className="devotions-search-icon" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Cari judul, konten, atau ID renungan..."
              className="devotions-search-input"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="devotions-search-clear"
                title="Hapus pencarian"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="devotions-filter-options">
            <select
              value={modeFilter}
              onChange={(e) => {
                setModeFilter(e.target.value)
                setPage(1)
              }}
              className="devotions-filter-select"
              title="Filter Mode Pengiriman"
            >
              <option value="all">Semua Mode</option>
              <option value="now">Immediate (Kirim Sekarang)</option>
              <option value="later">Scheduled (Terjadwal)</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              className="devotions-filter-select"
              title="Filter Status"
            >
              <option value="all">Semua Status</option>
              <option value="Sent">Sent (Terkirim)</option>
              <option value="Queued">Queued (Antrean)</option>
              <option value="Pending">Pending (Menunggu)</option>
            </select>

            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value))
                setPage(1)
              }}
              className="devotions-filter-select"
              title="Baris per halaman"
            >
              <option value={5}>5 baris</option>
              <option value={10}>10 baris</option>
              <option value={20}>20 baris</option>
              <option value={50}>50 baris</option>
            </select>

            {(search || modeFilter !== "all" || statusFilter !== "all") && (
              <button
                onClick={() => {
                  setSearch("")
                  setModeFilter("all")
                  setStatusFilter("all")
                  setPage(1)
                }}
                className="btn-filter-clear"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>

        {/* Table Card */}
        <div className="devotions-table-card">
          {!loading && filtered.length === 0 ? (
            <div className="devotions-empty-card">
              <div className="devotions-empty-icon">
                <BookOpen size={26} />
              </div>
              <h4 className="devotions-empty-title">Tidak Ada Renungan Ditemukan</h4>
              <p className="devotions-empty-subtitle">
                {search || modeFilter !== "all" || statusFilter !== "all"
                  ? "Tidak ada data renungan yang sesuai dengan kriteria filter saat ini."
                  : "Belum ada renungan yang tersimpan. Klik tombol \"Buat Renungan\" di atas untuk mulai membuat."}
              </p>
              {(search || modeFilter !== "all" || statusFilter !== "all") && (
                <button
                  onClick={() => {
                    setSearch("")
                    setModeFilter("all")
                    setStatusFilter("all")
                    setPage(1)
                  }}
                  className="btn-devotions-refresh mt-2"
                >
                  Bersihkan Filter
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="devotions-table">
                <thead>
                  <tr>
                    <th style={{ width: "42%" }}>Judul & Ringkasan</th>
                    <th style={{ width: "16%" }}>Mode</th>
                    <th style={{ width: "20%" }}>Waktu Kirim / Dibuat</th>
                    <th style={{ width: "12%" }}>Status</th>
                    <th style={{ width: "10%", textAlign: "right" }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((d) => {
                    const when = d.sendMode === "later" ? d.sendDate : d.createdAt
                    let statusLabel = "Pending"
                    if (d.sendMode === "now") statusLabel = d.isSent ? "Sent" : "Queued"
                    else statusLabel = d.isSent ? "Sent" : "Pending"

                    return (
                      <tr key={d._id}>
                        <td>
                          <div className="devotion-title-wrap">
                            <span className="devotion-title-text">{d.title || "Tanpa Judul"}</span>
                            <div className="devotion-meta-row">
                              <span className="devotion-id-badge">ID: {d._id}</span>
                            </div>
                            {d.content && (
                              <p className="devotion-snippet-text">
                                {d.content.slice(0, 110)}
                                {d.content.length > 110 ? "..." : ""}
                              </p>
                            )}
                          </div>
                        </td>
                        <td>
                          {d.sendMode === "now" ? (
                            <span className="badge-mode-immediate">
                              <Zap size={12} />
                              Immediate
                            </span>
                          ) : (
                            <span className="badge-mode-scheduled">
                              <Clock size={12} />
                              Scheduled
                            </span>
                          )}
                        </td>
                        <td>
                          <div className="devotion-date-cell">
                            <span className="devotion-date-primary">
                              <CalendarIcon size={12} className="text-slate-400" />
                              {formatDate(when)}
                            </span>
                            <span className="devotion-date-label">
                              {d.sendMode === "later" ? "Jadwal Kirim" : "Dibuat / Terkirim"}
                            </span>
                          </div>
                        </td>
                        <td>
                          {statusLabel === "Sent" ? (
                            <span className="badge-status-sent">
                              <CheckCircle2 size={12} />
                              Sent
                            </span>
                          ) : statusLabel === "Queued" ? (
                            <span className="badge-status-queued">
                              <Clock size={12} />
                              Queued
                            </span>
                          ) : (
                            <span className="badge-status-pending">
                              <Clock size={12} />
                              Pending
                            </span>
                          )}
                        </td>
                        <td>
                          <div className="devotion-actions-group">
                            <button
                              onClick={() => setDetailDevotion(d)}
                              className="btn-devotion-view"
                              title="Lihat isi lengkap renungan"
                            >
                              <Eye size={13} />
                              <span>Lihat</span>
                            </button>
                            <button
                              onClick={() => handleDelete(d._id)}
                              className="btn-devotion-delete"
                              disabled={deletingId === d._id}
                              title="Hapus renungan"
                            >
                              <Trash2 size={13} />
                              <span>{deletingId === d._id ? "..." : "Hapus"}</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          {filtered.length > 0 && (
            <div className="devotions-pagination-bar">
              <div className="devotions-pagination-info">
                Menampilkan {Math.min((page - 1) * pageSize + 1, filtered.length)} -{" "}
                {Math.min(page * pageSize, filtered.length)} dari {filtered.length} renungan
              </div>
              <div className="devotions-pagination-controls">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-page-step"
                >
                  <ChevronLeft size={14} />
                  Prev
                </button>
                <span className="devotions-page-counter">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="btn-page-step"
                >
                  Next
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Create Devotion</h3>
              <button className="modal-close" onClick={() => setShowModal(false)} aria-label="Close modal">×</button>
            </div>

            <div className="modal-body">
              {/* Template */}
              <div className="form-section">
                <label className="section-label">Devotion template</label>
                <div className="template-selector">
                  <div className="template-icon">📋</div>
                  <select value={selectedTemplate} onChange={handleTemplateChange} className="template-dropdown">
                    {devotionTemplates.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  <div className="dropdown-arrow">▼</div>
                </div>
              </div>

              {/* Details */}
              <div className="form-section">
                <div className="section-row">
                  <div className="form-group">
                    <label className="section-label">Devotion details</label>
                    <div className="input-group">
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Enter devotion title"
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="section-label">Schedule delivery</label>
                    <div className="schedule-group">
                      <select name="sendMode" value={formData.sendMode} onChange={handleChange} className="form-select">
                        <option value="now">Send Now</option>
                        <option value="later">Send Later</option>
                      </select>

                      {formData.sendMode === "later" && (
                        <input
                          type="time"
                          name="sendTime"
                          value={formData.sendTime}
                          onChange={handleChange}
                          className="time-input"
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="tags-container">
                  <span className="tag">📅 {selectedDate?.toDateString() || "Pick a date"}</span>
                  <span className="tag">✉️ {formData.sendMode === "now" ? "Immediate" : "Scheduled"}</span>
                  {selectedTemplate && <span className="tag">📋 Template</span>}
                </div>
              </div>

              {/* Content */}
              <div className="form-section">
                <label className="section-label">Devotion content</label>

                <div className="editor-toolbar">
                  <div className="toolbar-group">
                    <button type="button" className="toolbar-btn" title="Bold"><strong>B</strong></button>
                    <button type="button" className="toolbar-btn" title="Italic"><em>I</em></button>
                    <button type="button" className="toolbar-btn" title="Underline"><u>U</u></button>
                  </div>
                  <div className="toolbar-separator"></div>
                  <div className="toolbar-group">
                    <button type="button" className="toolbar-btn" title="Align Left">≡</button>
                    <button type="button" className="toolbar-btn" title="Align Center">≣</button>
                    <button type="button" className="toolbar-btn" title="Bullet List">•</button>
                    <button type="button" className="toolbar-btn" title="Numbered List">1.</button>
                  </div>
                  <div className="toolbar-separator"></div>
                  <div className="toolbar-group">
                    <button type="button" className="toolbar-btn" title="Link">🔗</button>
                    <button type="button" className="toolbar-btn" title="Image">🖼️</button>
                  </div>
                </div>

                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="Enter your devotion content here. Share inspiration, scripture, prayers, or reflections..."
                  className="content-editor"
                  rows="8"
                />
              </div>

              {/* Export (display-only) */}
              <div className="form-section">
                <div className="export-options">
                  <div className="export-icon">📄</div>
                  <span className="export-text">Save devotion for delivery as</span>
                  <select className="export-format">
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                    <option value="push">Push Notification</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleSubmit} disabled={sending} className="btn-primary">
                {sending ? "Saving..." : "Save Devotion"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Devotion Detail Modal */}
      {detailDevotion && (
        <div className="modal-overlay" onClick={() => setDetailDevotion(null)}>
          <div className="modal-content modal-detail-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex items-center gap-2">
                <BookOpen size={20} className="text-amber-400" />
                <h3>Pratinjau Renungan</h3>
              </div>
              <button
                className="modal-close"
                onClick={() => setDetailDevotion(null)}
                aria-label="Tutup modal"
              >
                ×
              </button>
            </div>

            <div className="modal-body space-y-4">
              <div>
                <h2 className="text-xl font-bold text-slate-100 mb-2">{detailDevotion.title || "Tanpa Judul"}</h2>
                <div className="devotion-detail-badge-row">
                  <span className="devotion-id-badge">ID: {detailDevotion._id}</span>
                  {detailDevotion.sendMode === "now" ? (
                    <span className="badge-mode-immediate">
                      <Zap size={12} /> Immediate
                    </span>
                  ) : (
                    <span className="badge-mode-scheduled">
                      <Clock size={12} /> Scheduled ({formatDate(detailDevotion.sendDate)})
                    </span>
                  )}
                  <span className="devotion-date-primary text-xs">
                    <CalendarIcon size={12} className="text-slate-400 inline mr-1" />
                    Dibuat: {formatDate(detailDevotion.createdAt)}
                  </span>
                </div>
              </div>

              <div>
                <label className="section-label mb-2 block font-semibold text-slate-300">Isi Lengkap Renungan</label>
                <div className="devotion-detail-content-box">
                  {detailDevotion.content || "Tidak ada isi konten."}
                </div>
              </div>
            </div>

            <div className="modal-actions flex justify-between items-center">
              <button
                onClick={() => handleDelete(detailDevotion._id)}
                className="btn-devotion-delete px-3 py-2"
                disabled={deletingId === detailDevotion._id}
              >
                <Trash2 size={14} />
                <span>Hapus Renungan Ini</span>
              </button>
              <button onClick={() => setDetailDevotion(null)} className="btn-secondary">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DevotionCalendar

// helpers
function formatDate(d) {
  try {
    const date = new Date(d)
    if (Number.isNaN(date.getTime())) return "—"
    return date.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return "—"
  }
}

