"use client"

import { useState, useEffect, useMemo } from "react"
import Calendar from "react-calendar"
import "react-calendar/dist/Calendar.css"
import "./DevotionCalendar.css"
import api from "../admin/api/API"
import Swal from "sweetalert2"

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
  const [page, setPage] = useState(1)
  const pageSize = 10

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
    Swal.fire("Success", serverMsg, "success")
    setFormData({ title: "", content: "", sendMode: "now", sendTime: "" })
    setSelectedTemplate("")
    setShowModal(false)
    setSending(false)

    // Refresh list; if this fails, do not override the success toast
    try {
      await fetchDevotions()
    } catch {}
  }

  // ---- Delete devotion
  async function handleDelete(id) {
    const confirm = await Swal.fire({
      title: "Delete this devotion?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Delete",
    })
    if (!confirm.isConfirmed) return

    setDeletingId(id)
    try {
      await api.delete(`/api/devotions/${id}`)
      setDevotions((prev) => prev.filter((d) => d._id !== id))
      Swal.fire("Deleted", "Devotion removed successfully", "success")
    } catch (err) {
      console.error(err)
      const msg = err?.response?.data?.message || err.message || "Failed to delete devotion"
      Swal.fire("Error", msg, "error")
    } finally {
      setDeletingId(null)
    }
  }

  // ---- Table filtering & pagination
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return devotions
    return devotions.filter((d) =>
      [d.title, d.content, d.sendMode, d._id]
        .filter(Boolean)
        .some((x) => String(x).toLowerCase().includes(q)),
    )
  }, [devotions, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page])

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

      {/* Devotions Log */}
      <div className="devotions-log mt-8">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-gray-600">{loading ? "Loading…" : `${filtered.length} devotion(s)`}</div>
          <div className="flex gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, content, or ID…"
              className="w-64 px-3 py-2 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={fetchDevotions}
              className="px-3 py-2 rounded-xl border text-sm hover:bg-gray-50"
              disabled={loading}
              title="Refresh"
            >
              {loading ? "Refreshing…" : "↻ Refresh"}
            </button>
          </div>
        </div>

        {!loading && filtered.length === 0 ? (
          <div className="border rounded-2xl p-8 text-center text-gray-500">
            <div className="text-4xl mb-2">📝</div>
            <div className="font-medium">No devotions found</div>
            <div className="text-sm">Try refreshing or clearing your search.</div>
          </div>
        ) : null}

        {filtered.length > 0 && (
          <div className="overflow-x-auto border rounded-2xl">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3">Title</th>
                  <th className="text-left px-4 py-3">Mode</th>
                  <th className="text-left px-4 py-3">Send / Created</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((d) => {
                  const when = d.sendMode === "later" ? d.sendDate : d.createdAt
                  // Status: handle async push semantics gracefully
                  let statusLabel = "Pending"
                  if (d.sendMode === "now") statusLabel = d.isSent ? "Sent" : "Queued"
                  else statusLabel = d.isSent ? "Sent" : "Pending"

                  return (
                    <tr key={d._id} className="border-t">
                      <td className="px-4 py-3 align-top">
                        <div className="font-medium leading-5 break-words">{d.title}</div>
                        <div className="text-xs text-gray-500 mt-1">ID: {d._id}</div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <span
                          className={`inline-flex px-2 py-1 rounded-lg text-xs ${
                            d.sendMode === "now"
                              ? "bg-green-50 text-green-700 border border-green-100"
                              : "bg-amber-50 text-amber-700 border border-amber-100"
                          }`}
                        >
                          {d.sendMode === "now" ? "Immediate" : "Scheduled"}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-top whitespace-nowrap">{formatDate(when)}</td>
                      <td className="px-4 py-3 align-top">
                        <span
                          className={`inline-flex px-2 py-1 rounded-lg text-xs ${
                            statusLabel === "Sent"
                              ? "bg-blue-50 text-blue-700 border border-blue-100"
                              : statusLabel === "Queued"
                              ? "bg-purple-50 text-purple-700 border border-purple-100"
                              : "bg-gray-100 text-gray-700 border border-gray-200"
                          }`}
                        >
                          {statusLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-top text-right">
                        <button
                          onClick={() => handleDelete(d._id)}
                          className="px-3 py-1.5 rounded-xl border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50"
                          disabled={deletingId === d._id}
                        >
                          {deletingId === d._id ? "Deleting…" : "Delete"}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {filtered.length > pageSize && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-500">Page {page} of {totalPages}</div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-2 rounded-xl border text-sm disabled:opacity-50"
              >
                Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-2 rounded-xl border text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
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
    </div>
  )
}

export default DevotionCalendar

// helpers
function formatDate(d) {
  try {
    const date = new Date(d)
    if (Number.isNaN(date.getTime())) return "—"
    return date.toLocaleString()
  } catch {
    return "—"
  }
}
