"use client"

import { useState, useEffect } from "react"
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

  // Add these new state variables after the existing useState declarations
  const [devotions, setDevotions] = useState([])
  const [loading, setLoading] = useState(true)

  const devotionTemplates = [
    { value: "", label: "Select predefined template" },
    { value: "morning", label: "Morning Prayer Template" },
    { value: "evening", label: "Evening Reflection Template" },
    { value: "scripture", label: "Scripture Study Template" },
    { value: "gratitude", label: "Gratitude & Thanksgiving Template" },
  ]

  // Add this useEffect to fetch existing devotions
  useEffect(() => {
    fetchDevotions()
  }, [])

  const fetchDevotions = async () => {
    try {
      setLoading(true)
      const response = await api.get("/api/devotions")
      setDevotions(response.data || [])
    } catch (error) {
      console.error("Failed to fetch devotions:", error)
    } finally {
      setLoading(false)
    }
  }

  // Add function to check if a date has devotions
  const getDevotionsForDate = (date) => {
    return devotions.filter((devotion) => {
      const devotionDate = new Date(devotion.sendDate || devotion.createdAt)
      return devotionDate.toDateString() === date.toDateString()
    })
  }

  // Add function to get tile content for calendar days
  const getTileContent = ({ date, view }) => {
    if (view === "month") {
      const dayDevotions = getDevotionsForDate(date)
      if (dayDevotions.length > 0) {
        return (
          <div className="devotion-indicators">
            {dayDevotions.slice(0, 2).map((devotion, index) => (
              <div
                key={index}
                className={`devotion-dot ${devotion.sendMode === "now" ? "immediate" : "scheduled"}`}
                title={devotion.title}
              />
            ))}
            {dayDevotions.length > 2 && <div className="devotion-count">+{dayDevotions.length - 2}</div>}
          </div>
        )
      }
    }
    return null
  }

  const handleDateChange = (date) => {
    setSelectedDate(date)
    setShowModal(true)
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleTemplateChange = (e) => {
    setSelectedTemplate(e.target.value)
    // You can add template content loading logic here
  }

  // Update the handleSubmit function to refresh devotions after saving
  const handleSubmit = async () => {
    if (!formData.title || !formData.content || !formData.sendMode) {
      return Swal.fire("Error", "All fields are required", "error")
    }

    const payload = {
      title: formData.title,
      content: formData.content,
      sendMode: formData.sendMode,
      sendDate:
        formData.sendMode === "later"
          ? new Date(selectedDate.setHours(...formData.sendTime.split(":"))).toISOString()
          : null,
    }

    try {
      setSending(true)
      await api.post("/api/devotions", payload)
      Swal.fire("Success", "Devotion saved successfully", "success")
      setFormData({ title: "", content: "", sendMode: "now", sendTime: "" })
      setSelectedTemplate("")
      setShowModal(false)
      // Refresh devotions to update calendar indicators
      await fetchDevotions()
    } catch (error) {
      console.error("Failed to save devotion:", error)
      Swal.fire("Error", "Failed to save devotion", "error")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="devotion-calendar-container">
      <h2
      className="h2">
        Renungan</h2>
      {/* Update the Calendar component props */}
      <Calendar onClickDay={handleDateChange} tileContent={getTileContent} className="modern-calendar" />

      {/* Add this after the Calendar component and before the modal */}
      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-dot immediate"></div>
          <span>Immediate Devotions</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot scheduled"></div>
          <span>Scheduled Devotions</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot today"></div>
          <span>Today</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot selected"></div>
          <span>Selected</span>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Create Devotion</h3>
              <button className="modal-close" onClick={() => setShowModal(false)} aria-label="Close modal">
                ×
              </button>
            </div>

            <div className="modal-body">
              {/* Template Selection Section */}
              <div className="form-section">
                <label className="section-label">Devotion template</label>
                <div className="template-selector">
                  <div className="template-icon">📋</div>
                  <select value={selectedTemplate} onChange={handleTemplateChange} className="template-dropdown">
                    {devotionTemplates.map((template) => (
                      <option key={template.value} value={template.value}>
                        {template.label}
                      </option>
                    ))}
                  </select>
                  <div className="dropdown-arrow">▼</div>
                </div>
              </div>

              {/* Devotion Details Section */}
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

                {/* Tags/Categories */}
                <div className="tags-container">
                  <span className="tag">📅 {selectedDate?.toDateString()}</span>
                  <span className="tag">✉️ {formData.sendMode === "now" ? "Immediate" : "Scheduled"}</span>
                  {selectedTemplate && <span className="tag">📋 Template</span>}
                </div>
              </div>

              {/* Content Section */}
              <div className="form-section">
                <label className="section-label">Devotion content</label>

                {/* Toolbar */}
                <div className="editor-toolbar">
                  <div className="toolbar-group">
                    <button type="button" className="toolbar-btn" title="Bold">
                      <strong>B</strong>
                    </button>
                    <button type="button" className="toolbar-btn" title="Italic">
                      <em>I</em>
                    </button>
                    <button type="button" className="toolbar-btn" title="Underline">
                      <u>U</u>
                    </button>
                  </div>

                  <div className="toolbar-separator"></div>

                  <div className="toolbar-group">
                    <button type="button" className="toolbar-btn" title="Align Left">
                      ≡
                    </button>
                    <button type="button" className="toolbar-btn" title="Align Center">
                      ≣
                    </button>
                    <button type="button" className="toolbar-btn" title="Bullet List">
                      •
                    </button>
                    <button type="button" className="toolbar-btn" title="Numbered List">
                      1.
                    </button>
                  </div>

                  <div className="toolbar-separator"></div>

                  <div className="toolbar-group">
                    <button type="button" className="toolbar-btn" title="Link">
                      🔗
                    </button>
                    <button type="button" className="toolbar-btn" title="Image">
                      🖼️
                    </button>
                  </div>
                </div>

                {/* Content Textarea */}
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="Enter your devotion content here. Share inspiration, scripture, prayers, or reflections..."
                  className="content-editor"
                  rows="8"
                />
              </div>

              {/* Export Options */}
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

            {/* Modal Actions */}
            <div className="modal-actions">
              <button onClick={() => setShowModal(false)} className="btn-secondary">
                Cancel
              </button>
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
