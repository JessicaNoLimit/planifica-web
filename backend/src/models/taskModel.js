import { pool } from '../config/db.js';

export async function listTasks(userId) {
  const [rows] = await pool.query(
    'SELECT * FROM tasks WHERE user_id = ? ORDER BY COALESCE(fecha, created_at) ASC, created_at DESC',
    [userId]
  );
  return rows;
}

export async function findTaskById(userId, id) {
  const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [id, userId]);
  return rows[0] || null;
}

export async function createTask(userId, task) {
  const estado = task.estado || 'pendiente';
  const isFavorite = Boolean(task.is_favorite);
  const completedAt = estado === 'completada' ? new Date() : null;

  const [result] = await pool.query(
    `INSERT INTO tasks
     (user_id, titulo, descripcion, prioridad, estado, fecha, is_favorite, completed_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      task.titulo,
      task.descripcion || null,
      task.prioridad || 'media',
      estado,
      task.fecha || null,
      isFavorite,
      completedAt
    ]
  );
  return findTaskById(userId, result.insertId);
}

export async function updateTask(userId, id, task) {
  const currentTask = await findTaskById(userId, id);
  if (!currentTask) return null;

  const nextTask = {
    titulo: task.titulo ?? currentTask.titulo,
    descripcion: task.descripcion ?? currentTask.descripcion,
    prioridad: task.prioridad ?? currentTask.prioridad,
    estado: task.estado ?? currentTask.estado,
    fecha: task.fecha ?? currentTask.fecha,
    is_favorite: task.is_favorite ?? currentTask.is_favorite
  };

  const completedAt =
    nextTask.estado === 'completada'
      ? currentTask.completed_at || new Date()
      : null;

  await pool.query(
    `UPDATE tasks
     SET titulo = ?,
         descripcion = ?,
         prioridad = ?,
         estado = ?,
         fecha = ?,
         is_favorite = ?,
         completed_at = ?
     WHERE id = ? AND user_id = ?`,
    [
      nextTask.titulo,
      nextTask.descripcion || null,
      nextTask.prioridad,
      nextTask.estado,
      nextTask.fecha || null,
      Boolean(nextTask.is_favorite),
      completedAt,
      id,
      userId
    ]
  );
  return findTaskById(userId, id);
}

export async function deleteTask(userId, id) {
  const [result] = await pool.query('DELETE FROM tasks WHERE id = ? AND user_id = ?', [id, userId]);
  return result.affectedRows > 0;
}
