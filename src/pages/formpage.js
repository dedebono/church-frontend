"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom" // Corrected import for React Router
import Swal from "sweetalert2"
import "./ServiceRequestForm.css"

const ServiceRequestForm = () => {
  const navigate = useNavigate() // Initialize useNavigate
  const [form, setForm] = useState({
    serviceType: "",
    fullName: "",
    address: "",
    phoneNumber: "",
    requestDetails: {},
  })

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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
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
      navigate('/') // Redirect to homepage using React Router
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
                  <input
                    id="place"
                    name="place"
                    type="text"
                    placeholder="Gereja"
                    onChange={handleDetailsChange}
                  />
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
                <input
                  id="spouseName"
                  name="spouseName"
                  type="text"
                  placeholder="Nama Mempelai"
                  onChange={handleDetailsChange}
                />
              </div>
              <div className="field-group">
                <label htmlFor="DadNameMan">Nama Ayah Mempelai Laki-laki</label>
                <input
                  id="DadNameMan"
                  name="DadNameMan"
                  type="text"
                  placeholder="Nama Ayah"
                  onChange={handleDetailsChange}
                />
              </div>
              <div className="field-group">
                <label htmlFor="MomNameMan">Nama Ibu Mempelai Laki-laki</label>
                <input
                  id="MomNameMan"
                  name="MomNameMan"
                  type="text"
                  placeholder="Nama Ibu"
                  onChange={handleDetailsChange}
                />
              </div>
              <div className="field-group">
                <label htmlFor="DadNameWoMan">Nama Ayah Mempelai Wanita</label>
                <input
                  id="DadNameWoMan"
                  name="DadNameWoMan"
                  type="text"
                  placeholder="Nama Ayah"
                  onChange={handleDetailsChange}
                />
              </div>
              <div className="field-group">
                <label htmlFor="MomNameWoman">Nama Ibu Mempelai Wanita</label>
                <input
                  id="MomNameWoman"
                  name="MomNameWoman"
                  type="text"
                  placeholder="Nama Ibu"
                  onChange={handleDetailsChange}
                />
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
                  <input
                    id="marriagePlace"
                    name="place"
                    type="text"
                    placeholder="Lokasi Acara"
                    onChange={handleDetailsChange}
                  />
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
                <input
                  id="DadName"
                  name="DadName"
                  type="text"
                  placeholder="Nama Ayah"
                  onChange={handleDetailsChange}
                />
              </div>
              <div className="field-group">
                <label htmlFor="MomName">Nama Ibu</label>
                <input
                  id="MomName"
                  name="MomName"
                  type="text"
                  placeholder="Nama Ibu"
                  onChange={handleDetailsChange}
                />
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
                  <input
                    id="childPlace"
                    name="place"
                    type="text"
                    placeholder="Gereja"
                    onChange={handleDetailsChange}
                  />
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
    <div className="form-container">
      {/* Decorative circles */}
      <div className="decoration-circle circle-1"></div>
      <div className="decoration-circle circle-2"></div>
      <div className="decoration-circle circle-3"></div>

      <div className="form-wrapper">
        {/* Header */}
        <div className="form-header">
        
        </div>

        <div className="form-card">
          <div className="card-header">
            <h2 className="form-title">Making Life Better Church</h2>

            {/* Progress Steps */}
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

              {/* Service Type Selection */}
              <div className="field-group">
                <label htmlFor="serviceType">Apa pelayanan yang bisa kami lakukan?</label>
                <select id="serviceType" name="serviceType" value={form.serviceType} onChange={handleChange} required>
                  <option value="">-- Select Service --</option>
                  <option value="Baptism">🕊️ Baptisan</option>
                  <option value="Marriage">👰🤵 Pemberkatan Nikah</option>
                  <option value="Child">👶 Penyerahan Anak</option>
                </select>
              </div>

              {/* Basic Information */}
              <div className="field-grid">
                <div className="field-group">
                  <label htmlFor="fullName">Nama Lengkap</label>
                  <div className="input-with-icon">
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="Nama Lengkap"
                      value={form.fullName}
                      onChange={handleChange}
                      required
                    />
                    <span className="input-icon">👤</span>
                  </div>
                </div>

                <div className="field-group">
                  <label htmlFor="phoneNumber">Phone Number</label>
                  <div className="input-with-icon">
                    <input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="text"
                      placeholder="Nomor telepon"
                      value={form.phoneNumber}
                      onChange={handleChange}
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
                    placeholder="Alamat lengkap"
                    value={form.address}
                    onChange={handleChange}
                    rows="3"
                  />
                  <span className="input-icon textarea-icon">📍</span>
                </div>
              </div>

              {/* Service-specific fields */}
              {form.serviceType && (
                <div className="service-section">
                  <div className="service-header">
                    <span className="service-icon">
                      {form.serviceType === "Baptism" && ""}
                      {form.serviceType === "Marriage" && ""}
                      {form.serviceType === "Child" && ""}
                    </span>
                    <h3 className="service-title">
                      {form.serviceType === "Baptism" && "Detail Baptisan"}
                      {form.serviceType === "Marriage" && "Detail Pemberkatan Nikah"}
                      {form.serviceType === "Child" && "Detail Penyerahan Anak"}
                    </h3>
                  </div>
                  {renderServiceFields()}
                </div>
              )}

              {/* Action Buttons */}
              <div className="form-actions">
                <button type="button" className="btn btn-cancel" onClick={handleCancel}>
                  Batal
                </button>
                <button type="submit" className="btn btn-submit">
                  Kirim
                </button>
              </div>
            </form>

            {/* Message Display */}
            {message && <div className={`message ${message.includes("✅") ? "success" : "error"}`}>{message}</div>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ServiceRequestForm