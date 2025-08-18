// src/components/ManageGroups.js
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { toast, ToastContainer } from 'react-toastify';
import './ManageGroups.css';
import api from './api/API'
import {
  getAllGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  removeMemberFromGroup,
  getGroupMembers,
  searchMembersByName,
  addMemberToGroup,
} from './api/API'; // Updated import

const ManageGroups = () => {
  const [groups, setGroups] = useState([]);
  const [groupMembers, setGroupMembers] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rules: '',
  });
  const [showAddMembersModal, setShowAddMembersModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [showBroadcastModal_all, setShowBroadcastModal_all] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [selectedGroupIdForBroadcast, setSelectedGroupIdForBroadcast] = useState(null);

  useEffect(() => {
    fetchGroups();
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

    if (groups.length > 0) {
      fetchMembersForGroups();
    }
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

    const handleEdit = (group) => {
    setFormData({
      name: group.name,
      description: group.description,
      rules: group.rules,
    });
    setEditingGroup(group);
    setShowModal(true);
  };

  const handleRemoveMember = async (groupId, memberId) => {
    try {
      await removeMemberFromGroup(groupId, memberId);
      toast.success('Member removed!');
      fetchGroups();
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
        const res = await searchMembersByName(query);
        if (res.data.length === 0) {
          setSearchResults([]);
          Swal.fire({
            icon: 'info',
            title: 'No results found',
            text: 'No members match the search query.',
          });
        } else {
          setSearchResults(res.data);
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setSearchResults([]);
          Swal.fire({
            icon: 'info',
            title: 'No members found',
            text: 'There are no members that match your search.',
          });
        } else {
          console.error('Error during search:', error);
          Swal.fire({
            icon: 'error',
            title: 'Search Error',
            text: error.response?.data?.message || 'An error occurred while searching for members.',
          });
        }
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleAddMemberToGroup = async () => {
    if (!selectedMember) return;

    try {
      await addMemberToGroup(editingGroup._id, selectedMember._id);
      closeAddMembersModal();
      fetchGroups();
      Swal.fire('Success', 'Member added to group!', 'success');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        Swal.fire({
          icon: 'warning',
          title: 'Already in Group',
          text: `${selectedMember.fullName} is already a member of this group.`,
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error Adding Member',
          text: error.response?.data?.message || 'Something went wrong while adding the member.',
        });
        console.error('Add member error:', error);
      }
    }
  };

  const handleInputChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      description: formData.description,
      rules: formData.rules,
    };

    try {
      if (editingGroup) {
        await updateGroup(editingGroup._id, payload);
        toast.success('Group updated successfully!');
      } else {
        await createGroup(payload);
        toast.success('Group created successfully!');
      }
      setFormData({ name: '', description: '', rules: '' });
      setEditingGroup(null);
      setShowModal(false);
      fetchGroups();
    } catch (error) {
      console.error('Error saving group:', error);
      toast.error(error.response?.data?.message || 'Failed to save group.');
    }
  };

  const handleDelete = async (groupId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This will delete the group permanently!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      try {
        await deleteGroup(groupId);
        fetchGroups();
        Swal.fire('Deleted!', 'The group has been removed.', 'success');
      } catch (error) {
        console.error('Error deleting group:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Failed to delete group.',
        });
      }
    }
  };

  const handleSendBroadcast = async () => {
    if (!broadcastMessage.trim()) {
      toast.error('Broadcast message cannot be empty.');
      return;
    }

    try {
      const payload = {
        message: broadcastMessage,
        targetGroups: [selectedGroupIdForBroadcast],
      };
      await api.post('/api/broadcast-messages', payload);
      toast.success('Broadcast sent successfully!');
      setBroadcastMessage('');
      setShowBroadcastModal(false);
    } catch (error) {
      console.error('Broadcast sending failed:', error);
      toast.error(error.response?.data?.message || 'Failed to send broadcast.');
    }
  };

  const handleSendBroadcast_all = async () => {
    if (!broadcastMessage.trim()) {
      toast.error('Broadcast message cannot be empty.');
      return;
    }

    try {
      const payload = {
        message: broadcastMessage,
        targetGroups: [], // Empty array for all groups
      };
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
      const response = await api.get('/api/broadcast-messages');
      if (response.data && response.data.length > 0) {
        const filteredLogs = response.data.filter(
          (log) =>
            log.targetGroups.length === 0 || // Broadcast to all groups
            (Array.isArray(log.targetGroups) && log.targetGroups.includes(groupId))
        );

        if (filteredLogs.length === 0) {
          return Swal.fire({
            icon: 'info',
            title: 'No Logs for Selected Group',
            text: 'There are no broadcast logs for this group yet.',
          });
        }

        const logsHtml = filteredLogs
          .map(
            (log) => `
          <li style="margin-bottom: 8px;">
            <strong>📨 ${log.message}</strong><br/>
            <small>🕒 ${new Date(log.createdAt).toLocaleString()}</small><br/>
            <span style="color: ${log.targetGroups.length === 0 ? 'green' : 'blue'};">
              ${log.targetGroups.length === 0 ? '🌍 Sent to all groups' : '👥 Sent to this group'}
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
        Swal.fire({
          icon: 'info',
          title: 'No Broadcast Logs Found',
          text: 'There are no broadcast logs available at the moment.',
        });
      }
    } catch (error) {
      console.error('Error fetching broadcast logs:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'An error occurred while fetching the broadcast logs.',
      });
    }
  };

  const closeAddMembersModal = () => {
    setShowAddMembersModal(false);
    setSearchQuery('');
    setSearchResults([]);
    setSelectedMember(null);
  };

  return (
    <div className="page-flow-manage-groups">
      <div className="">
        <h2 className="">📚 Admin Komunitas</h2>
        <button
          onClick={() => {
            setFormData({ name: '', description: '', rules: '' });
            setEditingGroup(null);
            setShowModal(true);
          }}
          className="button-manage"
        >
          ➕ Buat Komunitas
        </button>
        <button
          onClick={() => {
            setShowBroadcastModal_all(true);
          }}
          className="button-member-manage"
        >
          📢 Pesan
        </button>
      </div>

      {/* Group List */}
      <div className="container-list-member">
        {groups.map((group) => (
          <div key={group._id} className="member-card-grup">
            <div className="Member-text-top">{group.name}</div>
            <p className="Member-text">{group.description}</p>
            <p className="Member-text">📝 Rules: {group.rules}</p>
            <div className="Member-text">
              👥 Members:
              <ul>
                {(groupMembers[group._id] || []).map((member) => (
                  <li key={member._id}>
                    {member.fullName} - ({member.phoneNumber})
                    <button
                      className="remove-member-group"
                      onClick={() => handleRemoveMember(group._id, member._id)}
                    >
                      X
                    </button>
                  </li>
                ))}
                {groupMembers[group._id]?.length === 0 && <li>No members</li>}
              </ul>
            </div>

            <button
              onClick={() => {
                setEditingGroup(group);
                setShowAddMembersModal(true);
              }}
              className="button-member-manage"
            >
              ➕ Tambah
            </button>
            <button
              onClick={() => {
                setSelectedGroupIdForBroadcast(group._id);
                setShowBroadcastModal(true);
              }}
              className="button-member-manage"
            >
              📢 Pesan
            </button>
            <button
              type="button"
              onClick={() => fetchBroadcastLogs(group._id)}
              style={{ fontWeight: '650' }}
              className="button-member-manage"
            >
              📝 History
            </button>
            <div>
              <button
                onClick={() => handleEdit(group)}
                className="button-member-manage"
              >
                ✏️ Edit
              </button>
              <button
                onClick={() => handleDelete(group._id)}
                className="button-member-manage"
              >
                🗑️ Hapus
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
                    className={`search-result-group-item ${
                      selectedMember && selectedMember._id === member._id ? 'selected-member' : ''
                    }`}
                    onClick={() => {
                      setSelectedMember(member);
                      setSearchQuery(member.fullName);
                    }}
                  >
                    <p>{member.fullName}</p>
                  </div>
                );
              })}
            </div>
            <div>
              <button
                type="button"
                onClick={() => setShowAddMembersModal(false)}
                className="button-modal-groups"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddMemberToGroup}
                className="button-modal-groups"
                disabled={!selectedMember}
              >
                Add to Group
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div className="modal-backdrop-groups">
          <div className="modal-container-groups">
            <h3 className="text-xl font-semibold mb-4">Send Broadcast Message</h3>
            <textarea
              placeholder="Type your broadcast message here..."
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              className="input-search"
            />
            <div>
              <button
                type="button"
                onClick={() => setShowBroadcastModal(false)}
                className="button-member-manage-modal"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendBroadcast}
                className="button-member-manage-modal"
                disabled={!broadcastMessage.trim()}
              >
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
            <h3 className="text-xl font-semibold mb-4">Send Broadcast Message to All Groups</h3>
            <textarea
              placeholder="Type your broadcast message here..."
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              className="input-search"
            />
            <div>
              <button
                type="button"
                onClick={() => setShowBroadcastModal_all(false)}
                className="button-member-manage-modal"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendBroadcast_all}
                className="button-member-manage-modal"
                disabled={!broadcastMessage.trim()}
              >
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
            <h3 className="text-xl font-semibold mb-4">
              {editingGroup ? 'Edit Group' : 'Create Group'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Group Name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className=""
              />
              <textarea
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleInputChange}
                className=""
              />
              <textarea
                name="rules"
                placeholder="Group Rules"
                value={formData.rules}
                onChange={handleInputChange}
                className=""
              />
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingGroup(null);
                  }}
                  className="button-modal-groups"
                >
                  Cancel
                </button>
                <button type="submit" className="button-modal-groups">
                  {editingGroup ? 'Update' : 'Create'}
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