import { listAppointments } from '../models/appointmentModel.js';
import { listTasks } from '../models/taskModel.js';
import { generateDailyPlan } from '../services/groqService.js';

const TASK_LIMIT = 12;
const APPOINTMENT_LIMIT = 8;

const TASK_PRIORITY_WEIGHT = {
  alta: 0,
  media: 1,
  baja: 2
};

function formatTodayLabel() {
  return new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'full'
  }).format(new Date());
}

function compareTasksForPlan(a, b) {
  const completedDiff = Number(a.estado === 'completada') - Number(b.estado === 'completada');
  if (completedDiff !== 0) return completedDiff;

  const favoriteDiff = Number(Boolean(b.is_favorite)) - Number(Boolean(a.is_favorite));
  if (favoriteDiff !== 0) return favoriteDiff;

  const priorityDiff =
    (TASK_PRIORITY_WEIGHT[a.prioridad] ?? 99) - (TASK_PRIORITY_WEIGHT[b.prioridad] ?? 99);
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

function compareAppointmentsForPlan(a, b) {
  const dateDiff = String(a.fecha || '').localeCompare(String(b.fecha || ''));
  if (dateDiff !== 0) return dateDiff;

  const timeDiff = String(a.hora || '').localeCompare(String(b.hora || ''));
  if (timeDiff !== 0) return timeDiff;

  return String(a.titulo || '').localeCompare(String(b.titulo || ''), 'es', {
    sensitivity: 'base'
  });
}

function compactTask(task) {
  return {
    id: task.id,
    titulo: task.titulo,
    descripcion: task.descripcion || '',
    prioridad: task.prioridad || 'media',
    estado: task.estado || 'pendiente',
    fecha: task.fecha || null,
    is_favorite: Boolean(task.is_favorite),
    completed_at: task.completed_at || null
  };
}

function compactAppointment(appointment) {
  return {
    id: appointment.id,
    titulo: appointment.titulo,
    descripcion: appointment.descripcion || '',
    fecha: appointment.fecha || null,
    hora: appointment.hora || null,
    estado: appointment.estado || 'programada',
    completed_at: appointment.completed_at || null
  };
}

export async function getDailyPlan(req, res, next) {
  try {
    const [tasks, appointments] = await Promise.all([
      listTasks(req.user.id),
      listAppointments(req.user.id)
    ]);

    const prioritizedTasks = [...tasks].sort(compareTasksForPlan).slice(0, TASK_LIMIT).map(compactTask);
    const prioritizedAppointments = [...appointments]
      .filter((appointment) => appointment.estado !== 'completada')
      .sort(compareAppointmentsForPlan)
      .slice(0, APPOINTMENT_LIMIT)
      .map(compactAppointment);

    const plan = await generateDailyPlan({
      userName: req.user.email,
      todayLabel: formatTodayLabel(),
      tasks: prioritizedTasks,
      appointments: prioritizedAppointments
    });

    return res.json(plan);
  } catch (err) {
    console.error('Error generating daily plan:', err);
    return res.status(err.status || 502).json({
      message: err.message || 'No se pudo generar el plan con IA.'
    });
  }
}
