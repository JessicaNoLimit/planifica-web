import { Router } from 'express';
import {
  getTask,
  getTasks,
  postTask,
  putTask,
  removeTask
} from '../controllers/taskController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);
router.get('/', getTasks);
router.get('/:id', getTask);
router.post('/', postTask);
router.put('/:id', putTask);
router.delete('/:id', removeTask);

export default router;
