"use client"

import { useEffect, useState } from "react"
import api from "./api/API"
import "./AdminMembers.css"
import Swal from "sweetalert2"

function AdminMembers() {
  const [members, setMembers] = useState([])
  const [filteredMembers, setFilteredMembers] = useState([])
  const [sortField, setSortField] = useState("")
  const [sortOrder, setSortOrder] = useState("asc")
  const [filterMonth, setFilterMonth] = useState("")
  const [filterGender, setFilterGender] = useState("")
  const [filterBlood, setFilterBlood] = useState("")
  const [filterBpjs, setFilterBpjs] = useState("")
  const [filterYakumkris, setFilterYakumkris] = useState("")
  const [filterCongregationStatus, setFilterCongregationStatus] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [updatedMember, setUpdatedMember] = useState({})
  const [editingMember, setEditingMember] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [filterHasGroup, setFilterHasGroup] = useState(false)
  const itemsPerPage = 100
  const [searchTerm, setSearchTerm] = useState("")

  // Loading states
  const [isLoading, setIsLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(null)
  const [tableAnimating, setTableAnimating] = useState(false)

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    setIsLoading(true)
    try {
      const response = await api.get("/api/members")
      console.log(response.data)

      // Simulate minimum loading time for better UX
      await new Promise((resolve) => setTimeout(resolve, 800))

      setMembers(response.data)
      setFilteredMembers(response.data)
      setTableAnimating(true)

      // Reset animation state after animation completes
      setTimeout(() => setTableAnimating(false), 600)
    } catch (error) {
      console.log(error)
      console.error("Failed to fetch members:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setFilteredMembers(members)
      return
    }

    setIsSearching(true)
    setTableAnimating(true)

    try {
      // Add minimum search time for smooth UX
      await new Promise((resolve) => setTimeout(resolve, 300))

      const response = await api.get(`/api/members/search/${searchTerm}`)
      setFilteredMembers(response.data)

      // Reset animation state
      setTimeout(() => setTableAnimating(false), 400)
    } catch (error) {
      console.error("Failed to search members:", error)
      Swal.fire("Gagal", "Gagal mencari jemaat.", "error")
    } finally {
      setIsSearching(false)
    }
  }

  const formatDate = (isoDate) => {
    const date = new Date(isoDate)
    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === "a") {
        e.preventDefault()
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  const handleDelete = async (memberId) => {
    const result = await Swal.fire({
      title: "Yakin hapus jemaat ini?",
      text: "Data ini akan dihapus secara permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    })

    if (result.isConfirmed) {
      setIsDeleting(memberId)
      try {
        await api.delete(`/api/members/${memberId}`)
        await fetchMembers()
        Swal.fire("Terhapus!", "Data jemaat berhasil dihapus.", "success")
      } catch (error) {
        console.error("Failed to delete member:", error)
        Swal.fire("Gagal", "Gagal menghapus data jemaat.", "error")
      } finally {
        setIsDeleting(null)
      }
    }
  }

  const handleSort = (field) => {
    const isAsc = sortField === field && sortOrder === "asc"
    const direction = isAsc ? "desc" : "asc"

    setTableAnimating(true)

    const sorted = [...filteredMembers].sort((a, b) => {
      const aValue = a[field] || ""
      const bValue = b[field] || ""

      if (field === "dateOfBirth") {
        const aDate = new Date(aValue)
        const bDate = new Date(bValue)
        return direction === "asc" ? aDate - bDate : bDate - aDate
      }

      const comparison = aValue.localeCompare(bValue)
      return direction === "asc" ? comparison : -comparison
    })

    setTimeout(() => {
      setFilteredMembers(sorted)
      setSortField(field)
      setSortOrder(direction)
      setTimeout(() => setTableAnimating(false), 300)
    }, 150)
  }

  useEffect(() => {
    let filtered = [...members]
    setTableAnimating(true)

    if (filterMonth) {
      filtered = filtered.filter((member) => {
        const monthOfBirth = new Date(member.dateOfBirth).getMonth() + 1
        return monthOfBirth === Number.parseInt(filterMonth)
      })
    }

    if (filterGender) {
      filtered = filtered.filter((member) => member.gender === filterGender)
    }

    if (filterBlood) {
      filtered = filtered.filter((member) => member.bloodType === filterBlood)
    }

    if (filterBpjs) {
      filtered = filtered.filter((member) => member.bpjsStatus === filterBpjs)
    }

    if (filterYakumkris) {
      filtered = filtered.filter((member) => member.yakumkrisStatus === filterYakumkris)
    }

    if (filterCongregationStatus) {
      filtered = filtered.filter((member) => member.congregationStatus === filterCongregationStatus)
    }

    if (filterHasGroup) {
      filtered = filtered.filter((member) => member.groups && member.groups.length > 0)
    }

    setTimeout(() => {
      setFilteredMembers(filtered)
      setTimeout(() => setTableAnimating(false), 300)
    }, 100)
  }, [
    filterMonth,
    filterGender,
    filterBlood,
    filterBpjs,
    filterYakumkris,
    filterHasGroup,
    filterCongregationStatus,
    members,
  ])

  const handleOpenEditModal = (member) => {
    setEditingMember(member._id)
    setUpdatedMember({ ...member })
    setShowModal(true)
  }

  const handleUpdate = async () => {
    setIsUpdating(true)
    try {
      await api.put(`/api/members/${editingMember}`, updatedMember)
      setShowModal(false)
      await fetchMembers()
      Swal.fire("Berhasil", "Data jemaat berhasil diperbarui.", "success")
    } catch (err) {
      Swal.fire("Gagal", "Gagal memperbarui data jemaat.", "error")
    } finally {
      setIsUpdating(false)
    }
  }

  const exportToCSV = async () => {
    setIsExporting(true)

    try {
      // Simulate export processing time
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const headers = [
        "Nama Lengkap",
        "Jenis Kelamin",
        "Tempat Lahir",
        "Tanggal Lahir",
        "Gol. Darah",
        "No. HP",
        "Alamat",
        "Hobi",
        "Status Pernikahan",
        "Status Jemaat",
        "Riwayat Pendidikan",
        "Pekerjaan",
        "Status Baptis",
        "BPJS",
        "Yakumkris",
      ]

      const rows = filteredMembers.map((member) => [
        member.fullName,
        member.gender,
        member.placeOfBirth,
        formatDate(member.dateOfBirth),
        member.bloodType,
        member.phoneNumber,
        member.address,
        member.hobby,
        member.maritalStatus,
        member.congregationStatus,
        member.eduHistory,
        member.jobNow,
        member.baptismStatus,
        member.bpjsStatus,
        member.yakumkrisStatus,
      ])

      const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map((e) => e.join(",")).join("\n")

      const encodedUri = encodeURI(csvContent)
      const link = document.createElement("a")
      link.setAttribute("href", encodedUri)
      link.setAttribute("download", "filtered_members.csv")
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      Swal.fire("Berhasil", "Data berhasil diekspor ke CSV.", "success")
    } catch (error) {
      Swal.fire("Gagal", "Gagal mengekspor data.", "error")
    } finally {
      setIsExporting(false)
    }
  }

  const downloadBirthdayICS = async () => {
    setIsExporting(true)
    try {
      const response = await api.get("/api/members/download-birthday-ics", { responseType: "blob" })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", "birthday-events.ics")
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      Swal.fire("Berhasil", "File kalender berhasil diunduh.", "success")
    } catch (error) {
      console.error("Failed to download ICS file:", error)
      Swal.fire("Gagal", "Gagal mengunduh file ulang tahun.", "error")
    } finally {
      setIsExporting(false)
    }
  }

  // Skeleton loader component
  const SkeletonRow = () => (
    <tr className="skeleton-row">
      {Array.from({ length: 18 }).map((_, index) => (
        <td key={index}>
          <div className="skeleton-cell"></div>
        </td>
      ))}
    </tr>
  )

  // Loading spinner component
  const LoadingSpinner = ({ size = "small" }) => (
    <div className={`loading-spinner ${size}`}>
      <div className="spinner"></div>
    </div>
  )

  return (
    <div className={isLoading ? "loading-container" : ""}>
      <div className="header-section">
        <h2 className="h2">
          Semua Jemaat
          {isLoading && <LoadingSpinner />}
        </h2>
        <p className={`member-count ${isLoading ? "loading-text" : ""}`}>
          {isLoading ? "Memuat data..." : `Total shown: ${filteredMembers.length}`}
        </p>
      </div>

      <div className="filter-container">
        <div className="filter-row">
          <label className="filter-text">Komunitas</label>
          <input
            type="checkbox"
            checked={filterHasGroup}
            onChange={(e) => setFilterHasGroup(e.target.checked)}
            disabled={isLoading}
          />
          <label className="filter-text">Bulan Lahir:</label>
          <select
            className="select"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            disabled={isLoading}
          >
            <option value="">Semua</option>
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>

          <label className="filter-text">L/P:</label>
          <select
            className="select"
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value)}
            disabled={isLoading}
          >
            <option value="">Semua</option>
            <option value="Laki-laki">Laki-laki</option>
            <option value="Perempuan">Perempuan</option>
          </select>

          <label className="filter-text">Gol. Darah:</label>
          <select
            className="select"
            value={filterBlood}
            onChange={(e) => setFilterBlood(e.target.value)}
            disabled={isLoading}
          >
            <option value="">Semua</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="AB">AB</option>
            <option value="O">O</option>
          </select>

          <label className="filter-text">BPJS:</label>
          <select
            className="select"
            value={filterBpjs}
            onChange={(e) => setFilterBpjs(e.target.value)}
            disabled={isLoading}
          >
            <option value="">Semua</option>
            <option value="Ada">Aktif</option>
            <option value="Tidak Ada">Tidak Aktif</option>
          </select>

          <label className="filter-text">Yakumkris:</label>
          <select
            className="select"
            value={filterYakumkris}
            onChange={(e) => setFilterYakumkris(e.target.value)}
            disabled={isLoading}
          >
            <option value="">Semua</option>
            <option value="Iya">Iya</option>
            <option value="Tidak">Tidak</option>
          </select>

          <label className="filter-text">Status Jemaat:</label>
          <select
            className="select"
            value={filterCongregationStatus}
            onChange={(e) => setFilterCongregationStatus(e.target.value)}
            disabled={isLoading}
          >
            <option value="">Semua</option>
            <option value="Jemaat">Jemaat</option>
            <option value="Simpatisan">Simpatisan</option>
            <option value="Tamu">Tamu</option>
          </select>
        </div>
      </div>

      <div className="filter-row-2">
        <input
          type="text"
          placeholder="Cari nama jemaat..."
          value={searchTerm}
          className="input-form-filter"
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={isLoading}
        />
        <button onClick={handleSearch} className="button-export" disabled={isLoading || isSearching}>
          {isSearching ? <LoadingSpinner /> : "Cari"}
        </button>
        <button onClick={exportToCSV} className="button-export" disabled={isLoading || isExporting}>
          {isExporting ? <LoadingSpinner /> : "Export to CSV"}
        </button>
        <button onClick={downloadBirthdayICS} className="button-export" disabled={isLoading || isExporting}>
          {isExporting ? <LoadingSpinner /> : "Export to ICS"}
        </button>
      </div>

      <div className={`container-body ${tableAnimating ? "table-animating" : ""}`}>
        <table>
          <thead>
            <tr>
              <th onClick={() => !isLoading && handleSort("fullName")}>
                Nama • {sortField === "fullName" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th onClick={() => !isLoading && handleSort("gender")}>
                L/P • {sortField === "gender" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th>Tempat.Lahir</th>
              <th onClick={() => !isLoading && handleSort("dateOfBirth")}>
                Tgl Lahir • {sortField === "dateOfBirth" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th>Komunitas</th>
              <th>Keluarga</th>
              <th>Gol.Darah</th>
              <th>No.HP</th>
              <th>Alamat</th>
              <th>Hobi</th>
              <th>Pernikahan</th>
              <th>Jemaat</th>
              <th>Pendidikan</th>
              <th>Pekerjaan</th>
              <th>Baptisan</th>
              <th>BPJS</th>
              <th>Yakumkris</th>
              <th>Opsi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? // Show skeleton rows while loading
                Array.from({ length: 10 }).map((_, index) => <SkeletonRow key={index} />)
              : filteredMembers
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map((member, index) => (
                    <tr
                      key={member._id}
                      className={`table-row ${tableAnimating ? "row-animating" : ""}`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td>{member.fullName}</td>
                      <td>{member.gender}</td>
                      <td>{member.placeOfBirth}</td>
                      <td>{formatDate(member.dateOfBirth)}</td>
                      <td>{member.groups?.map((group) => group.name).join(", ") || "—"}</td>
                      <td>{member.family?.familyName || "—"}</td>
                      <td>{member.bloodType}</td>
                      <td>{member.phoneNumber}</td>
                      <td>{member.address}</td>
                      <td>{member.hobby}</td>
                      <td>{member.maritalStatus}</td>
                      <td>{member.congregationStatus}</td>
                      <td>{member.eduHistory}</td>
                      <td>{member.jobNow}</td>
                      <td>{member.baptismStatus}</td>
                      <td>{member.bpjsStatus}</td>
                      <td>{member.yakumkrisStatus}</td>
                      <td>
                        <button
                          className="button-export"
                          onClick={() => handleOpenEditModal(member)}
                          disabled={isDeleting === member._id}
                        >
                          ✍️
                        </button>
                        <button
                          className="button-export"
                          onClick={() => handleDelete(member._id)}
                          disabled={isDeleting === member._id}
                        >
                          {isDeleting === member._id ? <LoadingSpinner /> : "🗑️"}
                        </button>
                      </td>
                    </tr>
                  ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1 || isLoading}
        >
          Previous
        </button>

        <span>
          {isLoading ? "Loading..." : `Page ${currentPage} of ${Math.ceil(filteredMembers.length / itemsPerPage)}`}
        </span>

        <button
          onClick={() => setCurrentPage((prev) => prev + 1)}
          disabled={currentPage >= Math.ceil(filteredMembers.length / itemsPerPage) || isLoading}
        >
          Next
        </button>
      </div>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Edit Member</h3>
            {[
              ["Nama Lengkap", "fullName"],
              ["L/P", "gender"],
              ["Tempat Lahir", "placeOfBirth"],
              ["Tanggal Lahir", "dateOfBirth", "date"],
              ["Golongan Darah", "bloodType"],
              ["Telepon", "phoneNumber"],
              ["Alamat", "address"],
              ["Hobi", "hobby"],
              ["Status Pernikahan", "maritalStatus"],
              ["Status Jemaat", "congregationStatus"],
              ["Status Keluarga", "familyStatus"],
              ["Pendidikan Terakhir", "eduHistory"],
              ["Pekerjaan", "jobNow"],
              ["Status Baptis", "baptismStatus"],
              ["BPJS", "bpjsStatus"],
              ["Yakumkris", "yakumkrisStatus"],
            ].map(([label, field, type = "text"]) => (
              <div key={field}>
                <p className="modal-input">{label}</p>
                <input
                  type={type}
                  className="input-form"
                  value={
                    type === "date" && updatedMember[field]
                      ? updatedMember[field].substring(0, 10)
                      : updatedMember[field] || ""
                  }
                  onChange={(e) => setUpdatedMember({ ...updatedMember, [field]: e.target.value })}
                  placeholder={label}
                  disabled={isUpdating}
                />
              </div>
            ))}
            <button className="button-save" onClick={handleUpdate} disabled={isUpdating}>
              {isUpdating ? <LoadingSpinner /> : "Save"}
            </button>
            <button className="button-save" onClick={() => setShowModal(false)} disabled={isUpdating}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminMembers
