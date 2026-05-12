import { Router } from 'express';
import {
  forgotPassword,
  login,
  me,
  register,
  resetPassword,
  updatePreferences,
  verifyEmail
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/securityMiddleware.js';
import { verifyRecaptcha } from '../middleware/recaptchaMiddleware.js';

const router = Router();

router.post('/register', authLimiter, verifyRecaptcha('register'), register);
router.post('/login', authLimiter, verifyRecaptcha('login'), login);
router.post('/forgot-password', authLimiter, verifyRecaptcha('forgot_password'), forgotPassword);
router.post('/reset-password/:token', authLimiter, resetPassword);
router.get('/verify-email/:token', verifyEmail);
router.get('/me', requireAuth, me);
router.patch('/preferences', requireAuth, updatePreferences);

export default router;
