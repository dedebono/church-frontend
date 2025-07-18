import React, { useState, useEffect } from "react"
import api from "./api/API"
import Swal from "sweetalert2"
import "./marriageForm.css"

function MarriageForm() {
  const [formData, setFormData] = useState({
    husband: "",
    wife: "",
    date: "",
    certificateNumber: "",
    husbandplaceofbirth: "",
    husbandateofbirth: "",
    wifeplaceofbirth: "",
    wifedateofbirth: "",
    husbandFatherName: "",
    husbandMotherName: "",
    wifeFatherName: "",
    wifeMotherName: "",
    phoneNumber: "",
    marriageStatus: "",
    placeOfMarriage: "",
  })

  const [searchHusband, setSearchHusband] = useState("")
  const [searchWife, setSearchWife] = useState("")
  const [resultsHusband, setResultsHusband] = useState([])
  const [resultsWife, setResultsWife] = useState([])
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const res = await api.get("/api/marriage-services")
      setRecords(res.data)
    } catch (err) {
      console.error("Fetch error:", err)
    }
  }

  const searchMember = async (query, setResult) => {
    if (!query.trim()) return
    try {
      const res = await api.get(`/api/members/search/${query}`)
      setResult(res.data)
    } catch (err) {
      Swal.fire("Gagal", "Pencarian gagal.", "error")
    }
  }

  const handleselectMember = async (memberId, role) => {
    try {
      const res = await api.get(`/api/members/${memberId}`)
      const member = res.data
      if (role === "husband") {
        setFormData((prev) => ({
          ...prev,
          husband: memberId,
          husbandplaceofbirth: member.placeOfBirth || "",
          husbandateofbirth: member.dateOfBirth || "",
        }))
        setSearchHusband("")
        setResultsHusband([])
      } else {
        setFormData((prev) => ({
          ...prev,
          wife: memberId,
          wifeplaceofbirth: member.placeOfBirth || "",
          wifedateofbirth: member.dateOfBirth || "",
        }))
        setSearchWife("")
        setResultsWife([])
      }
    } catch (err) {
      Swal.fire("Gagal", "Gagal ambil detail jemaat.", "error")
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.husband || !formData.wife) {
      return Swal.fire("Pilih Pasangan", "Pilih suami dan istri.", "warning")
    }

    setLoading(true)
    try {
      await api.post("/api/marriage-services", formData)
      Swal.fire("Berhasil", "Sertifikat pernikahan dibuat.", "success")
      setFormData({
        husband: "",
        wife: "",
        date: "",
        certificateNumber: "",
        husbandplaceofbirth: "",
        husbandateofbirth: "",
        wifeplaceofbirth: "",
        wifedateofbirth: "",
        husbandFatherName: "",
        husbandMotherName: "",
        wifeFatherName: "",
        wifeMotherName: "",
        phoneNumber: "",
        marriageStatus: "",
        placeOfMarriage: "",
        pastorName:"",
      })
      fetchServices()
    } catch (err) {
      Swal.fire("Gagal", "Gagal menyimpan data.", "error")
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
      await api.delete(`/api/marriage-services/${id}`)
      Swal.fire("Dihapus", "Sertifikat dihapus.", "success")
      fetchServices()
    } catch (err) {
      Swal.fire("Gagal", "Gagal menghapus.", "error")
    }
  }

  const handlePrint = (svc) => {
    const husband = svc.husband?.fullName || "Suami"
    const wife = svc.wife?.fullName || "Istri"
    const date = new Date(svc.date).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    const content = `
      <html><head><title>Sertifikat Pernikahan</title></head>
      <body style="font-family: sans-serif; text-align: center;">
        <h1>💍 Sertifikat Pernikahan</h1>
        <p>Menyatakan bahwa:</p>
        <h2>${husband} ❤️ ${wife}</h2>
        <p>Telah menikah pada:</p>
        <h3>${date}</h3>
        <p>No. Sertifikat: ${svc.certificateNumber}</p>
        <p>Tempat: ${svc.placeOfMarriage}</p>
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
    <div
    className="event-cms-container">
        <div className="cms-header">
      <h2>💍 Formulir Sertifikat Pernikahan</h2>
        </div>
        <div className="form-card">
      <form onSubmit={handleSubmit} className="event-form">
        {/* Search husband */}
<div className="form-row">
  <div className="form-group">
    <label>Cari Suami</label>
    <input
      type="text"
      value={searchHusband}
      onChange={(e) => setSearchHusband(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && searchMember(searchHusband, setResultsHusband)}
      placeholder="Ketik nama lalu Enter"
    />
    {resultsHusband.length > 0 && (
      <ul className="search-results">
        {resultsHusband.map((member) => (
          <li key={member._id} className="search-item" onClick={() => handleselectMember(member._id, "husband")}>
            {member.fullName}
          </li>
        ))}
      </ul>
    )}
    {formData.husband && (
      <p style={{ fontSize: "0.9rem", color: "#4b5563", marginTop: "-10px" }}>
        ✅ Calon suami terpilih: <code>{formData.husband}</code>
      </p>
    )}
  </div>

  <div className="form-group">
    <label>Cari Istri</label>
    <input
      type="text"
      value={searchWife}
      onChange={(e) => setSearchWife(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && searchMember(searchWife, setResultsWife)}
      placeholder="Ketik nama lalu Enter"
    />
    {resultsWife.length > 0 && (
      <ul className="search-results">
        {resultsWife.map((member) => (
          <li key={member._id} className="search-item" onClick={() => handleselectMember(member._id, "wife")}>
            {member.fullName}
          </li>
        ))}
      </ul>
    )}
    {formData.wife && (
      <p style={{ fontSize: "0.9rem", color: "#4b5563", marginTop: "-10px" }}>
        ✅ Calon istri terpilih: <code>{formData.wife}</code>
      </p>
    )}
  </div>
</div>

        {/* Form details */}
        <div className="form-row">
        <input name="certificateNumber" 
        className="form-group"
        placeholder="No. Sertifikat" value={formData.certificateNumber} onChange={handleChange} required />
        <input name="placeOfMarriage" 
        placeholder="Tempat Pernikahan" 
        className="form-group"
        value={formData.placeOfMarriage} onChange={handleChange} required />
        <input name="date" type="date" value={formData.date} onChange={handleChange} required />
        <input name="phoneNumber" placeholder="No. HP" value={formData.phoneNumber} onChange={handleChange} />
        <input name="husbandFatherName" placeholder="Ayah Suami" value={formData.husbandFatherName} onChange={handleChange} />
        <input name="husbandMotherName" placeholder="Ibu Suami" value={formData.husbandMotherName} onChange={handleChange} />
        <input name="wifeFatherName" placeholder="Ayah Istri" value={formData.wifeFatherName} onChange={handleChange} />
        <input name="wifeMotherName" placeholder="Ibu Istri" value={formData.wifeMotherName} onChange={handleChange} />
        <input name="pastorName" placeholder="Pendeta yang memberkati" value={formData.pastorName} onChange={handleChange} />
 </div>
        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? "Menyimpan..." : "Buat Sertifikat"}
        </button>
      </form>
      </div>

      <hr />
      <h2>📄 Daftar Sertifikat Pernikahan</h2>
      <div className="events-grid">
        {records.map((svc) => (
          <div key={svc._id} className="event-card">
            <h4>{svc.husband?.fullName} ❤️ {svc.wife?.fullName}</h4>
            <p><strong>Tanggal:</strong> {new Date(svc.date).toLocaleDateString("id-ID")}</p>
            <p><strong>No. Sertifikat:</strong> {svc.certificateNumber}</p>
            <p><strong>Tempat:</strong> {svc.placeOfMarriage}</p>
            <button className="btn-view" onClick={() => handlePrint(svc)}>🖨️ Cetak</button>
            <button className="btn-delete" onClick={() => handleDelete(svc._id)}>🗑️ Hapus</button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MarriageForm
