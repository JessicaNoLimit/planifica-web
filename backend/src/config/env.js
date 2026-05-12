import dotenv from 'dotenv';

dotenv.config();

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
  jwtSecret: process.env.JWT_SECRET || 'change_this_secret_in_development',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  mail: {
    host: process.env.MAIL_HOST || '',
    port: Number(process.env.MAIL_PORT || 587),
    user: process.env.MAIL_USER || '',
    pass: process.env.MAIL_PASS || '',
    from: process.env.MAIL_FROM || ''
  },
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'planifica_db'
  }
};
