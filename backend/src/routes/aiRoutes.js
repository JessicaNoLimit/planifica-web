import { Router } from 'express';
import { getDailyPlan } from '../controllers/aiController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);
router.post('/daily-plan', getDailyPlan);

export default router;
