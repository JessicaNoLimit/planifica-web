import { pool } from '../config/db.js';

const publicFields =
  'id, nombre, email, email_verified, neon_color, created_at, updated_at';

export async function findUserByEmail(email) {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0] || null;
}

export async function findUserById(id) {
  const [rows] = await pool.query(`SELECT ${publicFields} FROM users WHERE id = ?`, [id]);
  return rows[0] || null;
}

export async function createUser({
  nombre,
  email,
  passwordHash,
  neonColor,
  emailVerified = 0,
  verificationToken = null,
  verificationExpires = null
}) {
  const [result] = await pool.query(
    `INSERT INTO users
      (nombre, email, password_hash, email_verified, verification_token, verification_expires, neon_color)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      nombre,
      email,
      passwordHash,
      emailVerified,
      verificationToken,
      verificationExpires,
      neonColor || '#00f5ff'
    ]
  );

  return findUserById(result.insertId);
}

export async function updateUserNeonColor(userId, neonColor) {
  await pool.query('UPDATE users SET neon_color = ? WHERE id = ?', [neonColor, userId]);
  return findUserById(userId);
}

export async function findUserByVerificationToken(token) {
  const [rows] = await pool.query('SELECT * FROM users WHERE verification_token = ?', [token]);
  return rows[0] || null;
}

export async function markUserEmailVerified(userId) {
  await pool.query(
    `UPDATE users
     SET email_verified = 1,
         verification_token = NULL,
         verification_expires = NULL
     WHERE id = ?`,
    [userId]
  );

  return findUserById(userId);
}

export async function deleteUserById(userId) {
  await pool.query('DELETE FROM users WHERE id = ?', [userId]);
}

export async function setPasswordResetToken(userId, token, expires) {
  await pool.query(
    'UPDATE users SET reset_token = ?, reset_expires = ? WHERE id = ?',
    [token, expires, userId]
  );
}

export async function findUserByResetToken(token) {
  const [rows] = await pool.query('SELECT * FROM users WHERE reset_token = ?', [token]);
  return rows[0] || null;
}

export async function updateUserPassword(userId, passwordHash) {
  await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, userId]);
  return findUserById(userId);
}

export async function clearPasswordResetToken(userId) {
  await pool.query(
    'UPDATE users SET reset_token = NULL, reset_expires = NULL WHERE id = ?',
    [userId]
  );
}
