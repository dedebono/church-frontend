// API.js
import axios from 'axios';

// List of backends to failover between
const backends =
  process.env.NODE_ENV === 'development'
    ? ['https://server.dedebono.uk']
    : [
        'https://church-backend-no8q.onrender.com', // primary
        'https://server.dedebono.uk',               // fallback
      ];

let activeBackendIndex = 0;

// Create Axios instance
const api = axios.create({
  baseURL: backends[activeBackendIndex],
  timeout: 5000, // 5 seconds timeout to trigger faster failover
});

// Interceptor for automatic failover
api.interceptors.response.use(
  response => response,
  async error => {
    const isNetworkError = !error.response;
    const isServerError = error.response?.status >= 500;

    // Try fallback if available and not already switched
    if ((isNetworkError || isServerError) && activeBackendIndex === 0 && backends.length > 1) {
      console.warn('Primary backend failed, switching to fallback…');
      activeBackendIndex = 1;
      api.defaults.baseURL = backends[activeBackendIndex];

      // Retry the failed request on fallback
      return api.request(error.config);
    }

    return Promise.reject(error);
  }
);

// ⬇️ API functions
export const importMembers = (membersData) =>
  api.post('/api/members/import', membersData);

export const getAllGroups = () =>
  api.get('/api/groups');

export const AdminAttendance = () =>
  api.get('/api/attendance');

export const searchMembersByName = (name) =>
  api.get(`/api/members/search/${name}`);

export const registerFamily = (data) =>
  api.post('/api/families', data);

export const getFamilyByName = (name) =>
  api.get(`/api/families/${name}`);

export const updateMember = (memberIndex, data) =>
  api.put(`/api/members/${memberIndex}`, data);

export const getFamilyAll = () =>
  api.get('/api/families');

export const getFamilies = async () => {
  try {
    const response = await api.get('/api/families');
    return response.data;
  } catch (error) {
    console.error('Error fetching families:', error);
    throw error;
  }
};

export default api;
