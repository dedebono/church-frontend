"use client"

import { useState, useEffect } from "react"
import { useNavigate, Navigate } from "react-router-dom"
import "./AdminPage.css"

import ViewFamily from "./admin/viewFamily"
import Dashboard from "./admin/Dashboard"
import ViewMember from "./admin/viewMember"
import UploadCSV from "./admin/csvUpload"
import AdminMembers from "./admin/AdminMembers"
import ManageGroups from "./admin/ManageGroups"
import AdminAttendances from "./admin/AdminAttendance"
import AdminDevotions from "./admin/AdminDevotions"
import SermonCMS from "./admin/SermonCMS"
import EventsAdmin from "./admin/EventsAdmin"
import GalleryAdmin from "./admin/GalleryAdmin"
import ServiceRequest from "./admin/serviceRequest"
import ManageCertificates from "./admin/ManageCertificates"
import BroadcastMessagesAdmin from "./admin/BroadcastAdmin"
import MessageAdmin from "./admin/AdminMessages"
import AdminBirthdayReminder from "../components/AdminBirthdayReminder"

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [openGroups, setOpenGroups] = useState({ // New state for managing open groups
    "Admin Jemaat": false, // You can set initial open/closed state here
    "Komunitas": false,
    "Sekretariat": false,
  });
  const [showBirthdayReminder, setShowBirthdayReminder] = useState(false)
  const navigate = useNavigate()

  // Check if birthday reminder should be shown on component mount
  useEffect(() => {
    const today = new Date().toDateString()
    const lastSeen = localStorage.getItem('birthdayReminderSeen')
    
    // Show reminder if not seen today
    if (lastSeen !== today) {
      // Small delay to let the admin page load first
      const timer = setTimeout(() => {
        setShowBirthdayReminder(true)
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [])
  const handleLogout = () => {
    localStorage.removeItem("adminToken")
    localStorage.removeItem("isAdmin")
    navigate("/")
  }

  const isAdmin = localStorage.getItem('isAdmin') === 'true'
  if (!isAdmin) return <Navigate to="/login" />

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard" : return <Dashboard/>
      case "viewFamily": return <ViewFamily />
      case "viewMember": return <ViewMember />
      case "uploadCSV": return <UploadCSV />
      case "adminAttendance": return <AdminAttendances />
      case "adminMembers": return <AdminMembers />
      case "adminKonten" : return <SermonCMS />
      case "eventsAdmin" : return <EventsAdmin/>
      case "adminDevotions": return <AdminDevotions />
      case "manageGroups": return <ManageGroups />
      case "galleryAdmin" : return <GalleryAdmin/>
      case "serviceRequest" : return <ServiceRequest/>
      case "ManageCertificates" : return <ManageCertificates/>
      case "broadcastMessagesAdmin" : return <BroadcastMessagesAdmin/>
      case "adminMessages": return <MessageAdmin/>
      default: return <div>Select a tab</div>
    }
  }

  const menuGroups = [
    {
      header: "Admin Jemaat",
      items: [
        ["viewFamily", "Admin Keluarga"],
        ["viewMember", "Admin Jemaat"],
        ["uploadCSV", "Unggah CSV"],
        ["adminMembers", "Semua Jemaat"],
      ],
    },
    {
      header: "Komunitas",
      items: [
        ["manageGroups", "Admin Komunitas"],
        ["adminMessages","Pesan Komunitas"],
        ["broadcastMessagesAdmin","Broadcast Komunitas"]
      ],
    },
    {
      header: "Sekretariat",
      items: [
        ["adminKonten", "Atur Ibadah"],
        ["eventsAdmin", "Atur Acara"],
        ["adminAttendance", "Kehadiran Jemaat"],
        ["adminDevotions", "Konten Renungan"],
        ["galleryAdmin", "Upload Foto"],
        ["serviceRequest","Permintaan Pelayanan"],
        ["ManageCertificates","Sertifikat"]
      ],
    },
  ]

  const toggleGroup = (groupHeader) => { // New function to toggle group visibility
    setOpenGroups(prev => ({
      ...prev,
      [groupHeader]: !prev[groupHeader]
    }));
  };

  const handleCloseBirthdayReminder = () => {
    setShowBirthdayReminder(false)
  }

  const handleShowBirthdayReminder = () => {
    setShowBirthdayReminder(true)
  }

  return (
    <div className="admin-layout">
      {/* Birthday Reminder Popup */}
      <AdminBirthdayReminder 
        isVisible={showBirthdayReminder}
        onClose={handleCloseBirthdayReminder}
      />

      {/* Sidebar overlay for mobile */}
      <div className={`admin-sidebar-overlay ${sidebarOpen ? "open" : ""}`} onClick={() => setSidebarOpen(false)}>
        <div className="admin-sidebar" onClick={(e) => e.stopPropagation()}>
          <button className="close-btn" onClick={() => setSidebarOpen(false)}>✖</button>

          <div className="sidebar-logo">
            <div className="logo-icon">A</div>
            <span className="logo-text">ADMIN</span>
          </div>

          <nav className="sidebar-nav">
            {menuGroups.map((group, groupIndex) => (
              <div className="nav-section" key={groupIndex}>
                <button className="nav-header-button" onClick={() => toggleGroup(group.header)}> {/* Clickable header */}
                  <div className="nav-header">{group.header}</div>
                  <span className="toggle-icon">{openGroups[group.header] ? "▲" : "▼"}</span> {/* Toggle icon */}
                </button>
                {openGroups[group.header] && ( // Conditionally render items based on openGroups state
                  <div className="nav-items">
                    {group.items.map(([tab, label]) => (
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
                )}
              </div>
            ))}
          </nav>

          <div className="sidebar-bottom">
            <div className="极bottom-header">SISTEM ADMIN</div>
            <p className="bottom-description">Panel administrasi untuk mengelola data jemaat dan keluarga</p>
            <button className="logout-btn" onClick={handleLogout}>KELUAR</button>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="admin-sidebar-desktop">
        <div className="sidebar-logo">
          <div className="logo-icon">⛪</div>
          <span className="logo-text">ADMIN</span>
        </div>

        <nav className="sidebar-nav">
          {menuGroups.map((group, groupIndex) => (
            <div className="nav-section" key={groupIndex}>
              <button className="nav-header-button" onClick={() => toggleGroup(group.header)}> {/* Clickable header */}
                <div className="nav-header">{group.header}</div>
                <span className="toggle-icon">{openGroups[group.header] ? "▲" : "▼"}</span> {/* Toggle icon */}
              </button>
              {openGroups[group.header] && ( // Conditionally render items based on openGroups state
                <div className="nav-items">
                  {group.items.map(([tab, label]) => (
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
              )}
            </div>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="bottom-header">SISTEM ADMIN</div>
          <button className="birthday-reminder-btn" onClick={handleShowBirthdayReminder}>
            🎂 Ulang Tahun
          </button>
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
