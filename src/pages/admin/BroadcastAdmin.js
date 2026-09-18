"use client"

import React, { useEffect, useMemo, useState } from "react"
import Swal from "sweetalert2"
import { getBroadcastMessages, deleteBroadcastMessage } from "./api/API"
import "./BroadcastAdmin.css"
import {
  Megaphone,
  RotateCw,
  Search,
  Trash2,
  Users,
  X
} from "lucide-react"

export default function BroadcastMessagesAdmin() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const pageSize = 10

  useEffect(() => {
    fetchMessages()
  }, [])

  async function fetchMessages() {
    setLoading(true)
    try {
      const data = await getBroadcastMessages()
      setMessages(Array.isArray(data) ? data : [])
    } catch (err) {
      const status = err?.response?.status
      if (status === 404) {
        setMessages([])
      } else {
        Swal.fire({
          title: "Gagal Mengambil Data",
          text: err.message || "Gagal memuat daftar siaran broadcast",
          icon: "error",
          background: "#131318",
          color: "#f8fafc",
          confirmButtonColor: "#d4a24e"
        })
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id) {
    const confirm = await Swal.fire({
      title: "Hapus broadcast ini?",
      text: "Riwayat broadcast ini akan dihapus permanen.",
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
      await deleteBroadcastMessage(id)
      setMessages((prev) => prev.filter((m) => m._id !== id))
      Swal.fire({
        title: "Terhapus",
        text: "Pesan broadcast berhasil dihapus.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
        background: "#131318",
        color: "#f8fafc"
      })
    } catch (err) {
      Swal.fire({
        title: "Gagal",
        text: err.message || "Gagal menghapus pesan broadcast",
        icon: "error",
        background: "#131318",
        color: "#f8fafc",
        confirmButtonColor: "#d4a24e"
      })
    } finally {
      setDeletingId(null)
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return messages
    return messages.filter((m) =>
      [m.message, (m.targetGroups || []).map((g) => g.name).join(","), m._id]
        .filter(Boolean)
        .some((x) => String(x).toLowerCase().includes(q))
    )
  }, [messages, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page])

  useEffect(() => {
    setPage((p) => (p > totalPages ? totalPages : p))
  }, [totalPages])

  return (
    <div className="broadcast-admin-container">
      {/* Modern Minimalist Header Card */}
      <div className="broadcast-header-card">
        <div className="broadcast-header-main">
          <div className="broadcast-header-icon">
            <Megaphone size={24} />
          </div>
          <div className="broadcast-header-text">
            <h1>Broadcast Messages</h1>
            <p>Kelola dan pantau seluruh riwayat siaran pesan broadcast jemaat</p>
          </div>
        </div>
        <div>
          <button
            type="button"
            onClick={fetchMessages}
            className="btn-broadcast-refresh"
            disabled={loading}
            title="Muat ulang data"
          >
            <RotateCw size={14} className={loading ? "animate-spin" : ""} />
            <span>{loading ? "Memuat…" : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* Toolbar & Search */}
      <div className="broadcast-toolbar-card">
        <div className="broadcast-count-badge">
          <Megaphone size={13} />
          <span>{loading ? "Memuat…" : `${filtered.length} Pesan Siaran`}</span>
        </div>

        <div className="broadcast-search-box">
          <Search size={14} className="broadcast-search-icon" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari pesan, komunitas, ID…"
            className="broadcast-search-input"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="broadcast-search-clear"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Table Card */}
      <div className="broadcast-table-card">
        <div className="overflow-x-auto">
          <table className="broadcast-table">
            <thead>
              <tr>
                <th style={{ width: "50%" }}>Isi Pesan Siaran</th>
                <th>Target Komunitas</th>
                <th>Waktu Kirim</th>
                <th style={{ textAlign: "right" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {!loading && filtered.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <div className="broadcast-empty-wrap">
                      <Megaphone size={36} className="text-slate-600" />
                      <p className="font-semibold text-slate-300">Tidak ada broadcast ditemukan</p>
                      <span className="text-xs text-slate-500">
                        {search ? "Coba kata kunci pencarian yang lain." : "Belum ada siaran broadcast yang dikirimkan."}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : null}

              {pageItems.map((m) => (
                <tr key={m._id}>
                  <td>
                    <div className="broadcast-message-text">{m.message}</div>
                    <div className="broadcast-id-badge">ID: {m._id}</div>
                  </td>
                  <td>
                    <BadgeList
                      items={(m.targetGroups || []).map((g) => g.name || g)}
                      emptyLabel="Semua Komunitas"
                    />
                  </td>
                  <td>
                    <span className="broadcast-date-text">{formatDate(m.createdAt)}</span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      type="button"
                      onClick={() => handleDelete(m._id)}
                      className="btn-broadcast-delete"
                      disabled={deletingId === m._id}
                      title="Hapus broadcast"
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
        {filtered.length > pageSize && (
          <div className="broadcast-pagination-bar">
            <div className="text-xs text-slate-400 font-medium">
              Halaman {page} dari {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-page-nav"
              >
                Sebelumnya
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-page-nav"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function BadgeList({ items = [], emptyLabel = "Semua Komunitas" }) {
  if (!items.length) {
    return (
      <span className="broadcast-all-pill flex items-center gap-1">
        <Users size={12} className="text-slate-400" />
        <span>{emptyLabel}</span>
      </span>
    )
  }
  return (
    <div className="flex flex-wrap gap-1 max-w-xs">
      {items.map((it, idx) => (
        <span key={idx} className="broadcast-group-pill">
          {truncateMiddle(it, 20)}
        </span>
      ))}
    </div>
  )
}

function truncateMiddle(text, maxLen) {
  const str = String(text || "")
  if (str.length <= maxLen) return str
  const half = Math.floor((maxLen - 3) / 2)
  return str.slice(0, half) + "…" + str.slice(-half)
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
