// API.js
import axios from 'axios';
import {
  initialEvents,
  initialSermons,
  initialGallery,
  getCachedOrFallback,
  setCacheData
} from './fallbackData';

const devBackends = process.env.REACT_APP_DEV_BACKENDS;
const prodBackends = process.env.REACT_APP_PROD_BACKENDS;
const defaultApiUrl = process.env.REACT_APP_API_URL;

const rawBackends =
  process.env.NODE_ENV === 'production'
    ? (prodBackends || devBackends || defaultApiUrl)
    : (devBackends || prodBackends || defaultApiUrl);

// Resolve backends list based on environment
const resolveBackends = () => {
  const isBrowser = typeof window !== 'undefined';
  const hostname = isBrowser ? window.location.hostname : '';
  const isDevPreview = hostname.includes('run.app') || hostname === 'localhost' || hostname === '127.0.0.1';

  // Remote production backend
  const defaultRemote = 'https://server2.dedebono.uk';

  const configuredList = (rawBackends || '')
    .split(',')
    .map((url) => url.trim().replace(/\/+$/, ''))
    .filter((url) => Boolean(url) && !url.includes('localhost:5000') && !url.includes('127.0.0.1:5000'));

  if (isDevPreview) {
    // In dev container / AI Studio preview (run.app / localhost), requests route through setupProxy.js
    // to bypass browser CORS limitations on run.app.
    return ['', ...configuredList, defaultRemote].filter((v, i, a) => a.indexOf(v) === i);
  }

  // On production (e.g. https://mlbchurch.dedebono.uk), server2.dedebono.uk is directly
  // accessible and explicitly permits mlbchurch.dedebono.uk in its CORS whitelist.
  // The primary backend MUST be https://server2.dedebono.uk.
  const primaryRemotes = configuredList.length > 0 ? configuredList : [defaultRemote];
  return [...primaryRemotes, defaultRemote, ''].filter((v, i, a) => a.indexOf(v) === i);
};

let backends = resolveBackends();
let activeBackendIndex = 0;


// Create Axios instance
const api = axios.create({
  baseURL: backends[activeBackendIndex],
  timeout: 20000,
});

// Request Interceptor: Add JWT token
api.interceptors.request.use((config) => {
  const pick = (k) => (localStorage.getItem(k) || '').replace(/^"|"$/g, '');
  const token =
    (config.headers?.Authorization || '')
      .replace(/^Bearer\s+/, '') ||
    pick('adminToken') || pick('memberToken') || pick('token');

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Helper to check for invalid HTML responses on API endpoints
const isHtmlResponse = (response) => {
  const contentType = response?.headers?.['content-type'] || '';
  if (contentType.includes('text/html')) return true;
  if (typeof response?.data === 'string') {
    const trimmed = response.data.trim();
    if (trimmed.startsWith('<!doctype') || trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html')) {
      return true;
    }
  }
  return false;
};

// ---- Response interceptor: fallback + 401 one-time replay
api.interceptors.response.use(
  (response) => {
    // If an API request received an HTML page (static host SPA rewrite of missing /api route),
    // treat it as an invalid response and switch to remote backend
    if (isHtmlResponse(response) && response.config?.url?.startsWith('/api') && activeBackendIndex < backends.length - 1) {
      console.warn('[API] Received HTML instead of JSON for API route, switching to fallback backend...');
      activeBackendIndex++;
      api.defaults.baseURL = backends[activeBackendIndex];
      const newConfig = {
        ...response.config,
        baseURL: backends[activeBackendIndex],
        _switchedToFallback: true
      };
      return api.request(newConfig);
    }
    return response;
  },
  async (error) => {
    const config = error.config || {};
    const rsp = error.response;
    const isNetworkError = !rsp;
    const isServerError = rsp?.status >= 500;
    const isUnauthorized = rsp?.status === 401;

    // 1) Switch to fallback on network/5xx (avoid loops)
    if ((isNetworkError || isServerError)
      && activeBackendIndex < backends.length - 1
      && !config._switchedToFallback) {

      console.warn(`[API] Backend ${backends[activeBackendIndex]} failed, switching to ${backends[activeBackendIndex + 1]}…`);
      activeBackendIndex++;
      api.defaults.baseURL = backends[activeBackendIndex];

      // mark and replay against fallback
      config._switchedToFallback = true;
      config.baseURL = backends[activeBackendIndex];

      // ensure Authorization is set for the replay
      const pick = (k) => (localStorage.getItem(k) || '').replace(/^"|"$/g, '');
      const t = pick('adminToken') || pick('memberToken') || pick('token');
      if (t) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${t}`;
      }
      return api.request(config);
    }

    // 2) If 401 and this request had no/empty token header, attach and retry ONCE
    if (isUnauthorized && !config._retriedWithToken) {
      const hasBearer = !!config.headers?.Authorization;
      const bearerVal = (config.headers?.Authorization || '').replace(/^Bearer\s+/, '');
      const missingOrEmpty = !hasBearer || !bearerVal;

      if (missingOrEmpty) {
        const pick = (k) => (localStorage.getItem(k) || '').replace(/^"|"$/g, '');
        const t = pick('adminToken') || pick('memberToken') || pick('token');
        if (t) {
          config._retriedWithToken = true;
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${t}`;
          return api.request(config);
        }
      }
    }

    return Promise.reject(error);
  }
);

const ensureValidArray = (data, cacheKey, fallback) => {
  if (Array.isArray(data)) {
    if (data.length > 0) setCacheData(cacheKey, data);
    return data;
  }
  return getCachedOrFallback(cacheKey, fallback);
};

//API SERMONS

export const getSermons = async () => {
  try {
    const response = await api.get("/api/sermons");
    return ensureValidArray(response.data, 'sermons', initialSermons);
  } catch (error) {
    console.warn("Could not fetch live sermons, using cached/fallback data:", error?.message);
    return getCachedOrFallback('sermons', initialSermons);
  }
};

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

//Api Broadcast Messages
// 📢 BROADCAST MESSAGES API
export const getBroadcastMessages = async () => {
  try {
    const response = await api.get("/api/broadcast-messages");
    return response.data;
  } catch (error) {
    console.warn("Could not fetch live broadcast messages:", error?.message);
    return [];
  }
};

export const deleteBroadcastMessage = async (id) => {
  try {
    const response = await api.delete(`/api/broadcast-messages/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting broadcast message:", error);
    throw error;
  }
};


//events API
export const getEvents = async () => {
  try {
    const response = await api.get("/api/events/");
    return ensureValidArray(response.data, 'events', initialEvents);
  } catch (error) {
    console.warn("Could not fetch live events, using cached/fallback data:", error?.message);
    return getCachedOrFallback('events', initialEvents);
  }
};

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
    return ensureValidArray(response.data, 'gallery', initialGallery);
  } catch (error) {
    console.warn("Could not fetch live gallery photos, using cached/fallback data:", error?.message);
    return getCachedOrFallback('gallery', initialGallery);
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

// API Finance
// 💰 FINANCE API

export const getFinanceSummary = async (year, month) => {
  try {
    const response = await api.get(`/api/finance/summary?year=${year}&month=${month}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching finance summary:", error);
    throw error;
  }
};

export const getTransactions = async (params) => {
  try {
    const query = new URLSearchParams(params).toString();
    const response = await api.get(`/api/finance/transactions?${query}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw error;
  }
};

export const createTransaction = async (transactionData) => {
  try {
    const response = await api.post('/api/finance/transactions', transactionData);
    return response.data;
  } catch (error) {
    console.error("Error creating transaction:", error);
    throw error;
  }
};


export const deleteTransaction = async (id) => {
  try {
    const response = await api.delete(`/api/finance/transactions/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting transaction:", error);
    throw error;
  }
};


// ⬇️ API functions
export const importMembers = (membersData) =>
  api.post('/api/members/import', membersData);

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

//managegroups
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
export const fetchTotalMembers = () =>
  api.get("/api/members/count").then((res) => res.data.count);

export const fetchTotalGroups = () =>
  api.get("/api/groups/count").then((res) => res.data.count);

export const fetchTotalFamilies = () =>
  api.get("/api/families/count").then((res) => res.data.count);

export const fetchTotalAttendance = () =>
  api.get("/api/attendance/count").then((res) => res.data.count);

export const fetchAttendanceTrends = async () => {
  try {
    const response = await api.get("/api/attendance/trends");
    return response.data;
  } catch (error) {
    console.error("Error fetching attendance trends:", error);
    return [];
  }
};

// Birthday API
export const getTodaysBirthdays = async () => {
  try {
    const response = await api.get("/api/members/birthdays/today");
    return response.data;
  } catch (error) {
    console.error("Error fetching today's birthdays:", error);
    // For testing purposes, return mock data if API fails
    if (window.getTodaysBirthdays) {
      return await window.getTodaysBirthdays();
    }
    throw error;
  }
};

export default api;
