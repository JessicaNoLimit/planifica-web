const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export function getToken() {
  return localStorage.getItem('planifica_token');
}

export function setToken(token) {
  localStorage.setItem('planifica_token', token);
}

export function clearToken() {
  localStorage.removeItem('planifica_token');
}

export async function apiFetch(path, options = {}) {
  const token = getToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });

  if (response.status === 204) return null;

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Error de comunicacion con el servidor');
  }

  return data;
}
