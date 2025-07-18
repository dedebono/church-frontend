"use client"

import React, { useState, useEffect } from "react"
import api from "./api/API"
import Swal from "sweetalert2"
import "./sertificate.css"


function BaptismSertificate() {
  const [services, setServices] = useState([])
  // For main member search (baptism recipient)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  // For father and mother autocomplete results
  const [resultsDad, setResultsDad] = useState([])
  const [resultsMom, setResultsMom] = useState([])

  const [formData, setFormData] = useState({
    member: "", // Stores the ID of the selected baptism member
    date: "",
    certificateNumber: "",
    phoneNumber: "",
    gender:"",
    placeofbirth:"",
    dateofbirth:"",
    dadName:"", // Now functions as autocomplete input
    momName:"", // Now functions as autocomplete input
    placeofbaptism:"",
    pastorname:""
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

  // Generalized search function for members
  const searchMember = async (query, setResult) => {
    if (!query.trim()) {
      setResult([]) // Clear results if query is empty
      return
    }
    try {
      const res = await api.get(`/api/members/search/${query}`)
      setResult(res.data)
    } catch (err) {
      console.error(err)
      Swal.fire("Gagal", "Pencarian jemaat gagal.", "error")
    }
  }

  // Generalized handler for selecting a member (baptism recipient, father, or mother)
  const handleSelectMember = async (memberId, role = "baptismMember") => {
    try {
      const res = await api.get(`/api/members/${memberId}`)
      const member = res.data

      if (role === "baptismMember") {
        setFormData((prev) => ({
          ...prev,
          member: memberId,
          gender: member.gender || "",
          dateofbirth: member.dateOfBirth || "",
          placeofbirth: member.placeOfBirth || "",
          phoneNumber: member.phoneNumber || "",
        }))
        setSearchResults([]) // Clear search results for main member
        setSearchQuery("") // Clear the search input for main member
      } else if (role === "father") {
        setFormData((prev) => ({
          ...prev,
          dadName: member.fullName || member.name || "", // Update dadName with selected member's full name
        }))
        setResultsDad([]) // Clear search results for father
      } else if (role === "mother") {
        setFormData((prev) => ({
          ...prev,
          momName: member.fullName || member.name || "", // Update momName with selected member's full name
        }))
        setResultsMom([]) // Clear search results for mother
      }
    } catch (err) {
      console.error("Failed to fetch member details", err)
      Swal.fire("Gagal", "Gagal mengambil detail jemaat.", "error")
    }
  }

  // Handles changes for regular form inputs (non-autocomplete)
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handles input and search for the Father's Name field
  const handleDadNameChange = (e) => {
    const value = e.target.value
    setFormData((prev) => ({ ...prev, dadName: value })) // Update formData for dad's name
    searchMember(value, setResultsDad) // Trigger search for father
  }

  // Handles input and search for the Mother's Name field
  const handleMomNameChange = (e) => {
    const value = e.target.value
    setFormData((prev) => ({ ...prev, momName: value })) // Update formData for mom's name
    searchMember(value, setResultsMom) // Trigger search for mother
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
      // Reset form and all search-related states after successful submission
      setFormData({
        member: "",
        date: "",
        certificateNumber: "",
        phoneNumber: "",
        gender:"",
        placeofbirth:"",
        dateofbirth:"",
        dadName:"",
        momName:"",
        placeofbaptism:"",
        pastorname:""
      })
      setSearchQuery("")
      setSearchResults([])
      setResultsDad([])
      setResultsMom([])

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
      <html>
      <head>
        <title>Sertifikat Baptisan</title>
        <style>
        body {
        display:flex;
        flex-direction:column;
        align-items:center;
        }

        .nosertificate {
        font-weight:700;
        margin-top:345px
        }

        .membername {
        margin-top:113px;
        color:blue;
        }

        p{
        margin:0;
        }

        </style>
      </head>
      <body>
        <p class="nosertificate">${svc.certificateNumber}</p>
        <p class="membername">${memberName}</p>
        <p>${date}</p>
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
          {/* Jemaat Search (remains separate search input for ID selection) */}
          <div className="form-row">
            <div className="form-group" style={{ width: "100%" }}>
              <label>Cari Jemaat (Penerima Baptis)</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchMember(searchQuery, setSearchResults)}
                placeholder="Ketik nama jemaat lalu tekan Enter"
              />
              {searchResults.length > 0 && (
                <ul className="search-results">
                  {searchResults.map((member) => (
                    <li
                      key={member._id}
                      className="search-item"
                      onClick={() => handleSelectMember(member._id, "baptismMember")} // Pass role
                    >
                      {member.fullName || member.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Display selected member ID */}
          {formData.member && (
            <p style={{ fontSize: "0.9rem", color: "#4b5563", marginTop: "-10px" }}>
              ✅ ID Jemaat terpilih: <code>{formData.member}</code>
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
              <label>Jenis Kelamin</label>
              <input
                type="text"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              />
            </div>
            {/* Combined Search/Input for Father's Name */}
            <div className="form-group">
              <label>Nama Ayah</label>
              <input
                type="text"
                name="dadName"
                value={formData.dadName}
                onChange={handleDadNameChange} // Use new handler
                placeholder="Ketik nama atau cari di database"
              />
              {resultsDad.length > 0 && (
                <ul className="search-results">
                  {resultsDad.map((member) => (
                    <li key={member._id} className="search-item" onClick={() => handleSelectMember(member._id, "father")}>
                      {member.fullName || member.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* Combined Search/Input for Mother's Name */}
            <div className="form-group">
              <label>Nama Ibu</label>
              <input
                type="text"
                name="momName"
                value={formData.momName}
                onChange={handleMomNameChange} // Use new handler
                placeholder="Ketik nama atau cari di database"
              />
              {resultsMom.length > 0 && (
                <ul className="search-results">
                  {resultsMom.map((member) => (
                    <li key={member._id} className="search-item" onClick={() => handleSelectMember(member._id, "mother")}>
                      {member.fullName || member.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="form-group">
              <label>Tempat Baptis</label>
              <input
                type="text"
                name="placeofbaptism"
                value={formData.placeofbaptism}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Dibaptis oleh</label>
              <input
                type="text"
                name="pastorname"
                value={formData.pastorname}
                onChange={handleChange}
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
            <div className="form-group">
              <label>Tempat Lahir</label>
              <input
                type="text"
                name="placeofbirth"
                value={formData.placeofbirth}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Tanggal Lahir</label>
              <input
                type="date"
                name="dateofbirth"
                value={formData.dateofbirth}
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
                    <p><strong>Jenis Kelamin:</strong> {svc.gender || "-"}</p>
                    <p><strong>Tempat, Tanggal Lahir:</strong> {svc.placeofbirth || "-"}, {svc.dateofbirth ? new Date(svc.dateofbirth).toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    }) : "-"}</p>
                    <p><strong>Dibaptis oleh:</strong> {svc.pastorname || "-"}</p>
                    <p><strong>Nama Ayah:</strong> {svc.dadName || "-"}</p>
                    <p><strong>Nama Ibu:</strong> {svc.momName || "-"}</p>
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