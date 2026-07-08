import pg from 'pg';
import { env } from './env.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: env.databaseUrl,
  max: 10,
  ssl: env.databaseSsl
    ? {
        rejectUnauthorized: env.databaseSslRejectUnauthorized
      }
    : false,
  connectionTimeoutMillis: env.databaseConnectionTimeout,
  idleTimeoutMillis: env.databaseIdleTimeout
});
