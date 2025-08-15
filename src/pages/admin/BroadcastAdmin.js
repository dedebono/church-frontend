"use client"

import { useEffect, useMemo, useState } from "react"
import Swal from "sweetalert2"
import { getBroadcastMessages, deleteBroadcastMessage } from "./api/API" // adjust path if needed

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
      // If API returns 404 when there are no messages, treat as empty state
      const status = err?.response?.status
      if (status === 404) {
        setMessages([])
      } else {
        Swal.fire("Error", err.message || "Failed to fetch broadcast messages", "error")
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id) {
    const confirm = await Swal.fire({
      title: "Delete this broadcast?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Delete",
    })
    if (!confirm.isConfirmed) return

    setDeletingId(id)
    try {
      await deleteBroadcastMessage(id)
      setMessages((prev) => prev.filter((m) => m._id !== id))
      Swal.fire("Deleted", "Broadcast removed successfully", "success")
    } catch (err) {
      Swal.fire("Error", err.message || "Failed to delete broadcast message", "error")
    } finally {
      setDeletingId(null)
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return messages
    return messages.filter((m) =>
      [m.message, (m.targetGroups || []).map(g => g.name).join(","), m._id]
        .filter(Boolean)
        .some((x) => String(x).toLowerCase().includes(q)),
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
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Broadcast Messages</h1>
          <p className="text-sm text-gray-500">View and manage sent broadcasts</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchMessages}
            className="px-3 py-2 rounded-xl border text-sm hover:bg-gray-50"
            disabled={loading}
            title="Refresh"
          >
            {loading ? "Refreshing…" : "↻ Refresh"}
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-4">
        <div className="text-sm text-gray-600">
          {loading ? "Loading…" : `${filtered.length} message(s)`}
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search message, group, or ID…"
          className="w-full sm:w-80 px-3 py-2 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Empty state */}
      {!loading && filtered.length === 0 ? (
        <div className="border rounded-2xl p-10 text-center text-gray-500">
          <div className="text-5xl mb-2">📭</div>
          <div className="font-medium">No broadcasts found</div>
          <div className="text-sm">Try refreshing or clearing your search.</div>
        </div>
      ) : null}

      {/* Table */}
      {filtered.length > 0 && (
        <div className="overflow-x-auto border rounded-2xl">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3">Message</th>
                <th className="text-left px-4 py-3">Groups</th>
                <th className="text-left px-4 py-3">Created</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((m) => (
                <tr key={m._id} className="border-t">
                  <td className="px-4 py-3 align-top">
                    <div className="font-medium break-words leading-5">{m.message}</div>
                    <div className="text-xs text-gray-500 mt-1">ID: {m._id}</div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <BadgeList items={(m.targetGroups || []).map(g => g.name)} emptyLabel="All members" />
                  </td>
                  <td className="px-4 py-3 align-top whitespace-nowrap">
                    {formatDate(m.createdAt)}
                  </td>
                  <td className="px-4 py-3 align-top text-right">
                    <button
                      onClick={() => handleDelete(m._id)}
                      className="px-3 py-1.5 rounded-xl border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50"
                      disabled={deletingId === m._id}
                    >
                      {deletingId === m._id ? "Deleting…" : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {filtered.length > pageSize && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-500">Page {page} of {totalPages}</div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-2 rounded-xl border text-sm disabled:opacity-50"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-2 rounded-xl border text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function BadgeList({ items = [], emptyLabel = "None" }) {
  if (!items.length) return <span className="inline-flex px-2 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs">{emptyLabel}</span>
  return (
    <div className="flex flex-wrap gap-1.5 max-w-xs">
      {items.map((it) => (
        <span key={it} className="inline-flex px-2 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs border border-blue-100">
          {truncateMiddle(it, 20)}
        </span>
      ))}
    </div>
  )
}

function truncateMiddle(text, maxLen) {
  const str = String(text)
  if (str.length <= maxLen) return str
  const half = Math.floor((maxLen - 3) / 2)
  return str.slice(0, half) + "…" + str.slice(-half)
}

function formatDate(d) {
  try {
    const date = new Date(d)
    if (Number.isNaN(date.getTime())) return "—"
    return date.toLocaleString()
  } catch {
    return "—"
  }
}
