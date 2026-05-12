USE planifica_db;

SET @has_estado := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'appointments'
    AND COLUMN_NAME = 'estado'
);

SET @sql_estado := IF(
  @has_estado = 0,
  "ALTER TABLE appointments ADD COLUMN estado ENUM('programada', 'completada') NOT NULL DEFAULT 'programada' AFTER hora",
  'SELECT 1'
);
PREPARE stmt_estado FROM @sql_estado;
EXECUTE stmt_estado;
DEALLOCATE PREPARE stmt_estado;

SET @has_completed_at := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'appointments'
    AND COLUMN_NAME = 'completed_at'
);

SET @sql_completed_at := IF(
  @has_completed_at = 0,
  "ALTER TABLE appointments ADD COLUMN completed_at DATETIME NULL AFTER estado",
  'SELECT 1'
);
PREPARE stmt_completed_at FROM @sql_completed_at;
EXECUTE stmt_completed_at;
DEALLOCATE PREPARE stmt_completed_at;

SET @has_estado_index := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'appointments'
    AND INDEX_NAME = 'idx_appointments_user_estado'
);

SET @sql_estado_index := IF(
  @has_estado_index = 0,
  'ALTER TABLE appointments ADD INDEX idx_appointments_user_estado (user_id, estado)',
  'SELECT 1'
);
PREPARE stmt_estado_index FROM @sql_estado_index;
EXECUTE stmt_estado_index;
DEALLOCATE PREPARE stmt_estado_index;

SET @has_completed_index := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'appointments'
    AND INDEX_NAME = 'idx_appointments_user_completed'
);

SET @sql_completed_index := IF(
  @has_completed_index = 0,
  'ALTER TABLE appointments ADD INDEX idx_appointments_user_completed (user_id, completed_at)',
  'SELECT 1'
);
PREPARE stmt_completed_index FROM @sql_completed_index;
EXECUTE stmt_completed_index;
DEALLOCATE PREPARE stmt_completed_index;

UPDATE appointments
SET estado = 'programada'
WHERE estado IS NULL;
