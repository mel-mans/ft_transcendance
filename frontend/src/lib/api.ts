import API from './apiEndpoints';

export const AUTH_TOKEN_KEY = 'auth_token';

export function setAuthToken(token: string) {
  if (!token) {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  } else {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }
}

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

async function request(url: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  } as Record<string, string>;

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, { ...options, headers, credentials: 'include' });
    const text = await res.text();
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (e) {
      data = text;
    }

    if (!res.ok) {
      const msg = (data && (data.message || data.error || data.message?.[0])) || res.statusText || 'Request failed';
      const err: any = new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  } catch (err: any) {
    // Network or CORS error
    if (err instanceof TypeError && err.message === 'Failed to fetch') {
      const netErr = new Error('Network error: Unable to reach backend. Check server status or CORS.');
      netErr.status = 0;
      throw netErr;
    }
    throw err;
  }
}

export async function login(credentials: { email: string; password: string }) {
  return request(API.auth.login, { method: 'POST', body: JSON.stringify(credentials) });
}

export async function signup(payload: Record<string, any>) {
  return request(API.auth.signup, { method: 'POST', body: JSON.stringify(payload) });
}

export async function fetchCurrentUser() {
  // Try user management service first
  try {
    const data = await request(API.users.me, { method: 'GET' });
    return data;
  } catch (err) {
    // fallback to auth profile route
    try {
      const data = await request(API.auth.profile, { method: 'GET' });
      return data;
    } catch (e) {
      return null;
    }
  }
}

export default {
  login,
  signup,
  setAuthToken,
  getAuthToken,
  fetchCurrentUser,
  // add helper to clear token
  clearAuth: () => setAuthToken(''),
};
