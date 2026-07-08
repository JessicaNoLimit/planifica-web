import { env } from '../config/env.js';

const GROQ_CHAT_COMPLETIONS_URL = 'https://api.groq.com/openai/v1/chat/completions';

const PRIORITY_ORDER = { alta: 0, media: 1, baja: 2 };

function normalizeTextList(value) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item).trim()).filter(Boolean);
}

function normalizeDateKey(value) {
  if (!value) return null;
  if (typeof value !== 'string') return null;
  return value.slice(0, 10);
}

function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function compareTasks(a, b) {
  const priorityDiff =
    (PRIORITY_ORDER[a.prioridad] ?? 99) - (PRIORITY_ORDER[b.prioridad] ?? 99);
  if (priorityDiff !== 0) return priorityDiff;

  if (a.fecha && b.fecha) {
    const dateDiff = String(a.fecha).localeCompare(String(b.fecha));
    if (dateDiff !== 0) return dateDiff;
  } else if (a.fecha) {
    return -1;
  } else if (b.fecha) {
    return 1;
  }

  return String(a.titulo || '').localeCompare(String(b.titulo || ''), 'es', {
    sensitivity: 'base'
  });
}

function compareAppointments(a, b) {
  const dateDiff = String(a.fecha || '').localeCompare(String(b.fecha || ''));
  if (dateDiff !== 0) return dateDiff;
  return String(a.hora || '').localeCompare(String(b.hora || ''));
}

function buildPlanContext(tasks, appointments) {
  const todayKey = getTodayKey();
  const sortedTasks = [...tasks].filter((task) => task.estado !== 'completada').sort(compareTasks);
  const overdueTasks = sortedTasks.filter((task) => normalizeDateKey(task.fecha) && task.fecha < todayKey);
  const todayTasks = sortedTasks.filter((task) => normalizeDateKey(task.fecha) === todayKey);
  const upcomingAppointments = [...appointments]
    .filter((appointment) => appointment.estado !== 'completada')
    .sort(compareAppointments);
  const pastAppointments = upcomingAppointments.filter(
    (appointment) => normalizeDateKey(appointment.fecha) && appointment.fecha < todayKey
  );
  const activeAppointments = upcomingAppointments.filter(
    (appointment) => !normalizeDateKey(appointment.fecha) || appointment.fecha >= todayKey
  );
  const topTask = sortedTasks[0] || null;
  const topAppointment = activeAppointments[0] || null;

  return {
    todayKey,
    overdueTasks,
    todayTasks,
    pastAppointments,
    activeAppointments,
    topTask,
    topAppointment,
    totalOpenItems: sortedTasks.length + activeAppointments.length
  };
}

function makeTaskTitle(task) {
  if (!task) return '';
  const title = String(task.titulo || '').trim();
  return title || 'la tarea más importante';
}

function makeAppointmentTitle(appointment) {
  if (!appointment) return '';
  const title = String(appointment.titulo || '').trim();
  return title || 'una cita pendiente';
}

function expandMainPriority(planValue, context) {
  const raw = String(planValue || '').trim();
  const lower = raw.toLowerCase();
  if (raw.length >= 20 && !['alta', 'media', 'baja'].includes(lower)) {
    return raw;
  }

  const taskTitle = makeTaskTitle(context.topTask);
  const appointmentTitle = makeAppointmentTitle(context.topAppointment);

  if (context.overdueTasks.length > 0) {
    return `Tu prioridad principal hoy es poner al día ${taskTitle} antes de avanzar con el resto de tareas.`;
  }

  if (taskTitle && appointmentTitle) {
    return `Tu prioridad principal hoy es cerrar ${taskTitle} y dejar margen antes de ${appointmentTitle}.`;
  }

  if (taskTitle) {
    return `Tu prioridad principal hoy es terminar ${taskTitle} antes de dedicar tiempo a tareas secundarias.`;
  }

  if (appointmentTitle) {
    return `Tu prioridad principal hoy es organizarte en torno a ${appointmentTitle} y usar el hueco libre para cerrar tareas cortas.`;
  }

  return 'Tu prioridad principal hoy es avanzar en la tarea de mayor impacto y evitar dispersarte con temas secundarios.';
}

function expandWarnings(warnings, context) {
  const items = normalizeTextList(warnings);
  const normalized = [];

  for (const warning of items) {
    const lower = warning.toLowerCase();
    if (lower.length < 18 || ['alto', 'media', 'baja', 'mucho trabajo', 'cuidado'].includes(lower)) {
      continue;
    }
    normalized.push(warning.endsWith('.') ? warning : `${warning}.`);
  }

  if (context.overdueTasks.length > 0) {
    const overdueNames = context.overdueTasks.slice(0, 2).map((task) => makeTaskTitle(task));
    const suffix = overdueNames.length
      ? `, especialmente ${overdueNames.join(' y ')}`
      : '';
    normalized.unshift(
      `Tienes ${context.overdueTasks.length} tarea${context.overdueTasks.length > 1 ? 's' : ''} vencida${context.overdueTasks.length > 1 ? 's' : ''}${suffix}. Revísalas hoy y decide cuáles debes cerrar o replanificar.`
    );
  }

  if (context.pastAppointments.length > 0) {
    normalized.push(
      `Tienes ${context.pastAppointments.length} cita${context.pastAppointments.length > 1 ? 's' : ''} pasada${context.pastAppointments.length > 1 ? 's' : ''} pendiente${context.pastAppointments.length > 1 ? 's' : ''} de revisar o archivar.`
    );
  }

  if (context.totalOpenItems >= 10) {
    normalized.push(
      'La carga de hoy es alta: prioriza solo lo esencial y pospone lo que no aporte valor inmediato.'
    );
  }

  if (normalized.length === 0) {
    return ['Sin incidencias destacables, pero conviene mantener foco en las tareas más relevantes.'];
  }

  return normalized;
}

function expandMotivationalTip(planValue, context, mainPriority) {
  const raw = String(planValue || '').trim();
  const lower = raw.toLowerCase();
  if (raw.length >= 45 && !lower.includes('no te desanimes') && !lower.includes('animo')) {
    return raw.endsWith('.') ? raw : `${raw}.`;
  }

  const taskTitle = makeTaskTitle(context.topTask);

  if (taskTitle) {
    return `Ya tienes claro el foco del día. Empieza por ${taskTitle} y evita cambiar varias veces de contexto antes de completar el primer bloque.`;
  }

  if (mainPriority) {
    return `Ya tienes claro el foco del día. Empieza por lo que más impacto tenga y protege ese bloque de trabajo hasta cerrarlo.`;
  }

  return 'Ya tienes claro el foco del día. Empieza por la tarea de mayor impacto y evita cambiar varias veces de contexto.';
}

function normalizePlan(plan, context) {
  return {
    summary: String(plan?.summary || '').trim(),
    main_priority: expandMainPriority(plan?.main_priority, context),
    work_order: normalizeTextList(plan?.work_order),
    warnings: expandWarnings(plan?.warnings, context),
    motivational_tip: expandMotivationalTip(plan?.motivational_tip, context, plan?.main_priority)
  };
}

export async function generateDailyPlan({ userName, todayLabel, tasks, appointments }) {
  if (!env.groq.apiKey) {
    const error = new Error('Falta configurar GROQ_API_KEY en el backend.');
    error.status = 500;
    throw error;
  }

  if (!env.groq.model) {
    const error = new Error('Falta configurar GROQ_MODEL en el backend.');
    error.status = 500;
    throw error;
  }

  const systemPrompt = [
    'Eres un asistente de productividad personal.',
    'Analizas tareas y citas para planificar un solo dia de forma breve, clara y accionable.',
    'Responde siempre en espanol.',
    'Devuelve SOLO JSON valido y nada mas.',
    'No inventes tareas ni citas.',
    'Si faltan datos, propone una priorizacion prudente.',
    'El tono debe ser profesional, natural y util.',
    'main_priority debe ser una frase completa y humana, no solo una etiqueta como alta o media.',
    'warnings debe contener recomendaciones accionables sobre elementos vencidos, citas pasadas o carga excesiva.',
    'motivational_tip debe sonar como un asistente de productividad y evitar frases genericas.'
  ].join(' ');

  const userPrompt = [
    `Usuario: ${userName || 'sin nombre'}`,
    `Fecha actual: ${todayLabel}`,
    'Objetivo del formato:',
    '- summary: resumen breve del dia en una o dos frases.',
    '- main_priority: frase util con la prioridad principal del dia.',
    '- work_order: lista corta con el orden recomendado de trabajo.',
    '- warnings: avisos accionables, especialmente si hay tareas vencidas, citas pasadas o sobrecarga.',
    '- motivational_tip: consejo profesional, concreto y humano.',
    `Tareas: ${JSON.stringify(tasks)}`,
    `Citas: ${JSON.stringify(appointments)}`,
    'Devuelve exactamente esta estructura JSON:',
    '{',
    '  "summary": "resumen breve del dia",',
    '  "main_priority": "frase humana y util sobre la prioridad principal",',
    '  "work_order": ["paso 1", "paso 2", "paso 3"],',
    '  "warnings": ["aviso accionable 1"],',
    '  "motivational_tip": "consejo breve, natural y profesional"',
    '}',
    'Si detectas tareas vencidas, montalas en warnings con una recomendacion clara.',
    'Si detectas citas pasadas sin revisar, indicalo en warnings con una accion concreta.',
    'No uses frases vacias como no te desanimes.'
  ].join('\n');

  const response = await fetch(GROQ_CHAT_COMPLETIONS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.groq.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: env.groq.model,
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      temperature: 0.2,
      response_format: {
        type: 'json_object'
      }
    })
  });

  if (!response.ok) {
    let details = '';

    try {
      details = await response.text();
    } catch {
      details = '';
    }

    const error = new Error(
      `Groq respondio con error ${response.status}${details ? `: ${details}` : ''}`
    );
    error.status = 502;
    throw error;
  }

  let payload;

  try {
    payload = await response.json();
  } catch {
    const error = new Error('No se pudo leer la respuesta de Groq.');
    error.status = 502;
    throw error;
  }

  const content = payload?.choices?.[0]?.message?.content;

  if (!content) {
    const error = new Error('Groq no devolvio contenido util.');
    error.status = 502;
    throw error;
  }

  let parsedPlan;

  try {
    parsedPlan = typeof content === 'string' ? JSON.parse(content) : content;
  } catch {
    const error = new Error('Groq devolvio un JSON invalido.');
    error.status = 502;
    throw error;
  }

  return normalizePlan(parsedPlan, buildPlanContext(tasks, appointments));
}
