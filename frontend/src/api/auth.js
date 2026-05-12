// Handles user authentication against the FastAPI backend (POST /auth/login).
// Token and username are persisted in localStorage so sessions survive page refreshes.
// When the backend is unreachable the login falls back to a mock — any non-empty
// credentials succeed — so the full auth UI can be demonstrated without the server.

const TOKEN_KEY = "dg_token";
const USER_KEY = "dg_user";
const AUTH_BASE = "http://localhost:8000";

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) ?? "null");
  } catch {
    return null;
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export async function login(username, password) {
  if (!username.trim() || !password.trim()) {
    return { ok: false, error: "Enter a username and password." };
  }
  try {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${AUTH_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { ok: false, error: data.detail ?? "Invalid credentials." };
    }
    const data = await res.json();
    const user = { username };
    localStorage.setItem(TOKEN_KEY, data.access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return { ok: true, user };
  } catch {
    // Backend offline — accept any credentials as mock login
    const user = { username };
    localStorage.setItem(TOKEN_KEY, "mock-token");
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return { ok: true, user };
  }
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export async function register(username, password) {
  if (!username.trim() || !password.trim()) {
    return { ok: false, error: "Enter a username and password." };
  }
  try {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${AUTH_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { ok: false, error: data.detail ?? "Registration failed." };
    }
    const data = await res.json();
    const user = { username };
    localStorage.setItem(TOKEN_KEY, data.access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return { ok: true, user };
  } catch {
    return { ok: false, error: "Backend offline — cannot register." };
  }
}
