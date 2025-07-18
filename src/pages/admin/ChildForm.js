import React, { useState, useEffect } from "react"
import api from "./api/API"
import Swal from "sweetalert2"
import "./ChildForm.css"

function ChildForm() {
  const [formData, setFormData] = useState({
    member: "", // Stores the ID of the selected child member for backend
    date: "",
    certificateNumber: "",
    fatherName: "", // Serves as both search input and display for father's name
    motherName: "", // Serves as both search input and display for mother's name
    placeofbirth: "", // Populated from the selected child's data, remains read-only
    pastorName: "",
    place: "",
    status: "",
  })

  // State for the value displayed in the "Nama Anak" input field
  const [childNameInput, setChildNameInput] = useState("")

  // States for search results/suggestions for child, father, and mother
  const [resultsChild, setResultsChild] = useState([])
  const [resultsFather, setResultsFather] = useState([])
  const [resultsMother, setResultsMother] = useState([])

  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const res = await api.get("/api/child-services")
      setRecords(res.data)
    } catch (err) {
      console.error("Fetch error:", err)
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
      Swal.fire("Gagal", "Pencarian gagal.", "error")
    }
  }

  // Generalized handler for selecting a member (child, father, or mother)
  const handleSelectMember = async (memberId, role) => {
    try {
      const res = await api.get(`/api/members/${memberId}`)
      const member = res.data

      if (role === "child") {
        setFormData((prev) => ({
          ...prev,
          member: memberId, // Store child's ID for backend
          placeofbirth: member.placeOfBirth || "", // Auto-fill place of birth
        }))
        setChildNameInput(member.fullName) // Display full name in the input
        setResultsChild([]) // Clear search results for child
      } else if (role === "father") {
        setFormData((prev) => ({
          ...prev,
          fatherName: member.fullName || "", // Store father's full name directly in the form field
        }))
        setResultsFather([]) // Clear search results for father
      } else if (role === "mother") {
        setFormData((prev) => ({
          ...prev,
          motherName: member.fullName || "", // Store mother's full name directly in the form field
        }))
        setResultsMother([]) // Clear search results for mother
      }
    } catch (err) {
      Swal.fire("Gagal", "Gagal mengambil detail jemaat.", "error")
    }
  }

  // Handles changes for regular form inputs (non-autocomplete)
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handles input and search for the Child's Name field
  const handleChildInputChange = (e) => {
    const value = e.target.value
    setChildNameInput(value) // Update the input display
    searchMember(value, setResultsChild) // Trigger search for child
  }

  // Handles input and search for the Father's Name field
  const handleFatherInputChange = (e) => {
    const value = e.target.value
    setFormData((prev) => ({ ...prev, fatherName: value })) // Update formData for father's name
    searchMember(value, setResultsFather) // Trigger search for father
  }

  // Handles input and search for the Mother's Name field
  const handleMotherInputChange = (e) => {
    const value = e.target.value
    setFormData((prev) => ({ ...prev, motherName: value })) // Update formData for mother's name
    searchMember(value, setResultsMother) // Trigger search for mother
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.member) {
      return Swal.fire("Pilih Anak", "Silakan pilih anak terlebih dahulu.", "warning")
    }

    setLoading(true)
    try {
      await api.post("/api/child-services", formData)
      Swal.fire("Berhasil", "Sertifikat penyerahan anak dibuat.", "success")
      // Reset form and all search-related states after successful submission
      setFormData({
        member: "",
        date: "",
        certificateNumber: "",
        fatherName: "",
        motherName: "",
        placeofbirth: "",
        pastorName: "",
        place: "",
        status: "",
      })
      setChildNameInput("")
      setResultsChild([])
      setResultsFather([])
      setResultsMother([])

      fetchServices()
    } catch (err) {
      Swal.fire("Gagal", "Gagal membuat sertifikat.", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Hapus sertifikat?",
      text: "Tindakan ini tidak dapat dibatalkan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya",
      cancelButtonText: "Batal",
    })
    if (!result.isConfirmed) return

    try {
      await api.delete(`/api/child-services/${id}`)
      Swal.fire("Dihapus", "Data sertifikat dihapus.", "success")
      fetchServices()
    } catch (err) {
      Swal.fire("Gagal", "Gagal menghapus.", "error")
    }
  }

  const handlePrint = (svc) => {
    const memberName = svc.member?.fullName || "Anak"
    const date = new Date(svc.date).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    const content = `
      <html><head><title>Sertifikat Penyerahan Anak</title></head>
      <body style="font-family: sans-serif; text-align: center;">
        <h1>👶 Sertifikat Penyerahan Anak</h1>
        <p>Menyatakan bahwa:</p>
        <h2>${memberName}</h2>
        <p>Telah diserahkan kepada Tuhan pada tanggal</p>
        <h3>${date}</h3>
        <p>No. Sertifikat: ${svc.certificateNumber}</p>
        <p>Ditempat: ${svc.place}</p>
        <p>Oleh: ${svc.pastorName || "-"}</p>
        <p>Ayah: ${svc.fatherName || "-"}</p>
        <p>Ibu: ${svc.motherName || "-"}</p>
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() { window.close(); }
          }
        </script>
      </body></html>
    `
    const win = window.open("", "_blank")
    win.document.write(content)
    win.document.close()
  }

  return (
    <div className="event-cms-container">
      <div className="cms-header">
        <h2>👶 Formulir Penyerahan Anak</h2>
      </div>
      <div className="form-card">
        <form onSubmit={handleSubmit} className="event-form">
          {/* Combined Search/Input for Child's Name */}
          <div className="form-row">
            <div className="form-group">
              <label>Nama Anak</label>
              <input
                type="text"
                value={childNameInput}
                onChange={handleChildInputChange}
                placeholder="Ketik nama atau cari di database"
              />
              {resultsChild.length > 0 && (
                <ul className="search-results">
                  {resultsChild.map((member) => (
                    <li key={member._id} className="search-item" onClick={() => handleSelectMember(member._id, "child")}>
                      {member.fullName}
                    </li>
                  ))}
                </ul>
              )}
              {/* Optional: Show selected child's ID for confirmation/debugging */}
              {formData.member && (
                <p style={{ fontSize: "0.9rem", color: "#4b5563", marginTop: "-10px" }}>
                  ✅ ID Anak: <code>{formData.member}</code>
                </p>
              )}
            </div>
          </div>

          {/* Combined Search/Input for Father's Name */}
          <div className="form-row">
            <div className="form-group">
              <label>Nama Ayah</label>
              <input
                type="text"
                name="fatherName"
                value={formData.fatherName}
                onChange={handleFatherInputChange} // New handler for father
                placeholder="Ketik nama atau cari di database"
              />
              {resultsFather.length > 0 && (
                <ul className="search-results">
                  {resultsFather.map((member) => (
                    <li key={member._id} className="search-item" onClick={() => handleSelectMember(member._id, "father")}>
                      {member.fullName}
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
                name="motherName"
                value={formData.motherName}
                onChange={handleMotherInputChange} // New handler for mother
                placeholder="Ketik nama atau cari di database"
              />
              {resultsMother.length > 0 && (
                <ul className="search-results">
                  {resultsMother.map((member) => (
                    <li key={member._id} className="search-item" onClick={() => handleSelectMember(member._id, "mother")}>
                      {member.fullName}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Other Form details */}
          <div className="form-row">
            <input name="certificateNumber" className="form-group" placeholder="No. Sertifikat" value={formData.certificateNumber} onChange={handleChange} required />
            <input name="placeofbirth" className="form-group" placeholder="Tempat Lahir Anak" value={formData.placeofbirth} onChange={handleChange} readOnly />
            <input name="pastorName" className="form-group" placeholder="Nama Pendeta" value={formData.pastorName} onChange={handleChange} />
            <input name="place" className="form-group" placeholder="Tempat Penyerahan" value={formData.place} onChange={handleChange} />
            <input type="date" name="date" className="form-group" value={formData.date} onChange={handleChange} required />
            <input name="status" className="form-group" placeholder="Status (mis. Diberkati)" value={formData.status} onChange={handleChange} />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Menyimpan..." : "Buat Sertifikat"}
          </button>
        </form>
      </div>

      <hr />
      <h2>📄 Daftar Sertifikat Penyerahan Anak</h2>
      <div className="events-grid">
        {records.map((svc) => (
          <div key={svc._id} className="event-card">
            <h4>{svc.member?.fullName}</h4>
            <p><strong>Tanggal:</strong> {new Date(svc.date).toLocaleDateString("id-ID")}</p>
            <p><strong>No. Sertifikat:</strong> {svc.certificateNumber}</p>
            <p><strong>Tempat:</strong> {svc.place}</p>
            <button className="btn-view" onClick={() => handlePrint(svc)}>🖨️ Cetak</button>
            <button className="btn-delete" onClick={() => handleDelete(svc._id)}>🗑️ Hapus</button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ChildForm