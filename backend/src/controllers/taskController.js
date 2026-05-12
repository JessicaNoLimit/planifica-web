import {
  createTask,
  deleteTask,
  findTaskById,
  listTasks,
  updateTask
} from '../models/taskModel.js';

function validateTask(body) {
  if (!body.titulo) return 'El titulo es obligatorio';
  if (body.prioridad && !['baja', 'media', 'alta'].includes(body.prioridad)) {
    return 'Prioridad invalida';
  }
  if (body.estado && !['pendiente', 'en_progreso', 'completada'].includes(body.estado)) {
    return 'Estado invalido';
  }
  return null;
}

export async function getTasks(req, res, next) {
  try {
    const tasks = await listTasks(req.user.id);
    res.json({ tasks });
  } catch (err) {
    next(err);
  }
}

export async function getTask(req, res, next) {
  try {
    const task = await findTaskById(req.user.id, req.params.id);
    if (!task) return res.status(404).json({ message: 'Tarea no encontrada' });
    res.json({ task });
  } catch (err) {
    next(err);
  }
}

export async function postTask(req, res, next) {
  try {
    const error = validateTask(req.body);
    if (error) return res.status(400).json({ message: error });

    const task = await createTask(req.user.id, req.body);
    res.status(201).json({ task });
  } catch (err) {
    next(err);
  }
}

export async function putTask(req, res, next) {
  try {
    const error = validateTask(req.body);
    if (error) return res.status(400).json({ message: error });

    const task = await updateTask(req.user.id, req.params.id, req.body);
    if (!task) return res.status(404).json({ message: 'Tarea no encontrada' });
    res.json({ task });
  } catch (err) {
    next(err);
  }
}

export async function removeTask(req, res, next) {
  try {
    const deleted = await deleteTask(req.user.id, req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Tarea no encontrada' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
