// API.js
import axios from 'axios';
export const API_BASE = `https://church-backend-no8q.onrender.com/`;

const api = axios.create({
  baseURL: API_BASE,
});

// Define importMembers function
export const importMembers = (membersData) => api.post('/api/members/import', membersData);

export default api;
export const getAllGroups = () => api.get('/api/groups');
export const AdminAttendance = ()=> api.get('/api/attendance')
export const searchMembersByName = (name) => api.get(`/api/members/search/${name}`);
export const registerFamily = (data) => api.post('/api/families', data);
export const getFamilyByName = (name) => api.get(`/api/families/${name}`);
export const updateMember = (memberIndex, data) =>
  api.put(`/api/members/${memberIndex}`, data);
export const getFamilyAll = () => api.get('api/families');
export const getFamilies = async () => {
  try {
    const response = await api.get('/api/families');
    return response.data;
  } catch (error) { 
    console.error('Error fetching families:', error);
    throw error;
  }
};
