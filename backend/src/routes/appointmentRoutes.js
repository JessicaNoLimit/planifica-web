import { Router } from 'express';
import {
  getAppointment,
  getAppointments,
  postAppointment,
  putAppointment,
  removeAppointment
} from '../controllers/appointmentController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);
router.get('/', getAppointments);
router.get('/:id', getAppointment);
router.post('/', postAppointment);
router.put('/:id', putAppointment);
router.delete('/:id', removeAppointment);

export default router;
