import { apiFetch } from './client.js';

export function generateDailyPlan() {
  return apiFetch('/ai/daily-plan', {
    method: 'POST'
  });
}
