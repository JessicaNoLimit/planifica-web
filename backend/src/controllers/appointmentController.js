import {
  createAppointment,
  deleteAppointment,
  findAppointmentById,
  listAppointments,
  updateAppointment
} from '../models/appointmentModel.js';

function validateAppointment(body) {
  if (!body.titulo) return 'El titulo es obligatorio';
  if (!body.fecha) return 'La fecha es obligatoria';
  if (!body.hora) return 'La hora es obligatoria';
  if (body.estado && !['programada', 'completada'].includes(body.estado)) {
    return 'Estado invalido';
  }
  return null;
}

export async function getAppointments(req, res, next) {
  try {
    const appointments = await listAppointments(req.user.id);
    res.json({ appointments });
  } catch (err) {
    next(err);
  }
}

export async function getAppointment(req, res, next) {
  try {
    const appointment = await findAppointmentById(req.user.id, req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Cita no encontrada' });
    res.json({ appointment });
  } catch (err) {
    next(err);
  }
}

export async function postAppointment(req, res, next) {
  try {
    const error = validateAppointment(req.body);
    if (error) return res.status(400).json({ message: error });

    const appointment = await createAppointment(req.user.id, req.body);
    res.status(201).json({ appointment });
  } catch (err) {
    next(err);
  }
}

export async function putAppointment(req, res, next) {
  try {
    const error = validateAppointment(req.body);
    if (error) return res.status(400).json({ message: error });

    const appointment = await updateAppointment(req.user.id, req.params.id, req.body);
    if (!appointment) return res.status(404).json({ message: 'Cita no encontrada' });
    res.json({ appointment });
  } catch (err) {
    next(err);
  }
}

export async function removeAppointment(req, res, next) {
  try {
    const deleted = await deleteAppointment(req.user.id, req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Cita no encontrada' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
