import { apiFetch } from './client.js';

export function fetchTasks() {
  return apiFetch('/tasks');
}

export function createTask(payload) {
  return apiFetch('/tasks', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function updateTask(id, payload) {
  return apiFetch(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export function deleteTask(id) {
  return apiFetch(`/tasks/${id}`, { method: 'DELETE' });
}
