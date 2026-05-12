import { pool } from '../config/db.js';

export async function listAppointments(userId) {
  const [rows] = await pool.query(
    'SELECT * FROM appointments WHERE user_id = ? ORDER BY fecha ASC, hora ASC',
    [userId]
  );
  return rows;
}

export async function findAppointmentById(userId, id) {
  const [rows] = await pool.query('SELECT * FROM appointments WHERE id = ? AND user_id = ?', [id, userId]);
  return rows[0] || null;
}

export async function createAppointment(userId, appointment) {
  const estado = appointment.estado || 'programada';
  const completedAt = estado === 'completada' ? new Date() : null;

  const [result] = await pool.query(
    `INSERT INTO appointments
     (user_id, titulo, descripcion, fecha, hora, estado, completed_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
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
  return findAppointmentById(userId, result.insertId);
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
     SET titulo = ?, descripcion = ?, fecha = ?, hora = ?, estado = ?, completed_at = ?
     WHERE id = ? AND user_id = ?`,
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
  const [result] = await pool.query('DELETE FROM appointments WHERE id = ? AND user_id = ?', [id, userId]);
  return result.affectedRows > 0;
}
