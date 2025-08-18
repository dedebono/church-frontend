import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import api from '../pages/admin/api/API'; // adjust path if different

const SocketCtx = createContext(null);

const getToken = () => {
  const fromAxios = (api?.defaults?.headers?.common?.Authorization || '')
    .replace(/^Bearer\s+/,'').replace(/^"|"$/g,'');
  const keys = ['adminToken','memberToken','token'];
  let t = fromAxios;
  for (const k of keys) if (!t) t = (localStorage.getItem(k)||'').replace(/^"|"$/g,'');
  return t;
};

const getURL = () =>
  (api?.defaults?.baseURL) || process.env.REACT_APP_API_URL;

export function SocketProvider({ children }) {
  const socketRef = useRef(null);
  const [status, setStatus] = useState('disconnected'); // connected | connecting | error | disconnected
  const [transport, setTransport] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
  const raw = (api?.defaults?.baseURL) || process.env.REACT_APP_API_URL || window.location.origin;
  const u = new URL(raw, window.location.origin);
  const ORIGIN = `${u.protocol}//${u.host}`;


  const s = io(ORIGIN, {
    path: '/socket.io', 
    transports: ['websocket', 'polling'],
    withCredentials: true,
    auth: { token: getToken() },
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    timeout: 20000,
  });
    socketRef.current = s;

    s.on('connect', () => {
      setStatus('connected');
      setTransport(s.io.engine.transport.name || '');
      setError('');
      console.log('[socket] connected', { uri: s.io.uri, transport: s.io.engine.transport.name });
    });
    s.on('disconnect', () => setStatus('disconnected'));
    s.on('reconnect_attempt', () => setStatus('connecting'));
    s.on('reconnect', () => setStatus('connected'));
    s.on('connect_error', (e) => { setStatus('error'); setError(e?.message || 'connect_error'); });
    s.on('error', (e) => { setStatus('error'); setError(e?.message || 'error'); });
    return () => { try { s.disconnect(); } catch {} socketRef.current = null; };
  }, []);

  const apiFns = useMemo(() => ({
    status, transport, error,
    socket: () => socketRef.current,
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
    leaveGroup: (groupId) => { const s = socketRef.current; if (s) s.emit('leave', { groupId }); },
    sendText: (groupId, text) => { const s = socketRef.current; if (s) s.emit('chat:send', { groupId, type: 'text', text }); },
    markRead: (groupId, messageIds) => { const s = socketRef.current; if (s) s.emit('chat:read', { groupId, messageIds }); },
    setTyping: (groupId, isTyping) => { const s = socketRef.current; if (s) s.emit('chat:typing', { groupId, isTyping }); },
    on: (event, handler) => { const s = socketRef.current; if (s) s.on(event, handler); },
    off: (event, handler) => { const s = socketRef.current; if (s) s.off(event, handler); },
  }), [status, transport, error]);

  return <SocketCtx.Provider value={apiFns}>{children}</SocketCtx.Provider>;
}

export const useSocket = () => useContext(SocketCtx);
