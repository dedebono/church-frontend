"use client"

import React, { useEffect, useState, useCallback } from "react"
import Swal from "sweetalert2"
import api from "../admin/api/API"
import "./AdminMessages.css"
import {
  MessageSquare,
  RotateCw,
  Trash2,
  Search,
  Filter,
  Layers,
  Image as ImageIcon
} from "lucide-react"

export default function AdminMessages() {
  // data
  const [groups, setGroups] = useState([])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  // filters
  const [q, setQ] = useState("")
  const [groupId, setGroupId] = useState("")
  const [type, setType] = useState("") // '', 'text', 'image'
  const [from, setFrom] = useState("") // yyyy-mm-dd
  const [to, setTo] = useState("")

  // pagination
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    fetchGroups()
  }, [])

  async function fetchGroups() {
    try {
      const { data } = await api.get("/api/groups")
      setGroups(Array.isArray(data) ? data : data?.groups || [])
    } catch (e) {
      console.error("Failed to fetch groups", e)
    }
  }

  const fetchMessages = useCallback(async () => {
    setLoading(true)
    try {
      const params = {
        q: q || undefined,
        groupId: groupId || undefined,
        type: type || undefined,
        from: from || undefined,
        to: to || undefined,
        page,
        limit: pageSize,
      }
      const { data } = await api.get("/api/admin/messages", { params })
      if (Array.isArray(data)) {
        setItems(data)
        setTotal(data.length)
      } else {
        setItems(Array.isArray(data.items) ? data.items : [])
        setTotal(Number(data.total) || 0)
      }
    } catch (e) {
      console.error("Failed to fetch messages", e)
      Swal.fire({
        title: "Gagal Mengambil Pesan",
        text: e?.response?.data?.message || e.message || "Terjadi kesalahan saat memuat pesan.",
        icon: "error",
        background: "#131318",
        color: "#f8fafc",
        confirmButtonColor: "#d4a24e"
      })
    } finally {
      setLoading(false)
    }
  }, [q, groupId, type, from, to, page, pageSize])

  function resetAndSearch() {
    setPage(1)
    fetchMessages()
  }

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  async function handleDelete(id) {
    const confirm = await Swal.fire({
      title: "Hapus pesan ini?",
      text: "Tindakan ini tidak dapat dibatalkan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#262632",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      background: "#131318",
      color: "#f8fafc"
    })
    if (!confirm.isConfirmed) return

    setDeletingId(id)
    try {
      await api.delete(`/api/admin/messages/${id}`)
      setItems((prev) => prev.filter((m) => m._id !== id))
      setTotal((t) => Math.max(0, t - 1))
      Swal.fire({
        title: "Terhapus",
        text: "Pesan berhasil dihapus.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
        background: "#131318",
        color: "#f8fafc"
      })
    } catch (e) {
      console.error(e)
      Swal.fire({
        title: "Gagal",
        text: e?.response?.data?.message || e.message || "Gagal menghapus pesan",
        icon: "error",
        background: "#131318",
        color: "#f8fafc",
        confirmButtonColor: "#d4a24e"
      })
    } finally {
      setDeletingId(null)
    }
  }

  async function handleClearByFilter() {
    const desc =
      [
        q && `kata kunci "${q}"`,
        groupId && `grup=${groupName(groupId)}`,
        type && `tipe=${type}`,
        from && `dari=${from}`,
        to && `sampai=${to}`,
      ]
        .filter(Boolean)
        .join(", ") || "filter saat ini"

    const confirm = await Swal.fire({
      title: "Bersihkan pesan?",
      html: `Tindakan ini akan menghapus <b>SEMUA</b> pesan yang cocok dengan ${desc}.<br/><br/>Ketik <code>CLEAR</code> untuk konfirmasi.`,
      input: "text",
      inputPlaceholder: "Ketik CLEAR",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#262632",
      confirmButtonText: "Bersihkan",
      cancelButtonText: "Batal",
      background: "#131318",
      color: "#f8fafc",
      preConfirm: (val) => val === "CLEAR" || Swal.showValidationMessage("Silakan ketik CLEAR"),
    })
    if (!confirm.isConfirmed) return

    try {
      const params = {
        q: q || undefined,
        groupId: groupId || undefined,
        type: type || undefined,
        from: from || undefined,
        to: to || undefined,
      }
      const { data } = await api.delete("/api/admin/messages", { params })
      const deleted = Number(data?.deletedCount || 0)
      Swal.fire({
        title: "Berhasil Dibersihkan",
        text: `${deleted} pesan telah dihapus.`,
        icon: "success",
        background: "#131318",
        color: "#f8fafc",
        confirmButtonColor: "#d4a24e"
      })
      fetchMessages()
    } catch (e) {
      console.error(e)
      Swal.fire({
        title: "Gagal",
        text: e?.response?.data?.message || e.message || "Gagal membersihkan pesan",
        icon: "error",
        background: "#131318",
        color: "#f8fafc",
        confirmButtonColor: "#d4a24e"
      })
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="admin-messages-container">
      {/* Modern Minimalist Header */}
      <div className="messages-header-card">
        <div className="messages-header-main">
          <div className="messages-header-icon">
            <MessageSquare size={24} />
          </div>
          <div className="messages-header-text">
            <h1>Admin Messages</h1>
            <p>Filter, kelola, hapus, dan audit riwayat pesan obrolan komunitas</p>
          </div>
        </div>
        <div className="messages-header-actions">
          <button
            type="button"
            onClick={fetchMessages}
            className="btn-messages-refresh"
            disabled={loading}
            title="Muat ulang pesan"
          >
            <RotateCw size={14} className={loading ? "animate-spin" : ""} />
            <span>{loading ? "Memuat…" : "Refresh"}</span>
          </button>
          <button
            type="button"
            onClick={handleClearByFilter}
            className="btn-messages-clear"
            title="Hapus massal sesuai filter"
          >
            <Trash2 size={14} />
            <span>Clear by filter</span>
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      <div className="messages-filter-card">
        <div className="messages-filter-grid">
          <div className="filter-input-wrap">
            <Search size={14} className="filter-input-icon" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari teks, pengirim, ID…"
              className="filter-input"
            />
          </div>

          <select
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            className="filter-select"
          >
            <option value="">Semua Grup Komunitas</option>
            {groups.map((g) => (
              <option key={g._id} value={g._id}>
                {g.name || truncateMiddle(g._id, 14)}
              </option>
            ))}
          </select>

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="filter-select"
          >
            <option value="">Semua Tipe</option>
            <option value="text">Teks</option>
            <option value="image">Gambar</option>
          </select>

          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="filter-date-input"
            title="Dari tanggal"
          />

          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="filter-date-input"
            title="Sampai tanggal"
          />
        </div>

        <div className="messages-filter-footer">
          <div className="filter-action-buttons">
            <button type="button" onClick={resetAndSearch} className="btn-filter-apply">
              Terapkan Filter
            </button>
            <button
              type="button"
              onClick={() => {
                setQ("")
                setGroupId("")
                setType("")
                setFrom("")
                setTo("")
                setPage(1)
              }}
              className="btn-filter-reset"
            >
              Reset
            </button>
          </div>

          <div className="filter-rows-selector">
            <span>Baris per halaman:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value))
                setPage(1)
              }}
              className="select-rows"
            >
              {[10, 20, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Modern Data Table */}
      <div className="messages-table-card">
        <div className="overflow-x-auto">
          <table className="messages-table">
            <thead>
              <tr>
                <th style={{ width: "45%" }}>Pesan</th>
                <th>Komunitas</th>
                <th>Tipe</th>
                <th>Pengirim</th>
                <th>Waktu Kirim</th>
                <th style={{ textAlign: "right" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="table-empty-row">
                    <div className="table-empty-wrap">
                      <MessageSquare size={32} className="text-slate-600" />
                      <p className="font-semibold text-slate-300">Tidak ada pesan ditemukan</p>
                      <span className="text-xs text-slate-500">Sesuaikan filter atau muat ulang</span>
                    </div>
                  </td>
                </tr>
              )}

              {items.map((m) => (
                <tr key={m._id}>
                  <td>
                    {m.type === "image" ? (
                      <div className="flex items-center gap-3">
                        <img
                          src={m.image?.thumbUrl || m.image?.url || m.image}
                          alt="lampiran"
                          className="w-14 h-14 object-cover rounded-lg border border-white/10"
                        />
                        <div className="text-xs text-slate-400 flex items-center gap-1">
                          <ImageIcon size={12} />
                          <span>Gambar terlampir</span>
                        </div>
                      </div>
                    ) : (
                      <div className="message-cell-content">{m.text}</div>
                    )}
                    <div className="message-id-badge">ID: {m._id}</div>
                  </td>
                  <td>
                    <span className="message-group-pill">
                      <Layers size={11} />
                      <span>{m.group?.name || truncateMiddle(m.group?._id || "", 12) || "—"}</span>
                    </span>
                  </td>
                  <td>
                    <span className="message-type-badge">{m.type || "text"}</span>
                  </td>
                  <td>
                    <span className="message-sender-name">{renderSender(m)}</span>
                  </td>
                  <td>
                    <span className="message-date-text">{formatDate(m.createdAt)}</span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      type="button"
                      onClick={() => handleDelete(m._id)}
                      className="btn-message-delete"
                      disabled={deletingId === m._id}
                      title="Hapus pesan ini"
                    >
                      <Trash2 size={13} />
                      <span>{deletingId === m._id ? "Menghapus…" : "Hapus"}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modern Pagination */}
        <div className="messages-pagination-bar">
          <div className="pagination-info">
            {loading ? "Memuat data…" : `Total ${total} pesan`}
          </div>
          <div className="pagination-controls">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="btn-page-nav"
            >
              Sebelumnya
            </button>
            <span className="page-current-indicator">
              Halaman {page} dari {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
              className="btn-page-nav"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function formatDate(d) {
  try {
    const date = new Date(d)
    if (Number.isNaN(date.getTime())) return "—"
    return date.toLocaleString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return "—"
  }
}

function truncateMiddle(text, maxLen) {
  const str = String(text || "")
  if (str.length <= maxLen) return str
  const half = Math.floor((maxLen - 3) / 2)
  return str.slice(0, half) + "…" + str.slice(-half)
}

function renderSender(m) {
  const s = m.sender
  if (!s) return "—"
  if (typeof s === "string") return truncateMiddle(s, 12)
  return s.name || `${s.firstName || ""} ${s.lastName || ""}`.trim() || truncateMiddle(s._id, 12)
}

function groupName(id) {
  return id
}
