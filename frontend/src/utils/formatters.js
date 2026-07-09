const MONTHS_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const MONTHS_LONG = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre'
];

function parseDateKey(value) {
  if (!value || typeof value !== 'string') return null;
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  if (!year || !month || !day) return null;
  return { year, month, day };
}

export function formatSpanishDateShort(value) {
  const parts = parseDateKey(value);
  if (!parts) return value || '';
  return `${parts.day} ${MONTHS_SHORT[parts.month - 1]} ${parts.year}`;
}

export function formatSpanishDateLong(value) {
  const parts = parseDateKey(value);
  if (!parts) return value || '';
  return `${parts.day} de ${MONTHS_LONG[parts.month - 1]} de ${parts.year}`;
}

export function formatSpanishTime(value) {
  if (!value) return '';
  return String(value).slice(0, 5);
}

export function formatTaskStatus(value) {
  const map = {
    pendiente: 'Pendiente',
    en_progreso: 'En progreso',
    completada: 'Completada'
  };

  return map[value] || value || '';
}

export function formatPriorityLabel(value) {
  const map = {
    alta: 'Alta',
    media: 'Media',
    baja: 'Baja'
  };

  return map[value] || value || '';
}
