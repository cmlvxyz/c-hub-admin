// src/service/adminApi.ts
// Admin frontend API client for the shared C-HUB backend.
// - Bootstraps an admin session on load (POST /api/auth/admin/bootstrap).
// - Stores the token in localStorage (key: chub_admin_token).
// - adminFetch() auto-attaches the Authorization header to every request.
// - adminSSEUrl() passes the token via ?token= for EventSource.

const env: Record<string, any> =
  typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {};

// Same-origin by default (/api is rewritten to the serverless function on
// Vercel, and proxied to the backend during local dev). Override with VITE_API_URL.
export const API_BASE = (env.VITE_API_URL || '').replace(/\/+$/, '');

export const ADMIN_TOKEN_KEY = 'chub_admin_token';

export const getAdminToken = (): string | null => {
  try {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setAdminToken = (token: string) => {
  try {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
  } catch {
    /* storage unavailable */
  }
};

export const clearAdminToken = () => {
  try {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  } catch {
    /* storage unavailable */
  }
};

export const apiUrl = (path: string): string => `${API_BASE}${path}`;

// Bootstraps (or refreshes) the admin session. Always called on load so a fresh
// Turso-persisted session token is available before any adminFetch call.
export const bootstrapAdminSession = async (): Promise<{
  token: string;
  role: string;
  user: any;
} | null> => {
  try {
    const res = await fetch(apiUrl('/api/auth/admin/bootstrap'), { method: 'POST' });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data?.token) {
      setAdminToken(data.token);
      return { token: data.token, role: data.role, user: data.user };
    }
    clearAdminToken();
    console.warn('Admin bootstrap failed:', data?.error || `HTTP ${res.status}`);
    return null;
  } catch (err) {
    clearAdminToken();
    console.warn('Admin bootstrap error:', err);
    return null;
  }
};

// Wraps fetch(url) and attaches the admin bearer token automatically.
export const adminFetch = (url: string, init: RequestInit = {}): Promise<Response> => {
  const headers = new Headers(init.headers || {});
  const token = getAdminToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  return fetch(url, { ...init, headers });
};

// SSE URL with the token as a query param (EventSource cannot set headers).
export const adminSSEUrl = (path: string): string => {
  const token = getAdminToken();
  const sep = path.includes('?') ? '&' : '?';
  return `${API_BASE}${path}${token ? `${sep}token=${encodeURIComponent(token)}` : ''}`;
};