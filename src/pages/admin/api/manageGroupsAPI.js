// src/admin/manageGroups.js
import api from './API';

// ✅ Create a new group
export const createGroup = (groupData) => api.post('/api/groups', groupData);

// ✅ Get all groups
export const getAllGroups = () => api.get('/api/groups');

// ✅ Get group by ID
export const getGroupById = (groupId) => api.get(`/api/groups/${groupId}`);

// ✅ Update group info
export const updateGroup = (groupId, updatedData) =>
  api.put(`/api/groups/${groupId}`, updatedData);

// ✅ Delete a group
export const deleteGroup = (groupId) => api.delete(`/api/groups/${groupId}`);

// ✅ Add member to group
export const addMemberToGroup = (groupId, memberId) =>
  api.post(`/api/groups/${groupId}/add-member`, { memberId });

// ✅ Remove member from group
export const removeMemberFromGroup = (groupId, memberId) =>
  api.put(`/api/groups/${groupId}/remove-member`, { memberId });

// ✅ Get members in a group
export const getGroupMembers = (groupId) =>
  api.get(`/api/groups/${groupId}/members`);

// Correct function to search members by name
export const searchMembersByNameinGroups = (groupId, searchQuery) => {
  return api.get(`/api/groups/${groupId}/members/search/${searchQuery}`);
};

// API call to search members
export const searchMembersByName = (memberName) =>
  api.get(`/api/members/search/${memberName}`); // Adjust to hit the correct route

