import { pool } from '../config/db.js';

const publicFields =
  'id, nombre, email, email_verified, neon_color, created_at, updated_at';

export async function findUserByEmail(email) {
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0] || null;
}

export async function findUserById(id) {
  const { rows } = await pool.query(`SELECT ${publicFields} FROM users WHERE id = $1`, [id]);
  return rows[0] || null;
}

export async function createUser({
  nombre,
  email,
  passwordHash,
  neonColor,
  emailVerified = false,
  verificationToken = null,
  verificationExpires = null
}) {
  const { rows } = await pool.query(
    `INSERT INTO users
      (nombre, email, password_hash, email_verified, verification_token, verification_expires, neon_color)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id`,
    [
      nombre,
      email,
      passwordHash,
      Boolean(emailVerified),
      verificationToken,
      verificationExpires,
      neonColor || '#00f5ff'
    ]
  );

  return findUserById(rows[0].id);
}

export async function updateUserNeonColor(userId, neonColor) {
  await pool.query('UPDATE users SET neon_color = $1 WHERE id = $2', [neonColor, userId]);
  return findUserById(userId);
}

export async function findUserByVerificationToken(token) {
  const { rows } = await pool.query('SELECT * FROM users WHERE verification_token = $1', [token]);
  return rows[0] || null;
}

export async function markUserEmailVerified(userId) {
  await pool.query(
    `UPDATE users
     SET email_verified = TRUE,
         verification_token = NULL,
         verification_expires = NULL
     WHERE id = $1`,
    [userId]
  );

  return findUserById(userId);
}

export async function deleteUserById(userId) {
  await pool.query('DELETE FROM users WHERE id = $1', [userId]);
}

export async function setPasswordResetToken(userId, token, expires) {
  await pool.query(
    'UPDATE users SET reset_token = $1, reset_expires = $2 WHERE id = $3',
    [token, expires, userId]
  );
}

export async function findUserByResetToken(token) {
  const { rows } = await pool.query('SELECT * FROM users WHERE reset_token = $1', [token]);
  return rows[0] || null;
}

export async function updateUserPassword(userId, passwordHash) {
  await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, userId]);
  return findUserById(userId);
}

export async function clearPasswordResetToken(userId) {
  await pool.query(
    'UPDATE users SET reset_token = NULL, reset_expires = NULL WHERE id = $1',
    [userId]
  );
}
