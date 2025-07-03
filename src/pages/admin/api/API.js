// API.js
import axios from 'axios';

// List of backends to failover between
const backends =
  process.env.NODE_ENV === 'development'
    ? ['https://server.dedebono.uk']
    : [
        'https://server.dedebono.uk', // primary
        'https://church-backend-no8q.onrender.com/',               // fallback
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

//API SERMONS

export const getSermons = async () => {
  try {
    const response = await api.get("/api/sermons")
    return response.data
  } catch (error) {
    console.error("Error fetching sermons:", error)
    throw error
  }
}

export const createSermon = async (sermonData) => {
  try {
    const response = await api.post("/api/sermons", sermonData)
    return response.data
  } catch (error) {
    console.error("Error creating sermon:", error)
    throw error
  }
}

export const updateSermon = async (id, sermonData) => {
  try {
    const response = await api.put(`/api/sermons/${id}`, sermonData)
    return response.data
  } catch (error) {
    console.error("Error updating sermon:", error)
    throw error
  }
}

export const deleteSermon = async (id) => {
  try {
    const response = await api.delete(`/api/sermons/${id}`)
    return response.data
  } catch (error) {
    console.error("Error deleting sermon:", error)
    throw error
  }
}

//events API
export const getEvents = async () => {
  try {
    const response = await api.get("/api/events/")
    return response.data
  } catch (error) {
    console.error("Error fetching events:", error)
    throw error
  }
}

export const createEvent = async (eventData) => {
  try {
    const response = await api.post("/api/events/", eventData)
    return response.data
  } catch (error) {
    console.error("Error creating events:", error)
    throw error
  }
}

export const updateEvent = async (id, eventData) => {
  try {
    const response = await api.put(`/api/events/${id}`, eventData)
    return response.data
  } catch (error) {
    console.error("Error updating events:", error)
    throw error
  }
}

export const deleteEvent = async (id) => {
  try {
    const response = await api.delete(`/api/events/${id}`)
    return response.data
  } catch (error) {
    console.error("Error deleting events:", error)
    throw error
  }
}

//PHOTO API
// 📸 Gallery API

export const getGalleryPhotos = async () => {
  try {
    const response = await api.get("/api/gallery");
    return response.data;
  } catch (error) {
    console.error("Error fetching gallery photos:", error);
    throw error;
  }
};

export const createGalleryPhoto = async (photoData) => {
  try {
    const response = await api.post("/api/gallery", photoData);
    return response.data;
  } catch (error) {
    console.error("Error creating gallery photo:", error);
    throw error;
  }
};

export const deleteGalleryPhoto = async (id) => {
  try {
    const response = await api.delete(`/api/gallery/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting gallery photo:", error);
    throw error;
  }
};


// ⬇️ API functions
export const importMembers = (membersData) =>
  api.post('/api/members/import', membersData);

export const getAllGroups = () =>
  api.get('/api/groups');

export const AdminAttendance = () =>
  api.get('/api/attendance');

export const SermonCMS = () =>
  api.get('/api/sermons');

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

// Health check function
export const healthCheck = async () => {
  try {
    const response = await api.get("/api/sermons", { timeout: 5000 })
    return {
      status: response.status,
      ok: response.status >= 200 && response.status < 300,
      backend: backends[activeBackendIndex],
      activeBackendIndex,
    }
  } catch (error) {
    return {
      status: error.response?.status || 0,
      ok: false,
      error: error.message,
      backend: backends[activeBackendIndex],
      activeBackendIndex,
    }
  }
}


export default api;
