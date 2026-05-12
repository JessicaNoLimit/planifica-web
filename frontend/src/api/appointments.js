import { apiFetch } from './client.js';

export function fetchAppointments() {
  return apiFetch('/appointments');
}

export function createAppointment(payload) {
  return apiFetch('/appointments', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function updateAppointment(id, payload) {
  return apiFetch(`/appointments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export function deleteAppointment(id) {
  return apiFetch(`/appointments/${id}`, { method: 'DELETE' });
}
