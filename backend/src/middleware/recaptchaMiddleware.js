import { env } from '../config/env.js';

const RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';

export function verifyRecaptcha(expectedAction) {
  return async function recaptchaMiddleware(req, res, next) {
    const { recaptchaToken, recaptchaAction } = req.body ?? {};

    if (!recaptchaToken) {
      return res.status(400).json({ message: 'Verificación anti-bot obligatoria.' });
    }

    if (!env.recaptcha.secretKey) {
      return res.status(500).json({
        message: 'Falta configurar RECAPTCHA_SECRET_KEY en el backend.'
      });
    }

    if (expectedAction && recaptchaAction && recaptchaAction !== expectedAction) {
      return res.status(403).json({ message: 'No se pudo completar la verificación anti-bot.' });
    }

    try {
      const body = new URLSearchParams({
        secret: env.recaptcha.secretKey,
        response: recaptchaToken
      });

      if (req.ip) {
        body.append('remoteip', req.ip);
      }

      const response = await fetch(RECAPTCHA_VERIFY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body
      });

      if (!response.ok) {
        return res.status(403).json({ message: 'No se pudo completar la verificación anti-bot.' });
      }

      const data = await response.json();

      if (!data.success) {
        return res.status(403).json({ message: 'No se pudo completar la verificación anti-bot.' });
      }

      if (typeof data.score !== 'number' || data.score < env.recaptcha.minScore) {
        return res.status(403).json({ message: 'No se pudo completar la verificación anti-bot.' });
      }

      if (expectedAction && data.action !== expectedAction) {
        return res.status(403).json({ message: 'No se pudo completar la verificación anti-bot.' });
      }

      return next();
    } catch {
      return res.status(403).json({ message: 'No se pudo completar la verificación anti-bot.' });
    }
  };
}
