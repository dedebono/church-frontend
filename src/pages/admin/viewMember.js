"use client"

// ViewMember.js - Improved version with conditional rendering
import { useState } from "react"
import Swal from "sweetalert2"
import api from "./api/API"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { storage } from "./firebase" // your Firebase config
import "./viewMember.css"

function ViewMember() {
  const [memberName, setMemberName] = useState("")
  const [results, setResults] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploadingFor, setUploadingFor] = useState(null) // to track which member is being uploaded
  const [error, setError] = useState("")
  const [isSearched, setIsSearched] = useState(false) // Track if search was performed
  const [editingMember, setEditingMember] = useState(null)
  const [formData, setFormData] = useState({})

  const formatDate = (isoDate) => {
    const date = new Date(isoDate)
    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
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
        await api.post("https://dedebono.uk/api/members/request-password", { memberId, email })
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

      // Refresh the member list to show updated photo
      handleSearch()
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

  const handleEdit = (member) => {
    setEditingMember(member._id)
    setFormData({ ...member })
  }

  const handleUpdate = async () => {
    const confirm = await Swal.fire({
      title: "Save Changes?",
      text: "Do you want to save the changes?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, save it!",
      cancelButtonText: "No, cancel!",
    })

    if (confirm.isConfirmed) {
      try {
        await api.put(`/api/members/${editingMember}`, formData)
        const updatedResults = results.map((member) =>
          member._id === editingMember ? { ...formData, _id: editingMember } : member,
        )
        setResults(updatedResults)
        setEditingMember(null)
        Swal.fire("Saved!", "Member has been updated.", "success")
      } catch (err) {
        Swal.fire("Failed!", "Failed to update member.", "error")
      }
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSearch = async () => {
    setIsSearched(true) // Mark that search was performed
    try {
      const response = await api.get(`/api/members/search/${memberName}`)
      setResults(response.data)
      setError("")
    } catch (err) {
      setError("No members found.")
      setResults([])
    }
  }

  // Filter out members with empty or null essential fields
  const filteredResults = results.filter((member) => {
    return member.fullName && member.fullName.trim() !== "" && member._id // Ensure member has an ID
  })

  return (
    <div>
      <h2 className="h2">Admin Jemaat</h2>

      <div className="search-container">
        <input
          type="text"
          className="search-input"
          value={memberName}
          onChange={(e) => setMemberName(e.target.value)}
          placeholder="Masukkan nama"
        />
        <button className="search-button" onClick={handleSearch}>
          Search
        </button>
      </div>

      {editingMember && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Edit Member</h3>
            <p className="edit-member">Nama Lengkap:</p>
            <input name="fullName" value={formData.fullName || ""} onChange={handleChange} placeholder="Full Name" />
            <p className="edit-member">L/P:</p>
            <input name="gender" value={formData.gender || ""} onChange={handleChange} placeholder="Gender" />
            <p className="edit-member">Alamat:</p>
            <input name="address" value={formData.address || ""} onChange={handleChange} placeholder="alamat" />
            <p className="edit-member">Telepon:</p>
            <input
              name="phoneNumber"
              value={formData.phoneNumber || ""}
              onChange={handleChange}
              placeholder="Telepon"
            />
            <p className="edit-member">Email:</p>
            <input name="email" value={formData.email || ""} onChange={handleChange} placeholder="Email" />
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
              placeholder="yakumkris"
            />
            <p className="edit-member">BPJS:</p>
            <input
              name="bpjsStatus"
              value={formData.bpjsStatus || ""}
              onChange={handleChange}
              placeholder="bpjsStatus"
            />
            <div className="modal-actions">
              <button onClick={handleUpdate}>Save</button>
              <button onClick={() => setEditingMember(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {error && <p className="error-message">{error}</p>}

      {/* Only show results section if we have valid members after search */}
      {isSearched && filteredResults.length > 0 && (
        <div>
          <ul className="members-list">
                {filteredResults.map((member, index) => (
              <li className="member-card" key={member._id || index}>
                 {member.profilePhoto && (
                  <img src={member.profilePhoto} alt="Profile" className="profile-photo" />
                )}
                <strong>{member.fullName}</strong>

                {/* Conditionally render each field only if it has content */}
                {member.family?.familyName && (
                  <p className="member-detail">
                    <span className="member-detail-label">Keluarga: </span>
                    <span className="member-detail-value">{member.family.familyName}</span>
                  </p>
                )}
                {member.groups && member.groups.length > 0 && (
                  <p className="member-detail">
                    <span className="member-detail-label">Grup: </span>
                    <span className="member-detail-value">{member.groups.map((g) => g.name).join(", ")}</span>
                  </p>
                )}

                {member.gender && (
                  <p className="member-detail">
                    <span className="member-detail-label">L/P: </span>
                    <span className="member-detail-value">{member.gender}</span>
                  </p>
                )}

                {(member.placeOfBirth || member.dateOfBirth) && (
                  <p className="member-detail">
                    <span className="member-detail-label">TTL: </span>
                    <span className="member-detail-value">
                      {member.placeOfBirth && member.dateOfBirth
                        ? `${member.placeOfBirth}, ${formatDate(member.dateOfBirth)}`
                        : member.placeOfBirth || formatDate(member.dateOfBirth)}
                    </span>
                  </p>
                )}

                {member.bloodType && (
                  <p className="member-detail">
                    <span className="member-detail-label">Golongan Darah: </span>
                    <span className="member-detail-value">{member.bloodType}</span>
                  </p>
                )}

                {member.familyStatus && (
                  <p className="member-detail">
                    <span className="member-detail-label">Status Keluarga: </span>
                    <span className="member-detail-value">{member.familyStatus}</span>
                  </p>
                )}

                {member.phoneNumber && (
                  <p className="member-detail">
                    <span className="member-detail-label">Telepon: </span>
                    <span className="member-detail-value">{member.phoneNumber}</span>
                  </p>
                )}
                
                {member.email && (
                  <p className="member-detail">
                    <span className="member-detail-label">Email: </span>
                    <span className="member-detail-value">{member.email}</span>
                  </p>
                )}

                {member.address && (
                  <p className="member-detail">
                    <span className="member-detail-label">Alamat: </span>
                    <span className="member-detail-value">{member.address}</span>
                  </p>
                )}

                {member.hobby && (
                  <p className="member-detail">
                    <span className="member-detail-label">Hobi: </span>
                    <span className="member-detail-value">{member.hobby}</span>
                  </p>
                )}

                {member.jobNow && (
                  <p className="member-detail">
                    <span className="member-detail-label">Pekerjaan: </span>
                    <span className="member-detail-value">{member.jobNow}</span>
                  </p>
                )}

                {member.baptismStatus && (
                  <p className="member-detail">
                    <span className="member-detail-label">Baptisan: </span>
                    <span className="member-detail-value">{member.baptismStatus}</span>
                  </p>
                )}

                {member.maritalStatus && (
                  <p className="member-detail">
                    <span className="member-detail-label">Status Perkawinan: </span>
                    <span className="member-detail-value">{member.maritalStatus}</span>
                  </p>
                )}

                {member.congregationStatus && (
                  <p className="member-detail">
                    <span className="member-detail-label">Status Jemaat: </span>
                    <span className="member-detail-value">{member.congregationStatus}</span>
                  </p>
                )}

                {member.bpjsStatus && (
                  <p className="member-detail">
                    <span className="member-detail-label">BPJS: </span>
                    <span className="member-detail-value">{member.bpjsStatus}</span>
                  </p>
                )}

                {member.yakumkrisStatus && (
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
                    const file = e.target.files[0];
                    if (!file) return;

                    if (!file.type.startsWith("image/")) {
                      Swal.fire({
                          icon: 'error',
                          title: 'Invalid File Type',
                          text: 'Only image files are allowed.',
                      });
                      e.target.value = "";
                      return;
                    }

                    if (file.size > 1024 * 1024) {
                       Swal.fire({
                          icon: 'error',
                          title: 'File Too Large',
                          text: 'File size must be under 1MB.',
                      });
                      e.target.value = "";
                      return;
                    }

                    setSelectedFile(file);
                  }}
                />
                <button 
                onClick={() => handlePhotoUpload(member._id)} disabled={uploadingFor === member._id}>
                  {uploadingFor === member._id ? "Uploading..." : "Upload Photo"}
                </button>
              </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Show message when search was performed but no valid results */}
      {isSearched && filteredResults.length === 0 && !error && (
        <div className="no-results-message">
          <p>No members found with complete information.</p>
        </div>
      )}
    </div>
  )
}

export default ViewMember
