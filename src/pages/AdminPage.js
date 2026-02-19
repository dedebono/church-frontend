"use client"

import { useState, useEffect } from "react"
import { useNavigate, Navigate } from "react-router-dom"
import "./AdminPage.css"
import {
  Church,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  LogOut,
  Cake,
  LayoutDashboard,
  Users,
  UserPlus,
  Upload,
  ClipboardList,
  MessageSquare,
  Image as ImageIcon,
  Calendar,
  FileText,
  Award,
  Radio,
  Mail,
  Mic2
} from "lucide-react";

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
  const [openGroups, setOpenGroups] = useState({
    "Admin Jemaat": true,
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
      case "dashboard": return <Dashboard />
      case "viewFamily": return <ViewFamily />
      case "viewMember": return <ViewMember />
      case "uploadCSV": return <UploadCSV />
      case "adminAttendance": return <AdminAttendances />
      case "adminMembers": return <AdminMembers />
      case "adminKonten": return <SermonCMS />
      case "eventsAdmin": return <EventsAdmin />
      case "adminDevotions": return <AdminDevotions />
      case "manageGroups": return <ManageGroups />
      case "galleryAdmin": return <GalleryAdmin />
      case "serviceRequest": return <ServiceRequest />
      case "ManageCertificates": return <ManageCertificates />
      case "broadcastMessagesAdmin": return <BroadcastMessagesAdmin />
      case "adminMessages": return <MessageAdmin />
      default: return <div>Select a tab</div>
    }
  }

  const menuGroups = [
    {
      header: "Admin Jemaat",
      items: [
        ["dashboard", "Dashboard", <LayoutDashboard size={18} />],
        ["viewFamily", "Admin Keluarga", <Users size={18} />],
        ["viewMember", "Admin Jemaat", <Users size={18} />],
        ["uploadCSV", "Unggah CSV", <Upload size={18} />],
        ["adminMembers", "Semua Jemaat", <ClipboardList size={18} />],
      ],
    },
    {
      header: "Komunitas",
      items: [
        ["manageGroups", "Admin Komunitas", <Users size={18} />],
        ["adminMessages", "Pesan Komunitas", <MessageSquare size={18} />],
        ["broadcastMessagesAdmin", "Broadcast Komunitas", <Radio size={18} />]
      ],
    },
    {
      header: "Sekretariat",
      items: [
        ["adminKonten", "Atur Ibadah", <Mic2 size={18} />],
        ["eventsAdmin", "Atur Acara", <Calendar size={18} />],
        ["adminAttendance", "Kehadiran Jemaat", <ClipboardList size={18} />],
        ["adminDevotions", "Konten Renungan", <FileText size={18} />],
        ["galleryAdmin", "Upload Foto", <ImageIcon size={18} />],
        ["serviceRequest", "Permintaan Pelayanan", <Mail size={18} />],
        ["ManageCertificates", "Sertifikat", <Award size={18} />]
      ],
    },
  ]

  const toggleGroup = (groupHeader) => {
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
          <button className="close-btn" onClick={() => setSidebarOpen(false)}><X size={20} /></button>

          <div className="sidebar-logo">
            <div className="logo-icon"><Church size={20} /></div>
            <span className="logo-text">ADMIN</span>
          </div>

          <nav className="sidebar-nav">
            {menuGroups.map((group, groupIndex) => (
              <div className="nav-section" key={groupIndex}>
                <button className="nav-header-button" onClick={() => toggleGroup(group.header)}>
                  <div className="nav-header">{group.header}</div>
                  <span className="toggle-icon">
                    {openGroups[group.header] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </span>
                </button>
                {openGroups[group.header] && (
                  <div className="nav-items">
                    {group.items.map(([tab, label, icon]) => (
                      <button
                        key={tab}
                        className={`nav-item ${activeTab === tab ? "active" : ""}`}
                        onClick={() => {
                          setActiveTab(tab)
                          setSidebarOpen(false)
                        }}
                      >
                        {icon}
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
              <Cake size={16} /> Ulang Tahun
            </button>
            <button className="logout-btn" onClick={handleLogout}><LogOut size={16} /> KELUAR</button>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="admin-sidebar-desktop">
        <div className="sidebar-logo">
          <div className="logo-icon"><Church size={20} /></div>
          <span className="logo-text">ADMIN</span>
        </div>

        <nav className="sidebar-nav">
          {menuGroups.map((group, groupIndex) => (
            <div className="nav-section" key={groupIndex}>
              <button className="nav-header-button" onClick={() => toggleGroup(group.header)}>
                <div className="nav-header">{group.header}</div>
                <span className="toggle-icon">
                  {openGroups[group.header] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </span>
              </button>
              {openGroups[group.header] && (
                <div className="nav-items">
                  {group.items.map(([tab, label, icon]) => (
                    <button
                      key={tab}
                      className={`nav-item ${activeTab === tab ? "active" : ""}`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {icon}
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
            <Cake size={16} /> Ulang Tahun
          </button>
          <button className="logout-btn" onClick={handleLogout}><LogOut size={16} /> KELUAR</button>
          <p className="bottom-description">Panel administrasi untuk mengelola data jemaat dan keluarga</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-content">
        <button className="toggle-button" onClick={() => setSidebarOpen(true)}>
          <Menu size={20} /> Open Menu
        </button>
        <div className="admin-main">{renderContent()}</div>
      </div>
    </div>
  )
}

export default AdminPage
