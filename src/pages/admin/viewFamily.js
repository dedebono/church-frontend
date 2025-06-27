"use client"

import { useEffect, useState } from "react"
import Swal from "sweetalert2"
import api, { getFamilies } from "./api/API"
import "./viewFamily.css"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { storage } from "./firebase" // your Firebase config

function ViewFamily() {
  const [showModal, setShowModal] = useState(false)
  const [showFamilyList, setShowFamilyList] = useState(false) // Toggle state for family list
  const [newMember, setNewMember] = useState({
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
  })
  const [familyName, setFamilyName] = useState("")
  const [editFamilyModal, setEditFamilyModal] = useState(false)
  const [familyData, setFamilyData] = useState(null)
  const [error, setError] = useState("")
  const [editingMember, setEditingMember] = useState(null)
  const [families, setFamilies] = useState([])
  const [formData, setFormData] = useState({})
  const [results, setResults] = useState([])
  const [isSearched, setIsSearched] = useState(false) // Track if search was performed
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploadingFor, setUploadingFor] = useState(null) // to track which member is being uploaded for

  useEffect(() => {
    const fetchFamilies = async () => {
      try {
        const data = await getFamilies()
        // Filter out families with empty names
        const validFamilies = data.filter((family) => family.familyName && family.familyName.trim() !== "")
        setFamilies(validFamilies)
      } catch (err) {
        console.error("Failed to fetch families:", err)
      }
    }
    fetchFamilies()
  }, [])

  const [editedFamily, setEditedFamily] = useState({
    familyName: "",
    familyDate: "",
    email: "",
  })

  const handleEdit = (member) => {
    setEditingMember(member._id)
    setFormData({ ...member })
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleCreateAccount = async (memberId, email) => {
    if (!email) {
      Swal.fire({
        icon: "error",
        title: "No Email Found",
        text: "This member does not have an email address registered. Please add an email first.",
      })
      return
    }

    const confirm = await Swal.fire({
      title: "Create Account?",
      html: `This will generate a new password and send it to <strong>${email}</strong>. Are you sure?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, create it!",
      cancelButtonText: "Cancel",
    })

    if (confirm.isConfirmed) {
      try {
        // Use the full URL for the API call as requested
        await api.post("https://backend.dedebono.uk/api/members/request-password", { memberId, email })
        Swal.fire({
          icon: "success",
          title: "Account Created!",
          text: `A new password has been sent to ${email}.`,
        })
      } catch (err) {
        console.error("Error creating account:", err)
        const errorMessage = err.response?.data?.message || "Server error while creating account."
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: errorMessage,
        })
      }
    }
  }

  const handleDelete = async (memberId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/api/members/${memberId}`)
          setResults(results.filter((member) => member._id !== memberId))
          // Refresh family data after deletion
          await handleSearch()
          Swal.fire("Deleted!", "The member has been deleted.", "success")
        } catch (err) {
          Swal.fire("Failed!", "Failed to delete member.", "error")
        }
      }
    })
  }

  const handlePhotoUpload = async (memberId) => {
    if (!selectedFile) {
      Swal.fire({
        icon: "warning",
        title: "No File Selected",
        text: "Please select a file first.",
      })
      return
    }
    try {
      setUploadingFor(memberId)

      const fileName = `profile_photos/${memberId}_${selectedFile.name}`
      const fileRef = ref(storage, fileName)
      await uploadBytes(fileRef, selectedFile)
      const downloadURL = await getDownloadURL(fileRef)

      await api.put(`/api/members/${memberId}/photo`, { photoUrl: downloadURL })

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Photo uploaded successfully!",
      })
      setSelectedFile(null)
      setUploadingFor(null)

      // Refresh the family data to show updated photo
      await handleSearch()
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text: "An error occurred while uploading the photo.",
      })
      console.error(error)
      setUploadingFor(null)
    }
  }

  const handleUpdate = async () => {
    const confirm = await Swal.fire({
      title: "Simpan Perubahan?",
      text: "Apakah Anda yakin ingin menyimpan perubahan ini?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, simpan",
      cancelButtonText: "Batal",
    })

    if (confirm.isConfirmed) {
      try {
        await api.put(`/api/members/${editingMember}`, formData)
        await handleSearch()
        setEditingMember(null)

        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Member updated successfully",
          timer: 2000,
          showConfirmButton: false,
        })
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: "Failed to update member",
        })
      }
    }
  }

  const formatDate = (isoDate) => {
    if (!isoDate) return ""
    const date = new Date(isoDate)
    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  const handleSearch = async () => {
    setIsSearched(true) // Mark that search was performed
    try {
      const cleanName = familyName.trim()
      const response = await api.get(`api/families/${cleanName}`)
      setFamilyData(response.data)
      setError("")
      setEditedFamily({
        familyName: response.data.familyName || "",
        familyDate: response.data.familyDate?.substring(0, 10) || "",
        email: response.data.email || "",
      })
    } catch (err) {
      setFamilyData(null)
      Swal.fire({
        icon: "error",
        title: "Keluarga tidak ditemukan",
        text: "Silakan coba nama kepala keluarga lain.",
      })
    }
  }

  const handleEditFamily = async (e) => {
    e.preventDefault()
    try {
      await api.put(`/api/families/id/${familyData._id}`, {
        familyName: editedFamily.familyName,
        familyDate: editedFamily.familyDate,
        email: editedFamily.email,
      })
      setEditFamilyModal(false)
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Data keluarga berhasil diperbarui.",
      })
      handleSearch()
    } catch (err) {
      console.error("Gagal update keluarga:", err)
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Terjadi kesalahan saat memperbarui data keluarga.",
      })
    }
  }

  const handleAddMember = async (e) => {
    e.preventDefault()
    try {
      await api.post("/api/members", [
        {
          ...newMember,
          familyId: familyData._id,
        },
      ])
      setShowModal(false)
      setNewMember({
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
      })
      Swal.fire({
        icon: "success",
        title: "Anggota Ditambahkan!",
        text: "Anggota baru berhasil ditambahkan ke keluarga.",
      })
      handleSearch()
    } catch (err) {
      console.error("Gagal tambah anggota:", err)
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Tidak dapat menambahkan anggota baru.",
      })
    }
  }

  const confirmCancelModal = (closeFunc) => {
    Swal.fire({
      title: "Yakin ingin membatalkan?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, batalkan",
      cancelButtonText: "Tidak",
    }).then((result) => {
      if (result.isConfirmed) {
        closeFunc(false)
      }
    })
  }

  // Filter valid members with essential data
  const getValidMembers = (members) => {
    if (!Array.isArray(members)) return []
    return members.filter((member) => member && member.fullName && member.fullName.trim() !== "" && member._id)
  }

  // Check if field has meaningful content
  const hasContent = (value) => {
    return value && value.toString().trim() !== "" && value !== "undefined" && value !== "null"
  }

  // Toggle family list visibility
  const toggleFamilyList = () => {
    setShowFamilyList(!showFamilyList)
  }

  return (
    <div>
      <h2 className="h2">Admin Keluarga</h2>

      <div className="search-container">
        <input
          type="text"
          className="search-input"
          value={familyName}
          onChange={(e) => setFamilyName(e.target.value)}
          placeholder="Masukkan nama kepala keluarga"
        />
        <button className="search-button" onClick={handleSearch}>
          Cari
        </button>

        {/* Toggle button for family list */}
        {families.length > 0 && (
          <button className="toggle-family-list-button" onClick={toggleFamilyList}>
            {showFamilyList ? "🙈 Sembunyikan Semua" : "👁️ Tampilkan Semua"}
          </button>
        )}
      </div>

      {/* Conditionally show family list based on toggle state */}
      {families.length > 0 && showFamilyList && (
        <div className="container-member-families">
          <div className="family-list-header">
            <strong>Daftar Keluarga ({families.length} keluarga):</strong>
            <button className="collapse-button" onClick={toggleFamilyList}>
              ✕
            </button>
          </div>
          <ul className="members-list-families">
            {families.map((family, index) => (
              <li
                key={family._id}
                className={index % 2 === 1 ? "bold-family" : ""}
                onClick={() => setFamilyName(family.familyName)}
                title="Klik untuk mencari keluarga ini"
              >
                {family.familyName}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Only show family data if search was performed and family exists */}
      {isSearched && familyData && (
        <div>
          <div className="divider"></div>

          {/* Family name - always show if exists */}
          {hasContent(familyData.familyName) && (
            <div className="nama-keluarga">👨‍👩‍👧‍👦 Nama Keluarga: {familyData.familyName}</div>
          )}

          <div className="divider"></div>

          {/* Marriage date - only show if exists */}
          {hasContent(familyData.familyDate) && (
            <div className="tanggal-pernikahan">👰 Tanggal Pernikahan: {formatDate(familyData.familyDate)}</div>
          )}

          {/* Email - only show if exists */}
          {hasContent(familyData.email) && <div className="tanggal-pernikahan">📧 Email: {familyData.email}</div>}
          
          <div className="divider"></div>

          <div className="button-group">
            <button className="add-member-button" onClick={() => setShowModal(true)}>
              Tambah Anggota
            </button>
            <button className="add-member-button" onClick={() => setEditFamilyModal(true)}>
              Edit Keluarga
            </button>
          </div>

          {/* Edit Family Modal */}
          {editFamilyModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>Edit Keluarga</h3>
                <form onSubmit={handleEditFamily} className="modal-form">
                  <input
                    type="text"
                    placeholder="Nama Keluarga"
                    value={editedFamily.familyName}
                    onChange={(e) => setEditedFamily({ ...editedFamily, familyName: e.target.value })}
                    required
                  />
                  <input
                    type="date"
                    value={editedFamily.familyDate}
                    onChange={(e) => setEditedFamily({ ...editedFamily, familyDate: e.target.value })}
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={editedFamily.email}
                    onChange={(e) => setEditedFamily({ ...editedFamily, email: e.target.value })}
                  />
                  <button className="modal-submit" type="submit">
                    Simpan
                  </button>
                  <button className="modal-submit" type="button" onClick={() => confirmCancelModal(setEditFamilyModal)}>
                    Batal
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Edit Member Modal */}
          {editingMember && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>Edit Member</h3>
                <p className="edit-member">Nama Lengkap:</p>
                <input
                  name="fullName"
                  value={formData.fullName || ""}
                  onChange={handleChange}
                  placeholder="Full Name"
                />
                <p className="edit-member">L/P:</p>
                <input name="gender" value={formData.gender || ""} onChange={handleChange} placeholder="Gender" />
                <p className="edit-member">Alamat:</p>
                <input name="address" value={formData.address || ""} onChange={handleChange} placeholder="Alamat" />
                <p className="edit-member">Telepon:</p>
                <input
                  name="phoneNumber"
                  value={formData.phoneNumber || ""}
                  onChange={handleChange}
                  placeholder="Telepon"
                />
                <p className="edit-member">Email:</p>
                <input
                  name="email"
                  value={formData.email || ""}
                  onChange={handleChange}
                  placeholder="Email"
                />
                <p className="edit-member">Pekerjaan:</p>
                <input name="jobNow" value={formData.jobNow || ""} onChange={handleChange} placeholder="Pekerjaan" />
                <p className="edit-member">Status Baptisan:</p>
                <input
                  name="baptismStatus"
                  value={formData.baptismStatus || ""}
                  onChange={handleChange}
                  placeholder="Baptisan"
                />
                <p className="edit-member">Keanggotaan Yakumkris:</p>
                <input
                  name="yakumkrisStatus"
                  value={formData.yakumkrisStatus || ""}
                  onChange={handleChange}
                  placeholder="Yakumkris"
                />
                <p className="edit-member">BPJS:</p>
                <input
                  name="bpjsStatus"
                  value={formData.bpjsStatus || ""}
                  onChange={handleChange}
                  placeholder="BPJS Status"
                />
                <div className="modal-actions">
                  <button onClick={handleUpdate}>Save</button>
                  <button onClick={() => setEditingMember(null)}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          {/* Members List - Only show if there are valid members */}
          {(() => {
            const validMembers = getValidMembers(familyData.members)
            return validMembers.length > 0 ? (
              <ul className="members-list">
                {validMembers.map((member, index) => (
                  <li className="member-card" key={member._id || index}>
                    {/*Photo profile*/}
                    {hasContent(member.profilePhoto) && (
                      <img src={member.profilePhoto} alt="Profile" className="profile-photo" />
                    )}
                    <strong>{member.fullName}</strong>

                    {/* Conditionally render each field only if it has content */}
                    {hasContent(member.gender) && (
                      <p className="member-detail">
                        <span className="member-detail-label">L/P: </span>
                        <span className="member-detail-value">{member.gender}</span>
                      </p>
                    )}

                    {(hasContent(member.placeOfBirth) || hasContent(member.dateOfBirth)) && (
                      <p className="member-detail">
                        <span className="member-detail-label">TTL: </span>
                        <span className="member-detail-value">
                          {hasContent(member.placeOfBirth) && hasContent(member.dateOfBirth)
                            ? `${member.placeOfBirth}, ${formatDate(member.dateOfBirth)}`
                            : hasContent(member.placeOfBirth)
                              ? member.placeOfBirth
                              : formatDate(member.dateOfBirth)}
                        </span>
                      </p>
                    )}

                    {hasContent(member.bloodType) && (
                      <p className="member-detail">
                        <span className="member-detail-label">Golongan Darah: </span>
                        <span className="member-detail-value">{member.bloodType}</span>
                      </p>
                    )}

                    {hasContent(member.familyStatus) && (
                      <p className="member-detail">
                        <span className="member-detail-label">Status Keluarga: </span>
                        <span className="member-detail-value">{member.familyStatus}</span>
                      </p>
                    )}

                    {hasContent(member.phoneNumber) && (
                      <p className="member-detail">
                        <span className="member-detail-label">Telepon: </span>
                        <span className="member-detail-value">{member.phoneNumber}</span>
                      </p>
                    )}

                    {hasContent(member.email) && (
                      <p className="member-detail">
                        <span className="member-detail-label">Email: </span>
                        <span className="member-detail-value">{member.email}</span>
                      </p>
                    )}

                    {hasContent(member.address) && (
                      <p className="member-detail">
                        <span className="member-detail-label">Alamat: </span>
                        <span className="member-detail-value">{member.address}</span>
                      </p>
                    )}

                    {hasContent(member.hobby) && (
                      <p className="member-detail">
                        <span className="member-detail-label">Hobi: </span>
                        <span className="member-detail-value">{member.hobby}</span>
                      </p>
                    )}

                    {hasContent(member.jobNow) && (
                      <p className="member-detail">
                        <span className="member-detail-label">Pekerjaan: </span>
                        <span className="member-detail-value">{member.jobNow}</span>
                      </p>
                    )}

                    {hasContent(member.baptismStatus) && (
                      <p className="member-detail">
                        <span className="member-detail-label">Baptisan: </span>
                        <span className="member-detail-value">{member.baptismStatus}</span>
                      </p>
                    )}

                    {hasContent(member.maritalStatus) && (
                      <p className="member-detail">
                        <span className="member-detail-label">Status Perkawinan: </span>
                        <span className="member-detail-value">{member.maritalStatus}</span>
                      </p>
                    )}

                    {hasContent(member.congregationStatus) && (
                      <p className="member-detail">
                        <span className="member-detail-label">Status Jemaat: </span>
                        <span className="member-detail-value">{member.congregationStatus}</span>
                      </p>
                    )}

                    {hasContent(member.bpjsStatus) && (
                      <p className="member-detail">
                        <span className="member-detail-label">BPJS: </span>
                        <span className="member-detail-value">{member.bpjsStatus}</span>
                      </p>
                    )}

                    {hasContent(member.yakumkrisStatus) && (
                      <p className="member-detail">
                        <span className="member-detail-label">Yakumkris: </span>
                        <span className="member-detail-value">{member.yakumkrisStatus}</span>
                      </p>
                    )}

                    <div className="member-divider"></div>
                    <button className="add-button" onClick={() => handleEdit(member)}>
                      Edit
                    </button>
                    <button className="add-button" onClick={() => handleDelete(member._id)}>
                      Delete
                    </button>
                    <button className="add-button" onClick={() => handleCreateAccount(member._id, member.email)}>
                      Password
                    </button>
                    <div className="upload-section">
                      <strong>Upload Photo</strong>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0]
                          if (!file) return

                          if (!file.type.startsWith("image/")) {
                            Swal.fire({
                              icon: "error",
                              title: "Invalid File Type",
                              text: "Only image files are allowed.",
                            })
                            e.target.value = ""
                            return
                          }

                          if (file.size > 1024 * 1024) {
                            // 1MB limit
                            Swal.fire({
                              icon: "error",
                              title: "File Too Large",
                              text: "File size must be under 1MB.",
                            })
                            e.target.value = ""
                            return
                          }

                          setSelectedFile(file)
                        }}
                      />
                      <button
                        onClick={() => handlePhotoUpload(member._id)}
                        disabled={uploadingFor === member._id}
                      >
                        {uploadingFor === member._id ? "Uploading..." : "Upload Photo"}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="no-members-message">
                <p>No members with complete information found in this family.</p>
              </div>
            )
          })()}
        </div>
      )}

      {/* Add Member Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Tambah Anggota ke {familyData?.familyName}</h3>
            <form className="modal-form" onSubmit={handleAddMember}>
              <input
                type="text"
                placeholder="Nama Lengkap"
                value={newMember.fullName}
                onChange={(e) => setNewMember({ ...newMember, fullName: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Tempat Lahir"
                value={newMember.placeOfBirth}
                onChange={(e) => setNewMember({ ...newMember, placeOfBirth: e.target.value })}
                required
              />
              <input
                type="date"
                value={newMember.dateOfBirth}
                onChange={(e) => setNewMember({ ...newMember, dateOfBirth: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Golongan Darah"
                value={newMember.bloodType}
                onChange={(e) => setNewMember({ ...newMember, bloodType: e.target.value })}
              />
              <input
                type="text"
                placeholder="Telepon"
                value={newMember.phoneNumber}
                onChange={(e) => setNewMember({ ...newMember, phoneNumber: e.target.value })}
              />
                <input
                type="text"
                placeholder="Email"
                value={newMember.email}
                onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
              />
              <input
                type="text"
                placeholder="Alamat"
                value={newMember.address}
                onChange={(e) => setNewMember({ ...newMember, address: e.target.value })}
              />
              <input
                type="text"
                placeholder="Hobi"
                value={newMember.hobby}
                onChange={(e) => setNewMember({ ...newMember, hobby: e.target.value })}
              />
              <input
                type="text"
                placeholder="Status Keluarga"
                value={newMember.familyStatus}
                onChange={(e) => setNewMember({ ...newMember, familyStatus: e.target.value })}
              />
              <select
                value={newMember.gender}
                onChange={(e) => setNewMember({ ...newMember, gender: e.target.value })}
                required
              >
                <option value="">Pilih Gender</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
              <select
                value={newMember.maritalStatus}
                onChange={(e) => setNewMember({ ...newMember, maritalStatus: e.target.value })}
              >
                <option value="">Status Perkawinan</option>
                <option value="Belum Menikah">Belum Menikah</option>
                <option value="Menikah">Menikah</option>
              </select>
              <input
                type="text"
                placeholder="Pendidikan Terakhir"
                value={newMember.eduHistory}
                onChange={(e) => setNewMember({ ...newMember, eduHistory: e.target.value })}
              />
              <input
                type="text"
                placeholder="Pekerjaan"
                value={newMember.jobNow}
                onChange={(e) => setNewMember({ ...newMember, jobNow: e.target.value })}
              />
              <input
                type="text"
                placeholder="Baptisan"
                value={newMember.baptismStatus}
                onChange={(e) => setNewMember({ ...newMember, baptismStatus: e.target.value })}
              />
              <select
                value={newMember.bpjsStatus}
                onChange={(e) => setNewMember({ ...newMember, bpjsStatus: e.target.value })}
              >
                <option value="">BPJS</option>
                <option value="Ada">Ada</option>
                <option value="Tidak ada">Tidak ada</option>
              </select>
              <select
                value={newMember.yakumkrisStatus}
                onChange={(e) => setNewMember({ ...newMember, yakumkrisStatus: e.target.value })}
              >
                <option value="">Anggota Yakumkris?</option>
                <option value="Ya">Ya</option>
                <option value="Tidak ada">Tidak ada</option>
              </select>
              <select
                value={newMember.congregationStatus}
                onChange={(e) => setNewMember({ ...newMember, congregationStatus: e.target.value })}
              >
                <option value="">Status Jemaat</option>
                <option value="Jemaat">Aktif</option>
                <option value="Simpatisan">Simpatisan</option>
                <option value="Tamu">Tamu</option>
              </select>
              <button className="modal-submit" type="submit">
                Simpan
              </button>
              <button className="modal-submit" type="button" onClick={() => confirmCancelModal(setShowModal)}>
                Batal
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ViewFamily
