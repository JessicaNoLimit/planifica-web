import { formatSpanishTime } from './formatters.js';

function normalizeDateKey(value) {
  if (!value || typeof value !== 'string') return '';
  const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : '';
}

function compareCalendarEvents(a, b) {
  const dateDiff = String(a.dateKey || '').localeCompare(String(b.dateKey || ''));
  if (dateDiff !== 0) return dateDiff;

  if (a.type !== b.type) {
    return a.type === 'appointment' ? -1 : 1;
  }

  const timeDiff = String(a.time || '').localeCompare(String(b.time || ''));
  if (timeDiff !== 0) return timeDiff;

  return String(a.title || '').localeCompare(String(b.title || ''), 'es', {
    sensitivity: 'base'
  });
}

function buildTaskEvent(task) {
  const dateKey = normalizeDateKey(task.fecha);
  if (!dateKey) return null;

  return {
    id: `task-${task.id}`,
    dateKey,
    type: 'task',
    title: task.titulo,
    meta: 'Tarea',
    priority: task.prioridad,
    status: task.estado,
    description: task.descripcion,
    isFavorite: Boolean(task.is_favorite),
    completedAt: task.completed_at,
    time: '',
    sortKey: `1-${dateKey}-${task.titulo || ''}`
  };
}

function buildAppointmentEvent(appointment) {
  const dateKey = normalizeDateKey(appointment.fecha);
  if (!dateKey) return null;

  return {
    id: `appointment-${appointment.id}`,
    dateKey,
    type: 'appointment',
    title: appointment.titulo,
    meta: appointment.hora ? formatSpanishTime(appointment.hora) : 'Cita',
    time: appointment.hora || '',
    description: appointment.descripcion,
    status: appointment.estado,
    completedAt: appointment.completed_at,
    isFavorite: false,
    priority: '',
    sortKey: `0-${dateKey}-${appointment.hora || '99:99'}-${appointment.titulo || ''}`
  };
}

export function buildCalendarEvents(tasks = [], appointments = []) {
  return [...appointments.map(buildAppointmentEvent), ...tasks.map(buildTaskEvent)]
    .filter(Boolean)
    .sort(compareCalendarEvents);
}

export function groupCalendarEventsByDate(tasks = [], appointments = []) {
  return buildCalendarEvents(tasks, appointments).reduce((acc, event) => {
    const entry = acc[event.dateKey] || {
      events: [],
      taskCount: 0,
      appointmentCount: 0
    };

    entry.events.push(event);
    if (event.type === 'task') {
      entry.taskCount += 1;
    } else if (event.type === 'appointment') {
      entry.appointmentCount += 1;
    }

    acc[event.dateKey] = entry;
    return acc;
  }, {});
}

export { normalizeDateKey };
