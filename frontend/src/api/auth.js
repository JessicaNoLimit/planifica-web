import { apiFetch } from './client.js';

export function registerUser(payload) {
  return apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function loginUser(payload) {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function verifyEmail(token) {
  return apiFetch(`/auth/verify-email/${encodeURIComponent(token)}`);
}

export function requestPasswordReset(payload) {
  return apiFetch('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function resetPassword(token, password) {
  return apiFetch(`/auth/reset-password/${encodeURIComponent(token)}`, {
    method: 'POST',
    body: JSON.stringify({ password })
  });
}

export function getCurrentUser() {
  return apiFetch('/auth/me');
}

export function updatePreferences(payload) {
  return apiFetch('/auth/preferences', {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
}
