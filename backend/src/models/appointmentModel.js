import { pool } from '../config/db.js';

export async function listAppointments(userId) {
  const { rows } = await pool.query(
    'SELECT * FROM appointments WHERE user_id = $1 ORDER BY fecha ASC, hora ASC',
    [userId]
  );
  return rows;
}

export async function findAppointmentById(userId, id) {
  const { rows } = await pool.query('SELECT * FROM appointments WHERE id = $1 AND user_id = $2', [id, userId]);
  return rows[0] || null;
}

export async function createAppointment(userId, appointment) {
  const estado = appointment.estado || 'programada';
  const completedAt = estado === 'completada' ? new Date() : null;

  const { rows } = await pool.query(
    `INSERT INTO appointments
     (user_id, titulo, descripcion, fecha, hora, estado, completed_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id`,
    [
      userId,
      appointment.titulo,
      appointment.descripcion || null,
      appointment.fecha,
      appointment.hora,
      estado,
      completedAt
    ]
  );
  return findAppointmentById(userId, rows[0].id);
}

export async function updateAppointment(userId, id, appointment) {
  const currentAppointment = await findAppointmentById(userId, id);
  if (!currentAppointment) return null;

  const nextAppointment = {
    titulo: appointment.titulo ?? currentAppointment.titulo,
    descripcion: appointment.descripcion ?? currentAppointment.descripcion,
    fecha: appointment.fecha ?? currentAppointment.fecha,
    hora: appointment.hora ?? currentAppointment.hora,
    estado: appointment.estado ?? currentAppointment.estado
  };

  const completedAt =
    nextAppointment.estado === 'completada'
      ? currentAppointment.completed_at || new Date()
      : null;

  await pool.query(
    `UPDATE appointments
     SET titulo = $1, descripcion = $2, fecha = $3, hora = $4, estado = $5, completed_at = $6
     WHERE id = $7 AND user_id = $8`,
    [
      nextAppointment.titulo,
      nextAppointment.descripcion || null,
      nextAppointment.fecha,
      nextAppointment.hora,
      nextAppointment.estado,
      completedAt,
      id,
      userId
    ]
  );
  return findAppointmentById(userId, id);
}

export async function deleteAppointment(userId, id) {
  const result = await pool.query('DELETE FROM appointments WHERE id = $1 AND user_id = $2', [id, userId]);
  return result.rowCount > 0;
}
