// src/components/ManageGroups.js
import React, { useEffect, useState, useMemo } from 'react';
import Swal from 'sweetalert2';
import { toast, ToastContainer } from 'react-toastify';
import './ManageGroups.css';
import api from './api/API';

import {
  getAllGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  removeMemberFromGroup,
  getGroupMembers,
  searchMembersByName,
  addMemberToGroup,
} from './api/manageGroupsAPI';
import {
  Users,
  RefreshCw,
  Plus,
  Megaphone,
  FileText,
  Edit2,
  Trash2,
  MessageCircle,
  Search,
  X,
  Radio,
  Send,
  UserPlus
} from "lucide-react";

import { useSocket } from '../../socket/SocketContext';

const ManageGroups = () => {
  const { status, transport, error, on, off, joinGroup, leaveGroup, sendText, reconnect } = useSocket();
  const [userId, setUserId] = useState(null);
  const [groups, setGroups] = useState([]);
  const [groupMembers, setGroupMembers] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', rules: '' });
  const [showAddMembersModal, setShowAddMembersModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [showBroadcastModal_all, setShowBroadcastModal_all] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [selectedGroupIdForBroadcast, setSelectedGroupIdForBroadcast] = useState(null);
  const [groupSearch, setGroupSearch] = useState('');

  // Chat UI state (modal uses shared socket)
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatGroup, setChatGroup] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatText, setChatText] = useState('');

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    const currentUserId = "user_id_from_context_or_local_storage";
    setUserId(currentUserId);
  }, []);

  useEffect(() => {
    const fetchMembersForGroups = async () => {
      const membersByGroup = {};
      for (const group of groups) {
        try {
          const res = await getGroupMembers(group._id);
          membersByGroup[group._id] = res.data;
        } catch (err) {
          console.error(`Error fetching members for group ${group.name}:`, err);
          membersByGroup[group._id] = [];
        }
      }
      setGroupMembers(membersByGroup);
    };
    if (groups.length > 0) fetchMembersForGroups();
  }, [groups]);

  const fetchGroups = async () => {
    try {
      const res = await getAllGroups();
      setGroups(res.data);
    } catch (err) {
      console.error('Error fetching groups:', err);
      toast.error('Failed to fetch groups.');
    }
  };

  const fetchMessagesFromBackend = async (groupId) => {
    try {
      const res = await api.get('/api/admin/messages', {
        params: {
          groupId,
          page: 1,
          limit: 100,
        },
      });
      const rawMessages = Array.isArray(res.data)
        ? res.data
        : res.data?.items || res.data?.messages || [];
      const messages = rawMessages.map((message) => {
        const sender = message.sender;
        const senderId = typeof sender === 'object'
          ? sender?._id || sender?.id
          : sender;
        const senderName = message.fullName ||
          (typeof sender === 'object'
            ? sender?.fullName || sender?.name ||
              [sender?.firstName, sender?.lastName].filter(Boolean).join(' ')
            : null);
        const image = typeof message.image === 'object'
          ? message.image?.url
          : message.image;

        return {
          ...message,
          sender: senderId,
          fullName: senderName || 'User',
          image,
        };
      });
      setChatMessages(messages);
    } catch (err) {
      console.error('Error fetching messages from backend:', err);
    }
  };

  const openChat = async (group) => {
    setChatGroup(group);
    setShowChatModal(true);
    joinGroup(group._id);
    await fetchMessagesFromBackend(group._id);
  };

  const closeChat = () => {
    if (chatGroup) leaveGroup(chatGroup._id);
    setShowChatModal(false);
    setChatGroup(null);
    setChatMessages([]);
  };

  const sendChatMessage = () => {
    if (!chatText.trim() || !chatGroup) return;
    sendText(chatGroup._id, chatText.trim());
    setChatText('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingGroup) {
        await updateGroup(editingGroup._id, formData);
        toast.success('Komunitas berhasil diperbarui!');
      } else {
        await createGroup(formData);
        toast.success('Komunitas berhasil dibuat!');
      }
      setFormData({ name: '', description: '', rules: '' });
      setEditingGroup(null);
      setShowModal(false);
      fetchGroups();
    } catch (error) {
      console.error('Error saving group:', error);
      toast.error('Gagal menyimpan komunitas.');
    }
  };

  const handleEdit = (group) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      description: group.description,
      rules: group.rules,
    });
    setShowModal(true);
  };

  const handleDelete = async (groupId) => {
    const result = await Swal.fire({
      title: 'Hapus Komunitas?',
      text: 'Semua data dan keanggotaan grup ini akan dihapus permanen!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#262632',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
      background: '#131318',
      color: '#f8fafc',
    });

    if (result.isConfirmed) {
      try {
        await deleteGroup(groupId);
        toast.success('Komunitas berhasil dihapus.');
        fetchGroups();
      } catch (error) {
        console.error('Error deleting group:', error);
        toast.error('Gagal menghapus komunitas.');
      }
    }
  };

  const handleRemoveMember = async (groupId, memberId) => {
    const result = await Swal.fire({
      title: 'Keluarkan Anggota?',
      text: 'Anggota ini akan dikeluarkan dari komunitas.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#262632',
      confirmButtonText: 'Ya, Keluarkan',
      cancelButtonText: 'Batal',
      background: '#131318',
      color: '#f8fafc',
    });

    if (result.isConfirmed) {
      try {
        await removeMemberFromGroup(groupId, memberId);
        toast.success('Anggota berhasil dikeluarkan.');
        setGroupMembers((prev) => ({
          ...prev,
          [groupId]: prev[groupId].filter((member) => member._id !== memberId),
        }));
      } catch (error) {
        console.error('Error removing member:', error);
        toast.error('Gagal mengeluarkan anggota.');
      }
    }
  };

  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }
    try {
      const res = await searchMembersByName(query);
      setSearchResults(res.data);
    } catch (err) {
      console.error('Error searching members:', err);
    }
  };

  const handleAddMemberToGroup = async () => {
    if (!selectedMember || !editingGroup) return;
    try {
      await addMemberToGroup(editingGroup._id, selectedMember._id);
      toast.success('Anggota berhasil ditambahkan!');
      setShowAddMembersModal(false);
      setSelectedMember(null);
      setSearchQuery('');
      setSearchResults([]);
      const res = await getGroupMembers(editingGroup._id);
      setGroupMembers((prev) => ({
        ...prev,
        [editingGroup._id]: res.data,
      }));
    } catch (error) {
      console.error('Error adding member to group:', error);
      toast.error('Gagal menambahkan anggota.');
    }
  };

  const handleSendBroadcast = async () => {
    if (!broadcastMessage.trim() || !selectedGroupIdForBroadcast) return;
    try {
      const payload = { message: broadcastMessage, targetGroups: [selectedGroupIdForBroadcast] };
      await api.post('/api/broadcast-messages', payload);
      toast.success('Pesan broadcast berhasil dikirim');
      setBroadcastMessage('');
      setShowBroadcastModal(false);
    } catch (error) {
      console.error('Broadcast sending failed:', error);
      toast.error('Gagal mengirim broadcast');
    }
  };

  const handleSendBroadcast_all = async () => {
    if (!broadcastMessage.trim()) return toast.error('Pesan broadcast tidak boleh kosong.');
    try {
      const allGroupIds = groups.map((g) => g._id);
      const payload = {
        message: broadcastMessage,
        targetGroups: allGroupIds,
      };
      await api.post('/api/broadcast-messages', payload);
      toast.success('Broadcast berhasil dikirim ke semua komunitas!');
      setBroadcastMessage('');
      setShowBroadcastModal_all(false);
    } catch (error) {
      console.error('Broadcast sending failed:', error);
      toast.error('Gagal mengirim broadcast');
    }
  };

  const fetchBroadcastLogs = async (groupId) => {
    try {
      const res = await api.get(`/api/broadcast-messages/group/${groupId}`);
      const logs = res.data;

      if (logs && logs.length > 0) {
        const logList = logs
          .map(
            (log) =>
              `<div style="text-align: left; padding: 10px; background: #1c1c24; border-radius: 8px; margin-bottom: 8px; border: 1px solid rgba(255,255,255,0.08);">
                <div style="font-size: 0.78rem; color: #d4a24e; margin-bottom: 4px;">📅 ${new Date(log.createdAt).toLocaleString('id-ID')}</div>
                <div style="font-size: 0.9rem; color: #f8fafc;">${log.message}</div>
              </div>`
          )
          .join('');

        Swal.fire({
          title: 'Riwayat Broadcast Komunitas',
          html: `<div style="max-height: 350px; overflow-y: auto;">${logList}</div>`,
          width: '560px',
          background: '#131318',
          color: '#f8fafc',
          showCloseButton: true,
          confirmButtonColor: '#d4a24e',
        });
      } else {
        Swal.fire({
          icon: 'info',
          title: 'Belum Ada Riwayat',
          text: 'Tidak ada riwayat pesan broadcast untuk komunitas ini.',
          background: '#131318',
          color: '#f8fafc',
          confirmButtonColor: '#d4a24e',
        });
      }
    } catch (err) {
      console.error('Error fetching broadcast logs:', err);
      toast.error('Gagal memuat log broadcast.');
    }
  };

  useEffect(() => {
    if (!showChatModal || !chatGroup) return;

    const handleNew = (msg) => {
      if (msg.groupId !== chatGroup._id) return;
      setChatMessages((prev) => [msg, ...prev]);
    };

    on('message:new', handleNew);
    return () => {
      off('message:new', handleNew);
    };
  }, [showChatModal, chatGroup, on, off]);

  const filteredGroups = useMemo(() => {
    if (!groupSearch.trim()) return groups;
    const term = groupSearch.toLowerCase().trim();
    return groups.filter(
      (g) =>
        (g.name && g.name.toLowerCase().includes(term)) ||
        (g.description && g.description.toLowerCase().includes(term)) ||
        (g.rules && g.rules.toLowerCase().includes(term))
    );
  }, [groups, groupSearch]);

  const totalMembersCount = useMemo(() => {
    return Object.values(groupMembers).reduce((acc, mList) => acc + (mList?.length || 0), 0);
  }, [groupMembers]);

  return (
    <div className="page-flow-manage-groups">
      {/* Modern Minimalist Header Card */}
      <div className="groups-header-card">
        <div className="groups-header-main">
          <div className="groups-header-icon">
            <Users size={24} />
          </div>
          <div className="groups-header-text">
            <h1>Admin Komunitas</h1>
            <p>Kelola grup komunitas, keanggotaan deepcell, dan siaran pesan</p>
          </div>
        </div>

        {/* Header Action Toolbar */}
        <div className="groups-header-actions">
          {/* High Contrast Status Indicator */}
          <div className={`status-pill status-${status}`} title={error || ''}>
            <span className="status-dot" />
            <span className="status-label">
              {status === 'connected' ? 'Online' : status === 'connecting' ? 'Menghubungkan...' : 'Offline'}
            </span>
            {status === 'connected' && transport && <span className="status-transport">({transport})</span>}
          </div>

          <button type="button" className="btn-header-action" onClick={reconnect} title="Hubungkan ulang socket">
            <RefreshCw size={14} />
            <span>Reconnect</span>
          </button>

          <button
            type="button"
            onClick={() => setShowBroadcastModal_all(true)}
            className="btn-header-action"
            title="Kirim broadcast ke seluruh komunitas"
          >
            <Megaphone size={14} />
            <span>Broadcast Semua</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setFormData({ name: '', description: '', rules: '' });
              setEditingGroup(null);
              setShowModal(true);
            }}
            className="btn-header-primary"
          >
            <Plus size={15} />
            <span>Buat Komunitas</span>
          </button>
        </div>
      </div>

      {/* Search & Stats Bar */}
      <div className="groups-toolbar-card">
        <div className="groups-stats-badges">
          <span className="badge-stat">
            <Users size={13} />
            <span>{groups.length} Komunitas</span>
          </span>
          <span className="badge-stat">
            <Radio size={13} />
            <span>{totalMembersCount} Total Anggota</span>
          </span>
        </div>

        <div className="groups-search-box">
          <Search size={15} className="groups-search-icon" />
          <input
            type="text"
            placeholder="Cari nama komunitas, rules..."
            value={groupSearch}
            onChange={(e) => setGroupSearch(e.target.value)}
            className="groups-search-input"
          />
          {groupSearch && (
            <button onClick={() => setGroupSearch('')} className="groups-search-clear">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Group Cards Grid */}
      <div className="container-list-member">
        {filteredGroups.length === 0 ? (
          <div className="groups-empty-card">
            <Users size={36} className="text-slate-500 mb-2" />
            <h3>{groupSearch ? 'Tidak ada komunitas yang cocok' : 'Belum ada data komunitas'}</h3>
            <p>
              {groupSearch
                ? 'Silakan coba kata kunci pencarian yang lain.'
                : 'Mulai dengan menambahkan grup komunitas baru.'}
            </p>
          </div>
        ) : (
          filteredGroups.map((group) => {
            const members = groupMembers[group._id] || [];
            return (
              <div key={group._id} className="member-card-grup">
                {/* Top Card Row */}
                <div className="card-top-row">
                  <div className="card-group-name">{group.name}</div>
                  <span className="card-member-count">
                    <Users size={12} />
                    <span>{members.length} Anggota</span>
                  </span>
                </div>

                {/* Description */}
                {group.description && <p className="card-group-desc">{group.description}</p>}

                {/* Rules */}
                {group.rules && (
                  <div className="card-rules-box">
                    <FileText size={13} className="shrink-0 text-amber-400" />
                    <span>Rules: {group.rules}</span>
                  </div>
                )}

                {/* Members Section */}
                <div className="card-members-section">
                  <div className="card-members-header">
                    <span>Anggota ({members.length})</span>
                  </div>
                  <ul className="card-members-list">
                    {members.map((member) => (
                      <li key={member._id} className="card-member-item">
                        <div className="member-info">
                          <span className="member-name">{member.fullName}</span>
                          <span className="member-phone">{member.phoneNumber || '-'}</span>
                        </div>
                        <button
                          type="button"
                          className="btn-remove-member"
                          onClick={() => handleRemoveMember(group._id, member._id)}
                          title="Keluarkan anggota"
                        >
                          <X size={12} />
                        </button>
                      </li>
                    ))}
                    {members.length === 0 && <li className="card-member-empty">Belum ada anggota</li>}
                  </ul>
                </div>

                {/* Card Primary Actions (Anggota, Broadcast, Log) */}
                <div className="card-actions-row">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingGroup(group);
                      setShowAddMembersModal(true);
                    }}
                    className="btn-card-action"
                    title="Tambah anggota"
                  >
                    <UserPlus size={13} />
                    <span>+ Anggota</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedGroupIdForBroadcast(group._id);
                      setShowBroadcastModal(true);
                    }}
                    className="btn-card-action"
                    title="Kirim pesan broadcast ke grup ini"
                  >
                    <Megaphone size={13} />
                    <span>Broadcast</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fetchBroadcastLogs(group._id)}
                    className="btn-card-action"
                    title="Lihat riwayat broadcast"
                  >
                    <FileText size={13} />
                    <span>Log BC</span>
                  </button>
                </div>

                {/* Card Management Actions (Edit, Hapus, Chat) */}
                <div className="card-footer-actions">
                  <button type="button" onClick={() => handleEdit(group)} className="btn-footer-action btn-edit">
                    <Edit2 size={13} />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(group._id)}
                    className="btn-footer-action btn-delete"
                  >
                    <Trash2 size={13} />
                    <span>Hapus</span>
                  </button>
                  <button type="button" onClick={() => openChat(group)} className="btn-footer-action btn-chat">
                    <MessageCircle size={13} />
                    <span>Chat</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Members Modal */}
      {showAddMembersModal && (
        <div className="modal-backdrop-groups">
          <div className="modal-container-groups">
            <h3>Tambah Anggota ke {editingGroup?.name}</h3>
            <div className="modal-form-group">
              <label>Cari Nama Jemaat</label>
              <input
                type="text"
                placeholder="Ketik nama jemaat..."
                value={selectedMember ? selectedMember.fullName : searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedMember(null);
                  handleSearchChange(e);
                }}
                className="modal-input"
              />
            </div>

            <div className="search-results-group">
              {searchResults.map((member, index) => {
                if (!member || !member._id) return null;
                const isSelected = selectedMember && selectedMember._id === member._id;
                return (
                  <div
                    key={member._id || index}
                    className={`search-result-group-item ${isSelected ? 'selected-member' : ''}`}
                    onClick={() => {
                      setSelectedMember(member);
                      setSearchQuery(member.fullName);
                    }}
                  >
                    <span className="font-medium text-slate-100">{member.fullName}</span>
                    <span className="text-xs text-slate-400">{member.phoneNumber || ''}</span>
                  </div>
                );
              })}
              {searchQuery && searchResults.length === 0 && (
                <div className="p-3 text-center text-sm text-slate-400">Jemaat tidak ditemukan</div>
              )}
            </div>

            <div className="modal-actions-row">
              <button type="button" onClick={() => setShowAddMembersModal(false)} className="btn-modal-cancel">
                Batal
              </button>
              <button
                type="button"
                onClick={handleAddMemberToGroup}
                className="btn-modal-submit"
                disabled={!selectedMember}
              >
                Tambahkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {showChatModal && chatGroup && (
        <div className="modal-backdrop-groups">
          <div className="modal-container-groups modal-chat-container">
            <div className="modal-chat-header">
              <div className="flex items-center gap-2">
                <MessageCircle size={18} className="text-amber-400" />
                <h3>Live Chat — {chatGroup.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => fetchMessagesFromBackend(chatGroup._id)}
                className="btn-chat-refresh"
                title="Refresh obrolan"
              >
                <RefreshCw size={14} />
              </button>
            </div>

            {/* Chat Messages Container */}
            <div className="chat-messages-scroll">
              {chatMessages.length === 0 && (
                <div className="chat-empty-hint">Belum ada pesan di komunitas ini. Mulailah mengobrol.</div>
              )}

              {chatMessages.map((m) => {
                const isMe = m.sender === userId;
                return (
                  <div key={m._id || Math.random()} className={`chat-message-row ${isMe ? 'is-me' : 'is-other'}`}>
                    <div className="chat-bubble">
                      <div className="chat-sender-info">
                        <span>{m.fullName || 'User'}</span>
                        <span>•</span>
                        <span>{m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                      </div>
                      <div className="chat-content">
                        {m.type === 'image' ? (
                          <img src={m.image} alt="lampiran" className="chat-image-preview" />
                        ) : (
                          m.text || ''
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Message Input */}
            <div className="chat-input-row">
              <input
                className="chat-input-field"
                placeholder="Ketik pesan..."
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
                onKeyDown={(e) => (e.key === 'Enter' ? sendChatMessage() : null)}
              />
              <button
                type="button"
                className="btn-chat-send"
                onClick={sendChatMessage}
                disabled={!chatText.trim()}
              >
                <Send size={15} />
                <span>Kirim</span>
              </button>
              <button type="button" className="btn-chat-close" onClick={closeChat}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Modal (Single Group) */}
      {showBroadcastModal && (
        <div className="modal-backdrop-groups">
          <div className="modal-container-groups">
            <h3>Kirim Broadcast Komunitas</h3>
            <p className="text-xs text-slate-400 mb-3">
              Pesan ini akan dikirimkan sebagai siaran ke anggota grup ini.
            </p>
            <textarea
              placeholder="Tuliskan isi pesan broadcast di sini..."
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              className="modal-textarea"
              rows={4}
            />
            <div className="modal-actions-row">
              <button type="button" onClick={() => setShowBroadcastModal(false)} className="btn-modal-cancel">
                Batal
              </button>
              <button
                type="button"
                onClick={handleSendBroadcast}
                className="btn-modal-submit"
                disabled={!broadcastMessage.trim()}
              >
                Kirim Broadcast
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast All Modal */}
      {showBroadcastModal_all && (
        <div className="modal-backdrop-groups">
          <div className="modal-container-groups">
            <h3>Broadcast ke Semua Komunitas</h3>
            <p className="text-xs text-slate-400 mb-3">
              Pesan ini akan dikirimkan secara serentak ke seluruh grup komunitas terdaftar.
            </p>
            <textarea
              placeholder="Tuliskan pesan broadcast untuk semua grup..."
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              className="modal-textarea"
              rows={4}
            />
            <div className="modal-actions-row">
              <button type="button" onClick={() => setShowBroadcastModal_all(false)} className="btn-modal-cancel">
                Batal
              </button>
              <button
                type="button"
                onClick={handleSendBroadcast_all}
                className="btn-modal-submit"
                disabled={!broadcastMessage.trim()}
              >
                Kirim ke Semua
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Group Creation / Editing Modal */}
      {showModal && (
        <div className="modal-backdrop-groups">
          <div className="modal-container-groups">
            <h3>{editingGroup ? 'Edit Komunitas' : 'Buat Komunitas Baru'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="modal-form-group">
                <label>Nama Komunitas / Deepcell</label>
                <input
                  type="text"
                  name="name"
                  placeholder="cth: Deepcell Nazareth"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="modal-input"
                  required
                />
              </div>

              <div className="modal-form-group">
                <label>Deskripsi</label>
                <textarea
                  name="description"
                  placeholder="Keterangan atau visi kelompok..."
                  value={formData.description}
                  onChange={handleInputChange}
                  className="modal-textarea"
                  rows={2}
                />
              </div>

              <div className="modal-form-group">
                <label>Rules / Ketentuan Komunitas</label>
                <textarea
                  name="rules"
                  placeholder="Ketentuan kehadiran, jadwal pertemuan, dll..."
                  value={formData.rules}
                  onChange={handleInputChange}
                  className="modal-textarea"
                  rows={2}
                />
              </div>

              <div className="modal-actions-row">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingGroup(null);
                  }}
                  className="btn-modal-cancel"
                >
                  Batal
                </button>
                <button type="submit" className="btn-modal-submit">
                  {editingGroup ? 'Perbarui' : 'Simpan Komunitas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ToastContainer position="top-center" />
    </div>
  );
};

export default ManageGroups;
