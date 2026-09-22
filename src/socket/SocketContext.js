import React, {
  createContext, useContext, useEffect,
  useMemo, useRef, useState
} from 'react';
import { io } from 'socket.io-client';
import api from '../pages/admin/api/API'; // adjust path if needed

const SocketCtx = createContext(null);

// Get token from axios headers or localStorage
const getToken = () => {
  const fromAxios = (api?.defaults?.headers?.common?.Authorization || '')
    .replace(/^Bearer\s+/, '')
    .replace(/^"|"$/g, '');
  const keys = ['adminToken', 'memberToken', 'token'];
  let t = fromAxios;
  for (const k of keys) {
    if (!t) t = (localStorage.getItem(k) || '').replace(/^"|"$/g, '');
  }
  return t;
};

// Save token after login
const setToken = (token) => {
  if (!token) return;
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
  localStorage.setItem('adminToken', token);
};

// Resolve the correct socket server origin, ensuring we never try to connect to localhost:5000 on production
const resolveSocketOrigin = () => {
  // 1. Explicit socket URL if configured
  const explicit = process.env.REACT_APP_SOCKET_URL;
  if (explicit && !explicit.includes('localhost:5000') && !explicit.includes('127.0.0.1:5000')) {
    return explicit.trim().replace(/\/+$/, '');
  }

  // 2. Production or dev backends
  const backendsStr =
    process.env.NODE_ENV === 'production'
      ? (process.env.REACT_APP_PROD_BACKENDS || process.env.REACT_APP_DEV_BACKENDS)
      : (process.env.REACT_APP_DEV_BACKENDS || process.env.REACT_APP_PROD_BACKENDS);

  if (backendsStr) {
    const list = backendsStr
      .split(',')
      .map((s) => s.trim().replace(/\/+$/, ''))
      .filter((s) => Boolean(s) && !s.includes('localhost:5000') && !s.includes('127.0.0.1:5000'));
    if (list.length > 0) {
      return list[0];
    }
  }

  // 3. API URL if valid remote URL (never localhost:5000)
  const apiUrl = process.env.REACT_APP_API_URL;
  if (apiUrl && !apiUrl.includes('localhost:5000') && !apiUrl.includes('127.0.0.1:5000')) {
    try {
      const u = new URL(apiUrl, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
      return `${u.protocol}//${u.host}`;
    } catch {}
  }

  // 4. Default to live remote backend server
  return 'https://server2.dedebono.uk';
};

export function SocketProvider({ children }) {
  const socketRef = useRef(null);
  const [status, setStatus] = useState('disconnected');
  const [transport, setTransport] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const ORIGIN = resolveSocketOrigin();

    const s = io(ORIGIN, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      withCredentials: true,
      auth: { token: getToken() },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      timeout: 10000,
    });
    socketRef.current = s;

    s.on('connect', () => {
      setStatus('connected');
      setTransport(s.io?.engine?.transport?.name || '');
      setError('');
    });
    s.on('disconnect', () => setStatus('disconnected'));
    s.on('reconnect_attempt', () => setStatus('connecting'));
    s.on('reconnect', () => setStatus('connected'));
    s.on('connect_error', (e) => {
      setStatus('error');
      setError(e?.message || 'connect_error');
      console.warn('[Socket] Connection attempt issue:', e?.message || e);
    });
    s.on('error', (e) => {
      setStatus('error');
      setError(e?.message || 'error');
      console.warn('[Socket] Socket issue:', e?.message || e);
    });

    return () => {
      try { s.disconnect(); } catch {}
      socketRef.current = null;
    };
  }, []);

  const apiFns = useMemo(() => ({
    status, transport, error,
    socket: () => socketRef.current,
    setToken, // expose helper for login flow
    reconnect: () => {
      const s = socketRef.current; if (!s) return;
      s.auth = { token: getToken() }; // refresh token before reconnect
      setStatus('connecting');
      s.connect();
    },
    joinGroup: (groupId) => {
      const s = socketRef.current; if (!s) return;
      const join = () => s.emit('join', { groupId });
      s.connected ? join() : s.once('connect', join);
    },
    leaveGroup: (groupId) => {
      const s = socketRef.current; if (s) s.emit('leave', { groupId });
    },
    sendText: (groupId, text) => {
      const s = socketRef.current; if (s) s.emit('chat:send', { groupId, type: 'text', text });
    },
    markRead: (groupId, messageIds) => {
      const s = socketRef.current; if (s) s.emit('chat:read', { groupId, messageIds });
    },
    setTyping: (groupId, isTyping) => {
      const s = socketRef.current; if (s) s.emit('chat:typing', { groupId, isTyping });
    },
    on: (event, handler) => {
      const s = socketRef.current; if (s) s.on(event, handler);
    },
    off: (event, handler) => {
      const s = socketRef.current; if (s) s.off(event, handler);
    },
  }), [status, transport, error]);

  return <SocketCtx.Provider value={apiFns}>{children}</SocketCtx.Provider>;
}

export const useSocket = () => useContext(SocketCtx);
