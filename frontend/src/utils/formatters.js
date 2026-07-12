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

function pad(value) {
  return String(value).padStart(2, '0');
}

function parseDateKey(value) {
  if (!value) return null;

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return {
      year: value.getFullYear(),
      month: value.getMonth() + 1,
      day: value.getDate()
    };
  }

  if (typeof value !== 'string') return null;

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!year || !month || !day) return null;
  return { year, month, day };
}

function parseTimeKey(value) {
  if (!value || typeof value !== 'string') return null;

  const match = value.match(/^(\d{2}):(\d{2})(?::(\d{2}))?/);
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;

  return { hours, minutes };
}

function formatDateParts(parts) {
  if (!parts) return '';
  return `${pad(parts.day)}/${pad(parts.month)}/${parts.year}`;
}

function formatTimeParts(parts) {
  if (!parts) return '';
  return `${pad(parts.hours)}:${pad(parts.minutes)}`;
}

function formatMadridDateTime(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';

  try {
    const dateFormatter = new Intl.DateTimeFormat('es-ES', {
      timeZone: 'Europe/Madrid',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const timeFormatter = new Intl.DateTimeFormat('es-ES', {
      timeZone: 'Europe/Madrid',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    return `${dateFormatter.format(date)} · ${timeFormatter.format(date)}`;
  } catch {
    const fallbackDate = `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
    const fallbackTime = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
    return `${fallbackDate} · ${fallbackTime}`;
  }
}

export function formatSpanishDateShort(value) {
  const parts = parseDateKey(value);
  if (!parts) return value || '';
  return formatDateParts(parts);
}

export function formatSpanishDateLong(value) {
  const parts = parseDateKey(value);
  if (!parts) return value || '';
  return `${parts.day} de ${MONTHS_LONG[parts.month - 1]} de ${parts.year}`;
}

export function formatSpanishTime(value) {
  if (!value) return '';

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return `${pad(value.getHours())}:${pad(value.getMinutes())}`;
  }

  if (typeof value === 'string') {
    const timeParts = parseTimeKey(value);
    if (timeParts) return formatTimeParts(timeParts);
  }

  return String(value).slice(0, 5);
}

export function formatSpanishDateTime(value, timeValue = '') {
  if (!value && !timeValue) return '';

  if (timeValue) {
    const dateText = formatSpanishDateShort(value);
    const timeText = formatSpanishTime(timeValue);
    if (dateText && timeText) {
      return `${dateText} · ${timeText}`;
    }
    return dateText || timeText;
  }

  if (value instanceof Date) {
    return formatMadridDateTime(value);
  }

  if (typeof value === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return formatDateParts(parseDateKey(value));
    }

    if (/^\d{2}:\d{2}(:\d{2})?$/.test(value)) {
      return formatSpanishTime(value);
    }

    const parsedDate = new Date(value);
    if (!Number.isNaN(parsedDate.getTime())) {
      return formatMadridDateTime(parsedDate);
    }
  }

  return String(value || '').trim();
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
