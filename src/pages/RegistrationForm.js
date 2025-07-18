"use client"

import { useState, useEffect } from "react"
import api from "./admin/api/API"
import "./RegistrationForm.css"
import Swal from "sweetalert2"

function RegistrationForm() {
  // Original state variables
  const [familyName, setFamilyName] = useState("")
  const [familyDate, setFamilyDate] = useState("")
  const [email, setEmail] = useState("")
  const [familyId, setFamilyId] = useState(null)
  const [isFamilySubmitted, setIsFamilySubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // New state for step management
  const [currentStep, setCurrentStep] = useState(1)

  const [members, setMembers] = useState([
    {
      fullName: "",
      gender: "",
      placeOfBirth: "",
      dateOfBirth: "",
      bloodType: "",
      phoneNumber: "",
      address: "",
      familyStatus: "",
      hobby: "",
      eduHistory: "",
      jobNow: "",
      baptismStatus: "",
      maritalStatus: "",
      congregationStatus: "",
      bpjsStatus: "",
      yakumkrisStatus: "",
    },
  ])

  // Steps configuration
  const steps = [
    { id: 1, title: "Data Keluarga", icon: "fas fa-user", description: "Informasi kepala keluarga" },
    { id: 2, title: "Anggota Keluarga", icon: "fas fa-users", description: "Detail anggota keluarga" },
    { id: 3, title: "Review", icon: "fas fa-file-text", description: "Periksa data" },
    { id: 4, title: "Konfirmasi", icon: "fas fa-check-square", description: "Konfirmasi pendaftaran" },
    { id: 5, title: "Selesai", icon: "fas fa-receipt", description: "Pendaftaran berhasil" },
  ]

  // Calculate progress
  const progress = (currentStep / steps.length) * 100

  // Debugging: watch familyId
  useEffect(() => {
    console.log("Updated familyId:", familyId)
  }, [familyId])

  // SweetAlert functions
  const showSuccessAlert = (title, text) => {
    Swal.fire({
      title: title,
      text: text,
      icon: "success",
      confirmButtonText: "OK",
      confirmButtonColor: "#10b981",
    })
  }

  const showErrorAlert = (message) => {
    Swal.fire({
      title: "Error!",
      text: message,
      icon: "error",
      confirmButtonText: "OK",
      confirmButtonColor: "#ef4444",
    })
  }

  const showConfirmAlert = () => {
    return Swal.fire({
      title: "Konfirmasi Pendaftaran",
      text: "Apakah data yang Anda masukkan sudah benar?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Ya, Daftar!",
      cancelButtonText: "Batal",
    })
  }

  const handleFamilySubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!familyName || !familyDate || !email) {
      showErrorAlert("Mohon lengkapi semua field yang diperlukan.")
      return
    }

    setIsLoading(true)
    try {
      const familyResponse = await api.post("/api/families", {
        familyName,
        familyDate,
        email,
      })

      const id = familyResponse.data._id
      if (!id) {
        throw new Error("Family _id not found in response")
      }

      setFamilyId(id)
      setIsFamilySubmitted(true)
      setCurrentStep(2)

      Swal.fire({
        title: "Data Keluarga Tersimpan!",
        text: "Silakan lanjutkan dengan mengisi data anggota keluarga.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      })
    } catch (error) {
      console.error("Family registration failed:", {
        error: error.message,
        response: error.response?.data,
        stack: error.stack,
      })
      showErrorAlert(error.response?.data?.message || "Gagal menyimpan data keluarga. Silakan coba lagi.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleMemberChange = (index, fieldName, event) => {
    const newMembers = [...members]
    newMembers[index][fieldName] = event.target.value
    setMembers(newMembers)
  }

  const handleMemberDateChange = (index, fieldName, date) => {
    const newMembers = [...members]
    newMembers[index][fieldName] = date ? date.toISOString().split("T")[0] : ""
    setMembers(newMembers)
  }

  const addMember = () => {
    setMembers([
      ...members,
      {
        fullName: "",
        gender: "",
        placeOfBirth: "",
        dateOfBirth: "",
        bloodType: "",
        phoneNumber: "",
        address: "",
        familyStatus: "",
        hobby: "",
        eduHistory: "",
        jobNow: "",
        baptismStatus: "",
        maritalStatus: "",
        congregationStatus: "",
        bpjsStatus: "",
        yakumkrisStatus: "",
      },
    ])
  }

  const removeMember = (index) => {
    if (members.length <= 1) {
      showErrorAlert("Minimal harus ada satu anggota keluarga.")
      return
    }
    const newMembers = [...members]
    newMembers.splice(index, 1)
    setMembers(newMembers)
  }

  const handleAllSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!familyId) {
      showErrorAlert("Please register the family first.")
      return
    }

    const invalidMembers = members.some((member) => !member.fullName || !member.gender || !member.familyStatus)

    if (invalidMembers) {
      showErrorAlert("Mohon lengkapi data wajib untuk setiap anggota keluarga.")
      return
    }

    const result = await showConfirmAlert()
    if (!result.isConfirmed) return

    setIsLoading(true)
    try {
      const membersWithFamily = members.map((member) => ({
        ...member,
        familyId: familyId,
      }))

      const response = await api.post("/api/members", membersWithFamily)
      console.log("Members submission response:", response)

      setCurrentStep(5)
      showSuccessAlert(
        "Pendaftaran Berhasil!",
        "Data keluarga dan anggota telah berhasil didaftarkan. Password akses telah dikirim ke email Anda.",
      )
    } catch (error) {
      console.error("Members registration failed:", {
        error: error.message,
        response: error.response?.data,
        stack: error.stack,
      })
      showErrorAlert(error.response?.data?.message || "Gagal menyimpan data anggota. Silakan coba lagi.")
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFamilyName("")
    setFamilyDate("")
    setEmail("")
    setFamilyId(null)
    setIsFamilySubmitted(false)
    setCurrentStep(1)
    setMembers([
      {
        fullName: "",
        gender: "",
        placeOfBirth: "",
        dateOfBirth: "",
        bloodType: "",
        phoneNumber: "",
        address: "",
        familyStatus: "",
        hobby: "",
        eduHistory: "",
        jobNow: "",
        baptismStatus: "",
        maritalStatus: "",
        congregationStatus: "",
        bpjsStatus: "",
        yakumkrisStatus: "",
      },
    ])

    Swal.fire({
      title: "Form Direset",
      text: "Silakan mulai pendaftaran baru.",
      icon: "info",
      timer: 1500,
      showConfirmButton: false,
    })
  }

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="margin">
    <div className="registration-container">
      <div className="registration-card">
        {/* Sidebar with Steps */}
        <div className="sidebar">
          <div className="sidebar-header">
            <h1>Pendaftaran Keluarga</h1>
            <p>Sistem Informasi Jemaat</p>
          </div>

          <div className="pprogress-section">
            <div className="pprogress-info">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="pprogress-bar">
              <div className="pprogress-fill" style={{ width: `${progress}%` }}></div>
            </div>
          </div>

          <div className="steps-list">
            {steps.map((step) => {
              const isCompleted = currentStep > step.id
              const isCurrent = currentStep === step.id

              return (
                <div
                  key={step.id}
                  className={`step-item ${isCurrent ? "active" : ""} ${isCompleted ? "completed" : ""}`}
                  onClick={() => {
                    // Only allow navigation to completed or current step
                    if (step.id <= currentStep) {
                      setCurrentStep(step.id)
                    }
                  }}
                >
                  <div className="step-icon">
                    <i className={isCompleted ? "fas fa-check" : step.icon}></i>
                  </div>
                  <div className="step-content">
                    <div className="step-title">{step.title}</div>
                    <div className="step-description">{step.description}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {/* Step 1: Family Data */}
          {currentStep === 1 && (
            <div className="step-content-panel active">
              <div className="step-header">
                <h2>Data Keluarga</h2>
                <p>Masukkan informasi kepala keluarga</p>
              </div>

              <form className="form-section" onSubmit={handleFamilySubmit}>
                <div className="form-group-regis">
                  <label htmlFor="familyName">Nama Kepala Keluarga *</label>
                  <input
                  className="input_1"
                    type="text"
                    id="familyName"
                    value={familyName}
                    onChange={(e) => setFamilyName(e.target.value)}
                    placeholder="Masukkan nama kepala keluarga"
                    required
                  />
                </div>

                <div className="form-group-regis">
                  <label htmlFor="familyDate">Tanggal Pernikahan *</label>
                  <input
                  className="input_1"
                    type="date"
                    id="familyDate"
                    value={familyDate}
                    onChange={(e) => setFamilyDate(e.target.value)}
                    required
                  />
                  <small>Isi dengan 01/01/2000 jika belum menikah</small>
                </div>

                <div className="form-group-regis">
                  <label htmlFor="email">Email *</label>
                  <input
                  className="input_1"
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    required
                  />
                  <small>Password akan dikirim ke email ini</small>
                </div>

                <button type="submit" className="btn-primary-regis" disabled={isLoading}>
                  <span className="btn-text">{isLoading ? "Menyimpan..." : "Lanjutkan"}</span>
                  {isLoading && (
                    <div className="btn-loader">
                      <i className="fas fa-spinner fa-spin"></i>
                    </div>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Step 2: Family Members */}
          {currentStep === 2 && (
            <div className="step-content-panel active">
              <div className="step-header">
                <h2>Anggota Keluarga</h2>
                <p>Masukkan data setiap anggota keluarga</p>
              </div>

              <div className="mmembers-container">
                {members.map((member, index) => (
                  <div className="mmember-card" key={index}>
                    <div className="mmember-header">
                      <h3 className="mmember-title">Anggota Keluarga {index + 1}</h3>
                      {members.length > 1 && (
                        <button type="button" className="btn-danger" onClick={() => removeMember(index)}>
                          <i className="fas fa-trash"></i> Hapus
                        </button>
                      )}
                    </div>

                    <div className="mmember-form">
                      <div className="form-group-regis">
                        <label>Nama Lengkap *</label>
                        <input
                          type="text"
                          className="input_1"
                          value={member.fullName}
                          onChange={(e) => handleMemberChange(index, "fullName", e)}
                          placeholder="Sesuai KTP"
                          required
                        />
                      </div>

                      <div className="form-group-regis">
                        <label>Jenis Kelamin *</label>
                        <select value={member.gender} onChange={(e) => handleMemberChange(index, "gender", e)} required>
                          <option value="">Pilih jenis kelamin</option>
                          <option value="Laki-laki">Laki-laki</option>
                          <option value="Perempuan">Perempuan</option>
                        </select>
                      </div>

                      <div className="form-group-regis">
                        <label>Tempat Lahir *</label>
                        <input
                          type="text"
                          className="input_1"
                          value={member.placeOfBirth}
                          onChange={(e) => handleMemberChange(index, "placeOfBirth", e)}
                          placeholder="Kota kelahiran"
                          required
                        />
                      </div>

                      <div className="form-group-regis">
                        <label>Tanggal Lahir *</label>
                        <input
                          type="date"
                          className="input_2"
                          value={member.dateOfBirth}
                          onChange={(e) => handleMemberChange(index, "dateOfBirth", e)}
                          required
                        />
                      </div>

                      <div className="form-group-regis">
                        <label>Golongan Darah *</label>
                        <select
                          value={member.bloodType}
                          onChange={(e) => handleMemberChange(index, "bloodType", e)}
                          required
                        >
                          <option value="">Pilih golongan darah</option>
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="O">O</option>
                          <option value="AB">AB</option>
                        </select>
                      </div>

                      <div className="form-group-regis">
                        <label>No. Handphone *</label>
                        <input
                          type="tel"
                          className="input_2"
                          value={member.phoneNumber}
                          onChange={(e) => handleMemberChange(index, "phoneNumber", e)}
                          placeholder="08xxxxxxxxxx"
                          required
                        />
                      </div>

                      <div className="form-group-regis full-width">
                        <label>Alamat *</label>
                        <input
                          type="text"
                          className="input_2"
                          value={member.address}
                          onChange={(e) => handleMemberChange(index, "address", e)}
                          placeholder="Alamat lengkap"
                          required
                        />
                      </div>

                      <div className="form-group-regis">
                        <label>Hubungan Keluarga *</label>
                        <select
                          value={member.familyStatus}
                          onChange={(e) => handleMemberChange(index, "familyStatus", e)}
                          required
                        >
                          <option value="">Pilih hubungan</option>
                          <option value="Suami">Suami</option>
                          <option value="Istri">Istri</option>
                          <option value="Anak">Anak</option>
                          <option value="Saudara">Saudara</option>
                          <option value="Single">Single</option>
                        </select>
                      </div>

                      <div className="form-group-regis">
                        <label>Status Pernikahan *</label>
                        <select
                          value={member.maritalStatus}
                          onChange={(e) => handleMemberChange(index, "maritalStatus", e)}
                          required
                        >
                          <option value="">Status pernikahan</option>
                          <option value="Menikah">Menikah</option>
                          <option value="Belum Menikah">Belum Menikah</option>
                          <option value="Janda/Duda">Janda/Duda</option>
                        </select>
                      </div>

                      <div className="form-group-regis">
                        <label>Hobi</label>
                        <input
                          type="text"
                          className="input_1"
                          value={member.hobby}
                          onChange={(e) => handleMemberChange(index, "hobby", e)}
                          placeholder="Hobi"
                        />
                      </div>

                      <div className="form-group-regis">
                        <label>Pendidikan Terakhir</label>
                        <select value={member.eduHistory} onChange={(e) => handleMemberChange(index, "eduHistory", e)}>
                          <option value="">Pendidikan terakhir</option>
                          <option value="Belum Sekolah">Belum Sekolah</option>
                          <option value="Sekolah Dasar (SD)">Sekolah Dasar (SD)</option>
                          <option value="Sekolah Menengah Pertama(SMP)">Sekolah Menengah Pertama(SMP)</option>
                          <option value="Sekolah Menengah Atas (SMA)">Sekolah Menengah Atas (SMA)</option>
                          <option value="Perguruan Tinggi">Perguruan Tinggi</option>
                        </select>
                      </div>

                      <div className="form-group-regis">
                        <label>Pekerjaan</label>
                        <input
                          type="text"
                          className="input_1"
                          value={member.jobNow}
                          onChange={(e) => handleMemberChange(index, "jobNow", e)}
                          placeholder="Pekerjaan"
                        />
                      </div>

                      <div className="form-group-regis">
                        <label>Status Baptisan</label>
                        <select
                          value={member.baptismStatus}
                          onChange={(e) => handleMemberChange(index, "baptismStatus", e)}
                        >
                          <option value="">Status baptisan</option>
                          <option value="Belum">Belum</option>
                          <option value="Sudah">Sudah</option>
                        </select>
                      </div>

                      <div className="form-group-regis">
                        <label>Status Anggota</label>
                        <select
                          value={member.congregationStatus}
                          onChange={(e) => handleMemberChange(index, "congregationStatus", e)}
                        >
                          <option value="">Status anggota</option>
                          <option value="Jemaat">Jemaat</option>
                          <option value="Simpatisan">Simpatisan</option>
                          <option value="Tamu">Tamu</option>
                        </select>
                      </div>

                      <div className="form-group-regis">
                        <label>BPJS</label>
                        <select value={member.bpjsStatus} onChange={(e) => handleMemberChange(index, "bpjsStatus", e)}>
                          <option value="">BPJS</option>
                          <option value="Ada">Ada</option>
                          <option value="Tidak ada">Tidak ada</option>
                        </select>
                      </div>

                      <div className="form-group-regis">
                        <label>Anggota YAKUMKRIS</label>
                        <select
                          value={member.yakumkrisStatus}
                          onChange={(e) => handleMemberChange(index, "yakumkrisStatus", e)}
                        >
                          <option value="">Anggota YAKUMKRIS?</option>
                          <option value="Iya">Iya</option>
                          <option value="Tidak">Tidak</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary-regis" onClick={addMember}>
                  <i className="fas fa-plus"></i> Tambah Anggota
                </button>
                <button type="button" className="btn-primary-regis" onClick={nextStep}>
                  Review Data
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <div className="step-content-panel active">
              <div className="step-header">
                <h2>Review Data</h2>
                <p>Periksa kembali data yang telah dimasukkan</p>
              </div>

              <div className="review-section">
                <div className="review-card">
                  <h3>Data Keluarga</h3>
                  <div className="review-item">
                    <div className="review-field">
                      <label>Kepala Keluarga</label>
                      <span>{familyName}</span>
                    </div>
                    <div className="review-field">
                      <label>Tanggal Pernikahan</label>
                      <span>{formatDate(familyDate)}</span>
                    </div>
                    <div className="review-field">
                      <label>Email</label>
                      <span>{email}</span>
                    </div>
                  </div>
                </div>

                <div className="review-card">
                  <h3>Anggota Keluarga</h3>
                  <p style={{ marginBottom: "1rem", color: "#6b7280" }}>Total: {members.length} orang</p>
                  {members.map((member, index) => (
                    <div key={index} className="member-review">
                      <h4>{member.fullName || `Anggota ${index + 1}`}</h4>
                      <div className="member-details">
                        <span>{member.gender}</span>
                        <span>{member.familyStatus}</span>
                        <span>{member.phoneNumber}</span>
                        <span>{member.maritalStatus}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary-regis" onClick={prevStep}>
                  Kembali Edit
                </button>
                <button type="button" className="btn-primary-regis" onClick={nextStep}>
                  Konfirmasi
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {currentStep === 4 && (
            <div className="step-content-panel active">
              <div className="step-header text-center">
                <h2>Konfirmasi Pendaftaran</h2>
                <p>Pastikan semua data sudah benar sebelum mendaftar</p>
              </div>

              <div className="confirmation-card">
                <div className="confirmation-icon">
                  <i className="fas fa-check-square"></i>
                </div>
                <h3>Data Siap Didaftarkan</h3>
                <p>
                  Setelah dikonfirmasi, data akan disimpan dan tidak dapat diubah. Password akses akan dikirim ke email
                  yang telah didaftarkan.
                </p>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary-regis" onClick={prevStep}>
                  Kembali Review
                </button>
                <button type="button" className="btn-primary-regis" onClick={handleAllSubmit} disabled={isLoading}>
                  <span className="btn-text">{isLoading ? "Mendaftar..." : "Daftar Sekarang"}</span>
                  {isLoading && (
                    <div className="btn-loader">
                      <i className="fas fa-spinner fa-spin"></i>
                    </div>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Success */}
          {currentStep === 5 && (
            <div className="step-content-panel active">
              <div className="step-header text-center">
                <div className="success-icon">
                  <i className="fas fa-check-circle"></i>
                </div>
                <h2>Pendaftaran Berhasil!</h2>
                <p>Data keluarga dan anggota telah berhasil didaftarkan. Password akses telah dikirim ke email Anda.</p>
              </div>

              <div className="success-card">
                <h3>Langkah Selanjutnya</h3>
                <ul>
                  <li>• Cek email untuk mendapatkan password akses</li>
                  <li>• Login ke sistem untuk melengkapi data</li>
                  <li>• Hubungi admin jika ada pertanyaan</li>
                </ul>
              </div>

              <button type="button" className="btn-primary-regis" onClick={resetForm}>
                Daftar Keluarga Baru
              </button>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}
        </div>
      </div>
    </div>
    </div>
  )
}

export default RegistrationForm
