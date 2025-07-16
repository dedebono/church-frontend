import React, { useState, useEffect } from "react"
import api from "./api/API"
import Swal from "sweetalert2"
import "./ChildForm.css"

function ChildForm() {
  const [formData, setFormData] = useState({
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

  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
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

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    try {
      const res = await api.get(`/api/members/search/${searchQuery}`)
      setSearchResults(res.data)
    } catch (err) {
      Swal.fire("Gagal", "Pencarian gagal.", "error")
    }
  }

  const handleSelectMember = async (memberId) => {
    try {
      const res = await api.get(`/api/members/${memberId}`)
      const member = res.data

      setFormData((prev) => ({
        ...prev,
        member: memberId,
        placeofbirth: member.placeOfBirth || "",
      }))

      setSearchResults([])
      setSearchQuery("")
    } catch (err) {
      Swal.fire("Gagal", "Gagal mengambil data anggota.", "error")
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
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
    <div
    className="cms-header">
    <h2>👶 Formulir Penyerahan Anak</h2>
    </div>
    <div className="form-card">
      <form onSubmit={handleSubmit} 

      /*search member */
      className="form-group">
        <label>Cari Anak</label>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Ketik nama lalu tekan Enter"
        />
        {searchResults.length > 0 && (
          <ul className="search-results">
            {searchResults.map((m) => (
              <li key={m._id} onClick={() => handleSelectMember(m._id)}>
                {m.fullName}
              </li>
            ))}
          </ul>
        )}
        <div className="form-row">
        <input name="certificateNumber" placeholder="No. Sertifikat" value={formData.certificateNumber} onChange={handleChange} required />
        <input name="fatherName" placeholder="Nama Ayah" value={formData.fatherName} onChange={handleChange} />
        <input name="motherName" placeholder="Nama Ibu" value={formData.motherName} onChange={handleChange} />
        <input name="placeofbirth" placeholder="Tempat Lahir" value={formData.placeofbirth} onChange={handleChange} />
        <input name="pastorName" placeholder="Nama Pendeta" value={formData.pastorName} onChange={handleChange} />
        <input name="place" placeholder="Tempat Penyerahan" value={formData.place} onChange={handleChange} />
        <input type="date" name="date" value={formData.date} onChange={handleChange} required />
        <input name="status" placeholder="Status (mis. Diberkati)" value={formData.status} onChange={handleChange} />
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Menyimpan..." : "Buat Sertifikat"}
        </button>
      </form>
      </div>

      <hr/>
      <h2>📄 Daftar Sertifikat Penyerahan Anak</h2>
      <div>
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
