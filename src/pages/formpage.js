"use client"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Swal from "sweetalert2"
import { Menu } from "lucide-react"
import { Link } from "react-router-dom"
import api from "./admin/api/API" // ✅ Import your shared Axios instance
import "./formpage.css"
import "./footerPage.css"
import FooterPage from './footerPage'; // Changed to uppercase 'FooterPage'

const ServiceRequestForm = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    serviceType: "",
    fullName: "",
    address: "",
    phoneNumber: "",
    requestDetails: {},
  })

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)
  const closeMobileMenu = () => setIsMobileMenuOpen(false)


  const [message, setMessage] = useState("")

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleDetailsChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      requestDetails: { ...prev.requestDetails, [name]: value },
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await api.post("/api/service-requests", form) // ✅ Real backend call
      console.log("Submitted:", response.data)

      setMessage("✅ Permintaan sudah terkirim")
      setForm({
        serviceType: "",
        fullName: "",
        address: "",
        phoneNumber: "",
        requestDetails: {},
      })
    } catch (err) {
      console.error(err)
      setMessage("❌ Gagal mengirimkan")
      Swal.fire("Gagal", "Tidak dapat mengirim permintaan pelayanan.", "error")
    }
  }

  const handleCancel = async () => {
    const result = await Swal.fire({
      title: 'Apakah Anda yakin ingin membatalkan?',
      text: "Semua perubahan Anda tidak akan disimpan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ea580c',
      cancelButtonColor: '#d1d5db',
      confirmButtonText: 'Ya, Batalkan!',
      cancelButtonText: 'Tidak',
    })

    if (result.isConfirmed) {
      navigate('/')
    }
  }

  const renderServiceFields = () => {
    switch (form.serviceType) {
      case "Baptism":
        return (
          <div className="service-fields">
            <div className="field-grid">
              <div className="field-group">
                <label htmlFor="baptismDate">Tanggal Baptisan</label>
                <div className="input-with-icon">
                  <input id="baptismDate" name="baptismDate" type="date" onChange={handleDetailsChange} />
                  <span className="input-icon">📅</span>
                </div>
              </div>
              <div className="field-group">
                <label htmlFor="place">Tempat</label>
                <div className="input-with-icon">
                  <input id="place" name="place" type="text" placeholder="Gereja" onChange={handleDetailsChange} />
                  <span className="input-icon">📍</span>
                </div>
              </div>
            </div>
          </div>
        )
      case "Marriage":
        return (
          <div className="service-fields">
            <div className="field-grid">
              <div className="field-group">
                <label htmlFor="spouseName">Nama Mempelai Wanita</label>
                <input id="spouseName" name="spouseName" type="text" onChange={handleDetailsChange} />
              </div>
              <div className="field-group">
                <label htmlFor="DadNameMan">Nama Ayah Mempelai Laki-laki</label>
                <input id="DadNameMan" name="DadNameMan" type="text" onChange={handleDetailsChange} />
              </div>
              <div className="field-group">
                <label htmlFor="MomNameMan">Nama Ibu Mempelai Laki-laki</label>
                <input id="MomNameMan" name="MomNameMan" type="text" onChange={handleDetailsChange} />
              </div>
              <div className="field-group">
                <label htmlFor="DadNameWoMan">Nama Ayah Mempelai Wanita</label>
                <input id="DadNameWoMan" name="DadNameWoMan" type="text" onChange={handleDetailsChange} />
              </div>
              <div className="field-group">
                <label htmlFor="MomNameWoman">Nama Ibu Mempelai Wanita</label>
                <input id="MomNameWoman" name="MomNameWoman" type="text" onChange={handleDetailsChange} />
              </div>
              <div className="field-group">
                <label htmlFor="plannedDate">Rencana Tanggal Pernikahan</label>
                <div className="input-with-icon">
                  <input id="plannedDate" name="plannedDate" type="date" onChange={handleDetailsChange} />
                  <span className="input-icon">📅</span>
                </div>
              </div>
              <div className="field-group full-width">
                <label htmlFor="marriagePlace">Rencana Tempat Pernikahan</label>
                <div className="input-with-icon">
                  <input id="marriagePlace" name="place" type="text" onChange={handleDetailsChange} />
                  <span className="input-icon">📍</span>
                </div>
              </div>
            </div>
          </div>
        )
      case "Child":
        return (
          <div className="service-fields">
            <div className="field-grid">
              <div className="field-group">
                <label htmlFor="DadName">Nama Ayah</label>
                <input id="DadName" name="DadName" type="text" onChange={handleDetailsChange} />
              </div>
              <div className="field-group">
                <label htmlFor="MomName">Nama Ibu</label>
                <input id="MomName" name="MomName" type="text" onChange={handleDetailsChange} />
              </div>
              <div className="field-group">
                <label htmlFor="DateofBirth">Tanggal Lahir</label>
                <div className="input-with-icon">
                  <input id="DateofBirth" name="DateofBirth" type="date" onChange={handleDetailsChange} />
                  <span className="input-icon">📅</span>
                </div>
              </div>
              <div className="field-group">
                <label htmlFor="childPlace">Tempat</label>
                <div className="input-with-icon">
                  <input id="childPlace" name="place" type="text" onChange={handleDetailsChange} />
                  <span className="input-icon">📍</span>
                </div>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (

    <div>
            <header className="pagelayer-header">
        {/* Main Navigation Section */}
        <nav className="main-nav">
          <div className="container nav-content">
            <div className="logo">
              <a href="/" className="logo-link">
                MLB Church
              </a>
            </div>
            <ul className={`nav-menu ${isMobileMenuOpen ? "active" : ""}`}>
              <li>
                <a href="/" onClick={closeMobileMenu}>Dashboard</a>
              </li>
             <li>
                <Link to="/register" onClick={closeMobileMenu}>Daftar</Link>
              </li>
            </ul>
            <button className="mobile-menu-toggle"
            onClick={toggleMobileMenu}>
              <Menu size={24} />
            </button>
          </div>
        </nav>
      </header>

    <div className="form-container">
      <div className="decoration-circle circle-1"></div>
      <div className="decoration-circle circle-2"></div>
      <div className="decoration-circle circle-3"></div>

      <div className="form-wrapper">
        <div className="form-header"></div>

        <div className="form-card">
          <div className="card-header">
            <h2 className="form-title">Making Life Better Church</h2>
            <div className="progress-steps">
              <div className="step active">
                <div className="step-number">1</div>
                <span className="step-label">Kebutuhan Pelayanan</span>
              </div>
              <div className="step-divider"></div>
              <div className="step">
                <div className="step-number">2</div>
                <span className="step-label">Data Diri</span>
              </div>
              <div className="step-divider"></div>
              <div className="step">
                <div className="step-number">3</div>
                <span className="step-label">Konfirmasi</span>
              </div>
            </div>
          </div>

          <div className="card-content">
            <form onSubmit={handleSubmit} className="form">
              <div className="field-group">
                <label htmlFor="serviceType">Apa pelayanan yang bisa kami lakukan?</label>
                <select id="serviceType" name="serviceType" value={form.serviceType} onChange={handleChange} required>
                  <option value="">-- Silakan pilih --</option>
                  <option value="Baptism">🕊️ Baptisan</option>
                  <option value="Marriage">👰🤵 Pemberkatan Nikah</option>
                  <option value="Child">👶 Penyerahan Anak</option>
                </select>
              </div>

              <div className="field-grid">
                <div className="field-group">
                  <label htmlFor="fullName">Nama Lengkap</label>
                  <div className="input-with-icon">
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      value={form.fullName}
                      onChange={handleChange}
                      placeholder="Nama Lengkap"
                      required
                    />
                    <span className="input-icon">👤</span>
                  </div>
                </div>

                <div className="field-group">
                  <label htmlFor="phoneNumber">Nomor Telepon</label>
                  <div className="input-with-icon">
                    <input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="text"
                      value={form.phoneNumber}
                      onChange={handleChange}
                      placeholder="08xxxx"
                      required
                    />
                    <span className="input-icon">📞</span>
                  </div>
                </div>
              </div>

              <div className="field-group">
                <label htmlFor="address">Alamat</label>
                <div className="input-with-icon">
                  <textarea
                    id="address"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Alamat lengkap"
                    rows="3"
                    required
                  />
                  <span className="input-icon textarea-icon">📍</span>
                </div>
              </div>

              {form.serviceType && (
                <div className="service-section">
                  <div className="service-header">
                    <h3 className="service-title">
                      {form.serviceType === "Baptism" && "Detail Baptisan"}
                      {form.serviceType === "Marriage" && "Detail Pemberkatan Nikah"}
                      {form.serviceType === "Child" && "Detail Penyerahan Anak"}
                    </h3>
                  </div>
                  {renderServiceFields()}
                </div>
              )}

              <div className="form-actions">
                <button type="button" className="btn btn-cancel" onClick={handleCancel}>Batal</button>
                <button type="submit" className="btn btn-submit">Kirim</button>
              </div>
            </form>

            {message && <div className={`message ${message.includes("✅") ? "success" : "error"}`}>{message}</div>}
          </div>
        </div>
      </div>

    <div className="footer">
      <FooterPage /> {/* Changed to uppercase 'FooterPage' */}
    </div>

    </div>
        </div>
  )
}


export default ServiceRequestForm