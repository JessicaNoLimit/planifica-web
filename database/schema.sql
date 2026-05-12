CREATE DATABASE IF NOT EXISTS planifica_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE planifica_db;

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  email_verified TINYINT(1) NOT NULL DEFAULT 0,
  verification_token VARCHAR(255) NULL,
  verification_expires DATETIME NULL,
  reset_token VARCHAR(255) NULL,
  reset_expires DATETIME NULL,
  neon_color VARCHAR(20) NOT NULL DEFAULT '#00f5ff',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_verification_token (verification_token),
  INDEX idx_users_reset_token (reset_token)
);

CREATE TABLE IF NOT EXISTS tasks (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  titulo VARCHAR(150) NOT NULL,
  descripcion TEXT NULL,
  prioridad ENUM('baja', 'media', 'alta') NOT NULL DEFAULT 'media',
  estado ENUM('pendiente', 'en_progreso', 'completada') NOT NULL DEFAULT 'pendiente',
  fecha DATE NULL,
  is_favorite TINYINT(1) NOT NULL DEFAULT 0,
  completed_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_tasks_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  INDEX idx_tasks_user_fecha (user_id, fecha),
  INDEX idx_tasks_user_estado (user_id, estado),
  INDEX idx_tasks_user_favorite (user_id, is_favorite),
  INDEX idx_tasks_user_completed (user_id, completed_at)
);

CREATE TABLE IF NOT EXISTS appointments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  titulo VARCHAR(150) NOT NULL,
  descripcion TEXT NULL,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  estado ENUM('programada', 'completada') NOT NULL DEFAULT 'programada',
  completed_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_appointments_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  INDEX idx_appointments_user_fecha (user_id, fecha),
  INDEX idx_appointments_user_fecha_hora (user_id, fecha, hora),
  INDEX idx_appointments_user_estado (user_id, estado),
  INDEX idx_appointments_user_completed (user_id, completed_at)
);
