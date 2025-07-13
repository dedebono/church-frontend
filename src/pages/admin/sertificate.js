"use client"

import React, { useState, useEffect } from "react"
import api from "./api/API"
import Swal from "sweetalert2"
import "./sertificate.css"


function BaptismSertificate() {
  const [services, setServices] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [formData, setFormData] = useState({
    member: "",
    date: "",
    certificateNumber: "",
    phoneNumber: "",
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => { 
    setLoading(true)
    try {
      const res = await api.get("/api/baptism-services")
      setServices(res.data)
    } catch (error) {
      console.error("Fetch error:", error)
      Swal.fire("Gagal", "Gagal mengambil data sertifikat.", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    try {
      const res = await api.get(`/api/members/search/${searchQuery}`)
      setSearchResults(res.data)
    } catch (err) {
      console.error(err)
      Swal.fire("Gagal", "Pencarian jemaat gagal.", "error")
    }
  }

  const handleSelectMember = (memberId) => {
    setFormData((prev) => ({ ...prev, member: memberId }))
    setSearchResults([]) // hide results
    setSearchQuery("")   // clear search bar
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.member) {
      return Swal.fire("Pilih Jemaat", "Silakan pilih jemaat terlebih dahulu.", "warning")
    }

    setLoading(true)
    try {
      await api.post("/api/baptism-services", formData)
      Swal.fire("Berhasil", "Sertifikat berhasil dibuat.", "success")
      setFormData({ member: "", date: "", certificateNumber: "", phoneNumber: "" })
      fetchServices()
    } catch (err) {
      console.error(err)
      Swal.fire("Gagal", "Gagal membuat sertifikat.", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Yakin hapus sertifikat ini?",
      text: "Tindakan ini tidak bisa dibatalkan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
    })
    if (!result.isConfirmed) return

    try {
      await api.delete(`/api/baptism-services/${id}`)
      Swal.fire("Terhapus", "Data sertifikat berhasil dihapus.", "success")
      fetchServices()
    } catch (err) {
      Swal.fire("Gagal", "Gagal menghapus data.", "error")
    }
  }

  const handlePrint = (svc) => {
    const memberName = svc.member?.name || svc.member?.fullName || "N/A"
    const date = new Date(svc.date).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    const content = `
      <html><head><title>Sertifikat Baptisan</title></head><body style="font-family: sans-serif; text-align: center;">
        <h1>Sertifikat Baptisan</h1>
        <p>Menyatakan bahwa:</p>
        <h2>${memberName}</h2>
        <p>Telah dibaptis pada tanggal</p>
        <h3>${date}</h3>
        <p>No. Sertifikat: <strong>${svc.certificateNumber}</strong></p>
        <p>No. HP: ${svc.phoneNumber || "-"}</p>
        <p style="margin-top: 40px;">"Pergilah, jadikanlah semua bangsa murid-Ku dan baptislah mereka..."</p>
        <p><em>- Matius 28:19</em></p>
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() { window.close(); }
          }
        </script>
      </body></html>
    `
    const printWindow = window.open("", "_blank")
    printWindow.document.write(content)
    printWindow.document.close()
  }

  return (
    <div className="event-cms-container">
      <div className="cms-header">
        <h1>🕊️ Manajemen Sertifikat Baptis</h1>
        <p>Isi form untuk membuat sertifikat baru</p>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit} className="event-form">
          {/* Jemaat Search */}
          <div className="form-row">
            <div className="form-group" style={{ width: "100%" }}>
              <label>Cari Jemaat</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Ketik nama jemaat lalu tekan Enter"
              />
              {searchResults.length > 0 && (
                <ul className="search-results">
                  {searchResults.map((member) => (
                    <li
                      key={member._id}
                      className="search-item"
                      onClick={() => handleSelectMember(member._id)}
                    >
                      {member.fullName || member.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Hidden member ID */}
          {formData.member && (
            <p style={{ fontSize: "0.9rem", color: "#4b5563", marginTop: "-10px" }}>
              ✅ Jemaat terpilih: <code>{formData.member}</code>
            </p>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>No. Sertifikat</label>
              <input
                type="text"
                name="certificateNumber"
                value={formData.certificateNumber}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Tanggal Baptis</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>No. HP</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Menyimpan..." : "Buat Sertifikat"}
            </button>
          </div>
        </form>
      </div>

      <div className="event-section">
        <div className="section-header">
          <h2>📜 Daftar Sertifikat</h2>
        </div>
        {services.length === 0 ? (
          <p>Tidak ada data sertifikat.</p>
        ) : (
          <div className="events-grid">
            {services.map((svc) => (
              <div key={svc._id} className="event-card">
                <div className="event-content">
                  <h3 className="event-title">{svc.member?.name || svc.member?.fullName || "Jemaat"}</h3>
                  <div className="event-meta">
                    <p><strong>Tanggal:</strong> {new Date(svc.date).toLocaleDateString("id-ID")}</p>
                    <p><strong>No. Sertifikat:</strong> {svc.certificateNumber}</p>
                    <p><strong>No. HP:</strong> {svc.phoneNumber || "-"}</p>
                  </div>
                  <div className="event-actions">
                    <button className="btn-view" onClick={() => handlePrint(svc)}>🖨️ Cetak</button>
                    <button className="btn-delete" onClick={() => handleDelete(svc._id)}>🗑️ Hapus</button>
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

export default BaptismSertificate
