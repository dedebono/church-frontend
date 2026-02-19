// src/components/ManageGroups.js
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { toast, ToastContainer } from 'react-toastify';
import './ManageGroups.css';
import api from './api/API'; // Keep this for general API calls like broadcast and messages

// Import all group-related API functions from manageGroupsAPI.js
import {
  getAllGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  removeMemberFromGroup,
  getGroupMembers,
  searchMembersByName, // This one is also in API.js, but manageGroupsAPI.js is more specific for group context
  addMemberToGroup,
} from './api/manageGroupsAPI'; // Changed from './api/API' to './api/manageGroupsAPI'
import {
  Mail,
  Clock,
  Globe,
  Users,
  RefreshCw,
  Plus,
  Megaphone,
  FileText,
  Edit2,
  Trash2,
  MessageCircle,
} from "lucide-react";

// ⬇️ use the shared socket
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

  // Chat UI state (modal uses shared socket)
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatGroup, setChatGroup] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatText, setChatText] = useState('');

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    // If userId is stored in your socket context or global state
    const currentUserId = "user_id_from_context_or_local_storage"; // Replace with actual logic to get user ID
    setUserId(currentUserId);
  }, []);

  useEffect(() => {
    const fetchMembersForGroups = async () => {
      const membersByGroup = {};
      for (const group of groups) {
        try {
          // Using getGroupMembers from manageGroupsAPI.js
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
      // Using getAllGroups from manageGroupsAPI.js
      const res = await getAllGroups();
      setGroups(res.data);
    } catch (err) {
      console.error('Error fetching groups:', err);
      toast.error('Failed to fetch groups.');
    }
  };

  const fetchMessagesFromBackend = async (groupId) => {
    try {
      // Using general api instance for messages
      const response = await api.get('/api/admin/messages', {
        params: { groupId: groupId, page: 1, limit: 50 }
      });
      const messages = (response.data.items || []).slice().reverse();  // Reverse to show most recent on top
      setChatMessages(messages);
    } catch (e) {
      console.error('Failed to load history:', e);
    }
  };


  const handleEdit = (group) => {
    setFormData({ name: group.name, description: group.description, rules: group.rules });
    setEditingGroup(group);
    setShowModal(true);
  };

  const handleRemoveMember = async (groupId, memberId) => {
    try {
      // Using removeMemberFromGroup from manageGroupsAPI.js
      await removeMemberFromGroup(groupId, memberId);
      toast.success('Member removed!');
      fetchGroups(); // Re-fetch groups to update member list
    } catch (error) {
      console.error('Failed to remove member:', error);
      toast.error('Failed to remove member.');
    }
  };

  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setSelectedMember(null);

    if (query.length > 2) {
      try {
        // Using searchMembersByName from manageGroupsAPI.js (or API.js, both are fine here)
        const res = await searchMembersByName(query);
        if (res.data.length === 0) {
          setSearchResults([]);
          Swal.fire({ icon: 'info', title: 'No results found', text: 'No members match the search query.' });
        } else {
          setSearchResults(res.data);
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setSearchResults([]);
          Swal.fire({ icon: 'info', title: 'No members found', text: 'There are no members that match your search.' });
        } else {
          console.error('Error during search:', error);
          Swal.fire({ icon: 'error', title: 'Search Error', text: error.response?.data?.message || 'gagal mencari' });
        }
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleAddMemberToGroup = async () => {
    if (!selectedMember) return;
    try {
      // Using addMemberToGroup from manageGroupsAPI.js
      await addMemberToGroup(editingGroup._id, selectedMember._id);
      closeAddMembersModal();
      fetchGroups(); // Re-fetch groups to update member list
      Swal.fire('Success', 'Member added to group!', 'success');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        Swal.fire({ icon: 'warning', title: 'Already in Group', text: `${selectedMember.fullName} is already a member of this group.` });
      } else {
        Swal.fire({ icon: 'error', title: 'Error Adding Member', text: error.response?.data?.message || 'Something went wrong while adding the member.' });
        console.error('Add member error:', error);
      }
    }
  };

  const handleInputChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { name: formData.name, description: formData.description, rules: formData.rules };
    try {
      if (editingGroup) {
        // Using updateGroup from manageGroupsAPI.js
        await updateGroup(editingGroup._id, payload);
        toast.success('Group updated successfully!');
      } else {
        // Using createGroup from manageGroupsAPI.js
        await createGroup(payload);
        toast.success('Group created successfully!');
      }
      setFormData({ name: '', description: '', rules: '' });
      setEditingGroup(null);
      setShowModal(false);
      fetchGroups(); // Re-fetch groups to update the list
    } catch (error) {
      console.error('Error saving group:', error);
      toast.error(error.response?.data?.message || 'Failed to save group.');
    }
  };

  const handleDelete = async (groupId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Yakin menghapus?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      try {
        // Using deleteGroup from manageGroupsAPI.js
        await deleteGroup(groupId);
        fetchGroups(); // Re-fetch groups to update the list
        Swal.fire('Deleted!', 'Berhasil dihapus', 'success');
      } catch (error) {
        console.error('Error deleting group:', error);
        Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || 'Gagal menghapus grup.' });
      }
    }
  };

  const handleSendBroadcast = async () => {
    if (!broadcastMessage.trim()) return toast.error('Pesan broadcast tidak boleh kosong');
    try {
      const payload = { message: broadcastMessage, targetGroups: [selectedGroupIdForBroadcast] };
      // Using general api instance for broadcast messages
      await api.post('/api/broadcast-messages', payload);
      toast.success('Pesan Broadcast terkirim');
      setBroadcastMessage('');
      setShowBroadcastModal(false);
    } catch (error) {
      console.error('Broadcast sending failed:', error);
      toast.error(error.response?.data?.message || 'Pesan broadcast gagal');
    }
  };

  const handleSendBroadcast_all = async () => {
    if (!broadcastMessage.trim()) return toast.error('Broadcast message cannot be empty.');
    try {
      const payload = {
        message: broadcastMessage,
        targetGroups: [], // Empty array for all groups
      };
      // Using general api instance for broadcast messages
      await api.post('/api/broadcast-messages', payload);
      toast.success('Broadcast sent successfully!');
      setBroadcastMessage('');
      setShowBroadcastModal_all(false);
    } catch (error) {
      console.error('Broadcast sending failed:', error);
      toast.error(error.response?.data?.message || 'Failed to send broadcast.');
    }
  };

  const fetchBroadcastLogs = async (groupId) => {
    try {
      // Using general api instance for broadcast messages
      const response = await api.get('/api/broadcast-messages');
      if (response.data && response.data.length > 0) {
        const filteredLogs = response.data.filter(
          (log) => log.targetGroups.length === 0 || (Array.isArray(log.targetGroups) && log.targetGroups.includes(groupId))
        );

        if (filteredLogs.length === 0) {
          return Swal.fire({ icon: 'info', title: 'No Logs for Selected Group', text: 'There are no broadcast logs for this group yet.' });
        }

        const logsHtml = filteredLogs
          .map(
            (log) => `
          <li style="margin-bottom: 8px;">
            <strong><Mail size={14} style={{ display: 'inline' }}/> ${log.message}</strong><br/>
            <small><Clock size={12} style={{ display: 'inline' }}/> ${new Date(log.createdAt).toLocaleString()}</small><br/>
            <span style="color: ${log.targetGroups.length === 0 ? 'green' : 'blue'};">
              ${log.targetGroups.length === 0 ? '<Globe size={14} style={{ display: "inline" }}/> Terkirim ke semua komunitas' : '<Users size={14} style={{ display: "inline" }}/> Terkirim ke komunitas ini'}
            </span>
          </li>
        `
          )
          .join('');

        Swal.fire({
          title: 'Broadcast Logs for Group',
          html: `<ul style="text-align:left; padding-left: 20px;">${logsHtml}</ul>`,
          width: 600,
          showCloseButton: true,
          confirmButtonText: 'Close',
        });
      } else {
        Swal.fire({ icon: 'info', title: 'No Broadcast Logs Found', text: 'There are no broadcast logs available at the moment.' });
      }
    } catch (error) {
      console.error('Error fetching broadcast logs:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || 'An error occurred while fetching the broadcast logs.' });
    }
  };

  const closeAddMembersModal = () => {
    setShowAddMembersModal(false);
    setSearchQuery('');
    setSearchResults([]);
    setSelectedMember(null);
  };

  // ---- Chat modal helpers using shared socket ----
  const openChat = async (group) => {
    setChatGroup(group);
    setShowChatModal(true);
    fetchMessagesFromBackend(group._id);
    try {
      // Using general api instance for messages
      const { data } = await api.get('/api/admin/messages', {
        params: { groupId: group._id, page: 1, limit: 50 }
      });
      // admin API returns { items, total, ... } sorted DESC
      const msgs = (data.items || []).slice().reverse();
      setChatMessages(msgs);
    } catch (e) {
      console.error('Failed to load history:', e);
    }

    joinGroup(group._id);
  };

  const closeChat = () => {
    if (chatGroup?._id) leaveGroup(chatGroup._id);
    setChatMessages([]);
    setChatText('');
    setShowChatModal(false);
    setChatGroup(null);
  };

  const sendChatMessage = () => {
    const text = chatText.trim();
    if (!text || !chatGroup) return;
    sendText(chatGroup._id, text);
    setChatText('');
  };

  useEffect(() => {
    if (!showChatModal || !chatGroup) return;

    const handleNew = (msg) => {
      const gid = msg.group || msg.groupId;

      if (String(gid) === String(chatGroup._id)) {
        setChatMessages((prev) => [...prev, msg]);
      } else {
      }
    };

    on('message:new', handleNew);
    return () => {
      off('message:new', handleNew);
    };
  }, [showChatModal, chatGroup, on, off]);

  return (
    <div className="page-flow-manage-groups">
      <div className="">
        <h2 className="">📚 Admin Komunitas</h2>

        {/* Socket status badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '8px 0 16px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 10px',
              borderRadius: 999,
              fontWeight: 600,
              background:
                status === 'connected' ? '#e6ffed' :
                  status === 'connecting' ? '#fff7e6' :
                    status === 'error' ? '#ffecec' : '#f2f2f2',
              border:
                status === 'connected' ? '1px solid #b7eb8f' :
                  status === 'connecting' ? '1px solid #ffe58f' :
                    status === 'error' ? '1px solid #ffa39e' : '1px solid #ddd'
            }}
            title={error || ''}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background:
                  status === 'connected' ? '#52c41a' :
                    status === 'connecting' ? '#faad14' :
                      status === 'error' ? '#f5222d' : '#8c8c8c'
              }}
            />
            {status.toUpperCase()}{status === 'connected' && transport ? ` (${transport})` : ''}
          </span>
          <button className="button-member-manage" onClick={reconnect}><RefreshCw size={14} className="inline-icon" /> Reconnect</button>

          <button
            onClick={() => {
              setFormData({ name: '', description: '', rules: '' });
              setEditingGroup(null);
              setShowModal(true);
            }}
            className="button-manage"
          >
            <Plus size={14} className="inline-icon" /> Buat Komunitas
          </button>
          <button onClick={() => setShowBroadcastModal_all(true)} className="button-member-manage">
            <Megaphone size={14} className="inline-icon" /> Broadcast
          </button>
        </div>
      </div>

      {/* Group List */}
      <div className="container-list-member">
        {groups.map((group) => (
          <div key={group._id} className="member-card-grup">
            <div className="Member-text-top">{group.name}</div>
            <p className="Member-text">{group.description}</p>
            <p className="Member-text"><FileText size={14} className="inline-icon" /> Rules: {group.rules}</p>
            <div className="Member-text">
              <Users size={14} className="inline-icon" /> Members:
              <ul>
                {(groupMembers[group._id] || []).map((member) => (
                  <li key={member._id}>
                    {member.fullName} - ({member.phoneNumber})
                    <button className="remove-member-group" onClick={() => handleRemoveMember(group._id, member._id)}>X</button>
                  </li>
                ))}
                {groupMembers[group._id]?.length === 0 && <li>No members</li>}
              </ul>
            </div>

            <button
              onClick={() => { setEditingGroup(group); setShowAddMembersModal(true); }}
              className="button-member-manage"
            >
              <Plus size={14} className="inline-icon" /> Anggota
            </button>
            <button
              onClick={() => { setSelectedGroupIdForBroadcast(group._id); setShowBroadcastModal(true); }}
              className="button-member-manage"
            >
              <Megaphone size={14} className="inline-icon" /> Broadcast
            </button>
            <button
              type="button"
              onClick={() => fetchBroadcastLogs(group._id)}
              style={{ fontWeight: '650' }}
              className="button-member-manage"
            >
              <FileText size={14} className="inline-icon" /> BC Log
            </button>
            <div>
              <button onClick={() => handleEdit(group)} className="button-member-manage"><Edit2 size={14} className="inline-icon" /> Edit</button>
              <button onClick={() => handleDelete(group._id)} className="button-member-manage"><Trash2 size={14} className="inline-icon" /> Hapus</button>
              <button onClick={() => openChat(group)} className="button-member-manage" style={{ fontWeight: 650 }}>
                <MessageCircle size={14} className="inline-icon" /> Chat
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Members Modal */}
      {showAddMembersModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add Members to {editingGroup?.name}</h3>
            <input
              type="text"
              placeholder="Search member by name"
              value={selectedMember ? selectedMember.fullName : searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedMember(null);
                handleSearchChange(e);
              }}
            />
            <div className="search-results-group">
              {searchResults.map((member, index) => {
                if (!member || !member._id) return null;
                return (
                  <div
                    key={member._id || index}
                    className={`search-result-group-item ${selectedMember && selectedMember._id === member._id ? 'selected-member' : ''}`}
                    onClick={() => { setSelectedMember(member); setSearchQuery(member.fullName); }}
                  >
                    <p>{member.fullName}</p>
                  </div>
                );
              })}
            </div>
            <div>
              <button type="button" onClick={() => setShowAddMembersModal(false)} className="button-modal-groups">Cancel</button>
              <button type="button" onClick={handleAddMemberToGroup} className="button-modal-groups" disabled={!selectedMember}>Add to Group</button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {showChatModal && chatGroup && (
        <div className="modal-backdrop-groups">
          <div className="modal-container-groups" style={{ maxWidth: 640 }}>
            <h3 className="text-xl font-semibold mb-2">Chat — {chatGroup.name}
              <button onClick={() => fetchMessagesFromBackend(chatGroup._id)} style={{ margin: '10px' }}>
                <RefreshCw size={14} />
              </button></h3>


            {/* Chat Messages Container */}
            <div style={{
              height: 300, overflowY: 'auto',
              border: '1px solid #eee',
              borderRadius: 8,
              padding: 12,
              marginBottom: 12,
              background: '#fafafa',
              display: 'flex',
              flexDirection: 'column-reverse'
            }}>
              {chatMessages.length === 0 && (
                <div style={{ opacity: 0.7, fontSize: 14 }}>
                  No messages yet. Say hi 👋
                </div>
              )}

              {chatMessages.map((m) => (
                <div
                  key={m._id || Math.random()}
                  style={{
                    marginBottom: 8,
                    display: 'flex',
                    justifyContent: m.sender === userId ? 'flex-end' : 'flex-start',
                  }}
                >
                  {/* Message Bubble */}
                  <div
                    style={{
                      maxWidth: '70%', // Restrict bubble width
                      padding: '8px 12px',
                      borderRadius: 12,
                      backgroundColor: m.sender === userId ? '#dcf8c6' : '#ddddddff', // Green for sender, white for receiver
                      boxShadow: m.sender === userId ? '0 2px 5px rgba(0, 0, 0, 0.1)' : 'none', // Add shadow for sender
                      fontWeight: 500,
                      display: 'inline-block',
                    }}
                  >
                    {/* Sender Full Name and Timestamp */}
                    <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4, textAlign: m.sender === userId ? 'right' : 'left', }}>
                      {m.fullName || 'Unknown'} •{' '}
                      {m.createdAt ? new Date(m.createdAt).toLocaleString() : ''}
                    </div>

                    {/* Message Content */}
                    <div style={{ marginTop: 6 }}>
                      {m.type === 'image' ? (
                        <img
                          src={m.image}
                          alt="message-image"
                          style={{ maxWidth: '100%', borderRadius: 8 }}
                        />
                      ) : (
                        m.text || '(non-text message)'
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className="input-search"
                placeholder="Type a message…"
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
                onKeyDown={(e) => (e.key === 'Enter' ? sendChatMessage() : null)}
                style={{ flex: 1, padding: '8px 12px', borderRadius: 12, border: '1px solid #ccc' }}
              />
              <button
                className="button-member-manage-modal"
                onClick={sendChatMessage}
                disabled={!chatText.trim()}
                style={{ padding: '8px 12px', borderRadius: 12 }}
              >
                Send
              </button>
              <button
                className="button-member-manage-modal"
                onClick={closeChat}
                style={{ padding: '8px 12px', borderRadius: 12 }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div className="modal-backdrop-groups">
          <div className="modal-container-groups">
            <h3 className="text-xl font-semibold mb-4">Kirim pesan broadcast</h3>
            <textarea
              placeholder="Type your broadcast message here..."
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              className="input-search"
            />
            <div>
              <button type="button" onClick={() => setShowBroadcastModal(false)} className="button-member-manage-modal">Cancel</button>
              <button type="button" onClick={handleSendBroadcast} className="button-member-manage-modal" disabled={!broadcastMessage.trim()}>
                Send Broadcast
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast All Modal */}
      {showBroadcastModal_all && (
        <div className="modal-backdrop-groups">
          <div className="modal-container-groups">
            <h3 className="text-xl font-semibold mb-4">Pesan broadcast ke semua komunitas</h3>
            <textarea
              placeholder="Type your broadcast message here..."
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              className="input-search"
            />
            <div>
              <button type="button" onClick={() => setShowBroadcastModal_all(false)} className="button-member-manage-modal">Cancel</button>
              <button type="button" onClick={handleSendBroadcast_all} className="button-member-manage-modal" disabled={!broadcastMessage.trim()}>
                Send Broadcast
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Group Creation / Editing Modal */}
      {showModal && (
        <div className="modal-backdrop-groups">
          <div className="modal-container-groups">
            <h3 className="text-xl font-semibold mb-4">{editingGroup ? 'Edit Group' : 'Create Group'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" name="name" placeholder="Group Name" value={formData.name} onChange={handleInputChange} required />
              <textarea name="description" placeholder="Description" value={formData.description} onChange={handleInputChange} />
              <textarea name="rules" placeholder="Group Rules" value={formData.rules} onChange={handleInputChange} />
              <div>
                <button type="button" onClick={() => { setShowModal(false); setEditingGroup(null); }} className="button-modal-groups">Cancel</button>
                <button type="submit" className="button-modal-groups">{editingGroup ? 'Update' : 'Create'}</button>
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
