import dotenv from 'dotenv';

dotenv.config();

const jwtSecret = process.env.JWT_SECRET?.trim();

if (!jwtSecret || jwtSecret === 'change_this_secret_in_development') {
  throw new Error(
    'JWT_SECRET es obligatorio y debe ser una cadena larga y segura distinta del valor por defecto.'
  );
}

export const env = {
  port: process.env.PORT || 4000,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  corsOrigin:
    process.env.CORS_ORIGIN ||
    process.env.FRONTEND_URL ||
    'http://localhost:5173',
  trustProxy: process.env.TRUST_PROXY === 'true',
  backendUrl: process.env.BACKEND_URL || 'http://localhost:4000',
  recaptcha: {
    secretKey: process.env.RECAPTCHA_SECRET_KEY || '',
    minScore: Number(process.env.RECAPTCHA_MIN_SCORE || 0.5)
  },
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  mail: {
    host: process.env.MAIL_HOST || '',
    port: Number(process.env.MAIL_PORT || 587),
    user: process.env.MAIL_USER || '',
    pass: process.env.MAIL_PASS || '',
    from: process.env.MAIL_FROM || ''
  },
  databaseUrl: process.env.DATABASE_URL || '',
  databaseSsl: process.env.DATABASE_SSL === 'true',
  databaseSslRejectUnauthorized:
    process.env.DATABASE_SSL_REJECT_UNAUTHORIZED === 'true',
  databaseConnectionTimeout: Number(process.env.DATABASE_CONNECTION_TIMEOUT || 0),
  databaseIdleTimeout: Number(process.env.DATABASE_IDLE_TIMEOUT || 10000),
  groq: {
    apiKey: process.env.GROQ_API_KEY || '',
    model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant'
  }
};
