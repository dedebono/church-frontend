"use client"

import { useEffect, useState, useCallback } from "react"
import Swal from "sweetalert2"
import api from "../admin/api/API"

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
    if (Array.isArray(data)) { setItems(data); setTotal(data.length) }
    else { setItems(Array.isArray(data.items) ? data.items : []); setTotal(Number(data.total) || 0) }
  } catch (e) {
    console.error("Failed to fetch messages", e)
    Swal.fire("Error", e?.response?.data?.message || e.message || "Failed to fetch messages", "error")
  } finally { setLoading(false) }
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
      title: "Delete this message?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Delete",
    })
    if (!confirm.isConfirmed) return

    setDeletingId(id)
    try {
      await api.delete(`/api/admin/messages/${id}`)
      setItems((prev) => prev.filter((m) => m._id !== id))
      setTotal((t) => Math.max(0, t - 1))
      Swal.fire("Deleted", "Message removed", "success")
    } catch (e) {
      console.error(e)
      Swal.fire("Error", e?.response?.data?.message || e.message || "Failed to delete", "error")
    } finally {
      setDeletingId(null)
    }
  }

  async function handleClearByFilter() {
    const desc = [
    q && `query "${q}"`,
      groupId && `group=${groupName(groupId)}`,
      type && `type=${type}`,
      from && `from=${from}`,
      to && `to=${to}`,
    ].filter(Boolean).join(", ") || "current filter"

    const confirm = await Swal.fire({
      title: "Clear messages?",
      html: `This will delete <b>ALL</b> messages matching ${desc}.<br/>Type <code>CLEAR</code> to confirm.`,
      input: "text",
      inputPlaceholder: "Type CLEAR",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      preConfirm: (val) => val === "CLEAR" || Swal.showValidationMessage("Please type CLEAR"),
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
      Swal.fire("Cleared", `${deleted} message(s) deleted`, "success")
      fetchMessages()
    } catch (e) {
      console.error(e)
      Swal.fire("Error", e?.response?.data?.message || e.message || "Failed to clear messages", "error")
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Admin Messages</h1>
          <p className="text-sm text-slate-400">Filter, manage, delete, or clear group messages</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchMessages}
            className="px-3.5 py-2 rounded-xl border border-white/10 bg-[#1c1c24] text-slate-200 text-sm font-medium hover:bg-white/10 hover:border-white/20 transition-all flex items-center gap-1.5"
            disabled={loading}
          >
            {loading ? "Refreshing…" : "↻ Refresh"}
          </button>
          <button
            onClick={handleClearByFilter}
            className="px-3.5 py-2 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-all"
          >
            Clear by filter
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#131318] border border-white/10 rounded-2xl p-4 mb-5 shadow-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3 mb-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search text, sender, id…"
            className="md:col-span-2 px-3.5 py-2 rounded-xl bg-[#1c1c24] border border-white/15 text-slate-100 placeholder:text-slate-500 text-sm outline-none focus:border-[#d4a24e] focus:ring-1 focus:ring-[#d4a24e] transition-all"
          />
          <select
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#1c1c24] border border-white/15 text-slate-200 text-sm outline-none focus:border-[#d4a24e] transition-all"
          >
            <option value="" className="bg-[#1c1c24] text-slate-200">All groups</option>
            {groups.map((g) => (
              <option key={g._id} value={g._id} className="bg-[#1c1c24] text-slate-200">{g.name || truncateMiddle(g._id, 10)}</option>
            ))}
          </select>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#1c1c24] border border-white/15 text-slate-200 text-sm outline-none focus:border-[#d4a24e] transition-all"
          >
            <option value="" className="bg-[#1c1c24] text-slate-200">All types</option>
            <option value="text" className="bg-[#1c1c24] text-slate-200">Text</option>
            <option value="image" className="bg-[#1c1c24] text-slate-200">Image</option>
          </select>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#1c1c24] border border-white/15 text-slate-200 text-sm outline-none focus:border-[#d4a24e] transition-all"
          />
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#1c1c24] border border-white/15 text-slate-200 text-sm outline-none focus:border-[#d4a24e] transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
          <button
            onClick={resetAndSearch}
            className="px-4 py-1.5 rounded-lg bg-[#d4a24e] text-[#171204] text-sm font-semibold hover:bg-[#e3b661] transition-all shadow-sm"
          >
            Apply filters
          </button>
          <button
            onClick={() => { setQ(""); setGroupId(""); setType(""); setFrom(""); setTo(""); setPage(1); }}
            className="px-3.5 py-1.5 rounded-lg border border-white/10 bg-[#1c1c24] text-slate-300 text-sm font-medium hover:bg-white/5 hover:text-white transition-all"
          >
            Reset
          </button>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rows</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1) }}
              className="px-2.5 py-1 rounded-lg bg-[#1c1c24] border border-white/15 text-slate-200 text-xs font-medium outline-none"
            >
              {[10,20,50,100].map(n => <option key={n} value={n} className="bg-[#1c1c24] text-slate-200">{n}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-white/10 rounded-2xl bg-[#131318] shadow-xl">
        <table className="min-w-full text-sm border-collapse">
          <thead className="bg-[#1c1c24] border-b border-white/10">
            <tr>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-300 uppercase tracking-wider">Message</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-300 uppercase tracking-wider">Group</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-300 uppercase tracking-wider">Type</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-300 uppercase tracking-wider">Sender</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-300 uppercase tracking-wider">Created</th>
              <th className="text-right px-4 py-3.5 text-xs font-semibold text-slate-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {items.length === 0 && !loading && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                  <div className="text-3xl mb-2">💬</div>
                  No messages found
                </td>
              </tr>
            )}

            {items.map((m) => (
              <tr key={m._id} className="align-top hover:bg-white/[0.03] transition-colors">
                <td className="px-4 py-3.5 w-[45%]">
                  {m.type === "image" ? (
                    <div className="flex items-center gap-3">
                      <img src={m.image?.thumbUrl || m.image?.url} alt="thumb" className="w-16 h-16 object-cover rounded-lg border border-white/10" />
                      <div className="text-xs text-slate-400 break-all">{m.image?.url}</div>
                    </div>
                  ) : (
                    <div className="break-words leading-relaxed text-slate-100 font-medium">{m.text}</div>
                  )}
                  <div className="text-[11px] font-mono text-slate-400 mt-1">ID: {m._id}</div>
                </td>
                <td className="px-4 py-3.5 text-slate-300 font-medium">{m.group?.name || truncateMiddle(m.group?._id || "", 10) || "—"}</td>
                <td className="px-4 py-3.5">
                  <span className="inline-flex px-2 py-0.5 rounded-md bg-[#1c1c24] text-slate-300 border border-white/10 text-xs font-medium">
                    {m.type}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-slate-300">{renderSender(m)}</td>
                <td className="px-4 py-3.5 whitespace-nowrap text-slate-400 text-xs font-medium">{formatDate(m.createdAt)}</td>
                <td className="px-4 py-3.5 text-right">
                  <button
                    onClick={() => handleDelete(m._id)}
                    className="px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-semibold transition-all disabled:opacity-50"
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

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 text-slate-400">
        <div className="text-sm font-medium">{loading ? "Loading…" : `${total} result(s)`}</div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg border border-white/10 bg-[#1c1c24] text-slate-300 text-sm hover:bg-white/5 disabled:opacity-30 transition-all"
          >
            Prev
          </button>
          <div className="text-sm px-2 text-slate-300 font-medium">Page {page} of {totalPages}</div>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 rounded-lg border border-white/10 bg-[#1c1c24] text-slate-300 text-sm hover:bg-white/5 disabled:opacity-30 transition-all"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
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

function truncateMiddle(text, maxLen) {
  const str = String(text || "")
  if (str.length <= maxLen) return str
  const half = Math.floor((maxLen - 3) / 2)
  return str.slice(0, half) + "…" + str.slice(-half)
}

function renderSender(m) {
  // try common shapes; tweak if your API populates more
  const s = m.sender
  if (!s) return "—"
  if (typeof s === "string") return truncateMiddle(s, 10)
  return s.name || `${s.firstName || ""} ${s.lastName || ""}`.trim() || truncateMiddle(s._id, 10)
}

function groupName(id) {
  // name lookup would be better via a map, but this is only used in a string
  return id
}
