"use client"

import { useState } from "react"
import { useNavigate, Navigate } from "react-router-dom"
import "./AdminPage.css"

import ViewFamily from "./admin/viewFamily"
import ViewMember from "./admin/viewMember"
import UploadCSV from "./admin/csvUpload"
import AdminMembers from "./admin/AdminMembers"
import ManageGroups from "./admin/ManageGroups"
import AdminAttendance from "./admin/AdminAttendance"
import AdminDevotions from "./admin/AdminDevotions"
import SermonCMS from "./admin/SermonCMS"
import EventsAdmin from "./admin/EventsAdmin"
import GalleryAdmin from "./admin/GalleryAdmin"

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("viewFamily")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const handleLogout = () => {
    localStorage.removeItem("adminToken")
    localStorage.removeItem("isAdmin")
    navigate("/")
  }

  const isAdmin = localStorage.getItem('isAdmin') === 'true'
  if (!isAdmin) return <Navigate to="/admin-login" />

  const renderContent = () => {
    switch (activeTab) {
      case "viewFamily": return <ViewFamily />
      case "viewMember": return <ViewMember />
      case "uploadCSV": return <UploadCSV />
      case "adminAttendance": return <AdminAttendance />
      case "adminMembers": return <AdminMembers />
      case "adminKonten" : return <SermonCMS />
      case "eventsAdmin" : return <EventsAdmin/>
      case "adminDevotions": return <AdminDevotions />
      case "manageGroups": return <ManageGroups />
      case "galleryAdmin" : return <GalleryAdmin/>
      default: return <div>Select a tab</div>
    }
  }

  const menuItems = [
    ["viewFamily", "Admin Keluarga"],
    ["viewMember", "Admin Jemaat"],
    ["uploadCSV", "Unggah CSV"],
    ["adminMembers", "Semua Jemaat"],
    ["galleryAdmin","Upload Foto"],
    ["adminDevotions", "Konten Renungan"],
    ["adminAttendance", "Kehadiran Jemaat"],
    ["adminKonten","Atur Ibadah"],
    ["eventsAdmin","Atur Acara"],
    ["manageGroups", "Admin Komunitas"],
  ]

  return (
    <div className="admin-layout">

      {/* Sidebar overlay for mobile */}
      <div className={`admin-sidebar-overlay ${sidebarOpen ? "open" : ""}`} onClick={() => setSidebarOpen(false)}>
        <div className="admin-sidebar" onClick={(e) => e.stopPropagation()}>
          <button className="close-btn" onClick={() => setSidebarOpen(false)}>✖</button>

          <div className="sidebar-logo">
            <div className="logo-icon">A</div>
            <span className="logo-text">ADMIN</span>
          </div>

          <nav className="sidebar-nav">
            <div className="nav-section">
              <div className="nav-header">MENU ADMIN</div>
              <div className="nav-items">
                {menuItems.map(([tab, label]) => (
                  <button
                    key={tab}
                    className={`nav-item ${activeTab === tab ? "active" : ""}`}
                    onClick={() => {
                      setActiveTab(tab)
                      setSidebarOpen(false)
                    }}
                  >
                    <div className="nav-bullet"></div>
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </nav>

          <div className="sidebar-bottom">
            <div className="bottom-header">SISTEM ADMIN</div>
            <p className="bottom-description">Panel administrasi untuk mengelola data jemaat dan keluarga</p>
            <button className="logout-btn" onClick={handleLogout}>KELUAR</button>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="admin-sidebar-desktop">
        <div className="sidebar-logo">
          <div className="logo-icon">A</div>
          <span className="logo-text">ADMIN</span>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-header">MENU ADMIN</div>
            <div className="nav-items">
              {menuItems.map(([tab, label]) => (
                <button
                  key={tab}
                  className={`nav-item ${activeTab === tab ? "active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  <div className="nav-bullet"></div>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>

        <div className="sidebar-bottom">
          <div className="bottom-header">SISTEM ADMIN</div>
                    <button className="logout-btn" onClick={handleLogout}>KELUAR</button>
          <p className="bottom-description">Panel administrasi untuk mengelola data jemaat dan keluarga</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-content">
        <button className="toggle-button" onClick={() => setSidebarOpen(true)}>📋 Open Menu</button>
        <div className="admin-main">{renderContent()}</div>
      </div>
    </div>
  )
}

export default AdminPage
