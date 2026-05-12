USE planifica_db;

SET @add_reset_token = (
  SELECT IF(
    EXISTS (
      SELECT 1
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'users'
        AND COLUMN_NAME = 'reset_token'
    ),
    'SELECT 1',
    'ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) NULL AFTER verification_expires'
  )
);
PREPARE stmt FROM @add_reset_token;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @add_reset_expires = (
  SELECT IF(
    EXISTS (
      SELECT 1
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'users'
        AND COLUMN_NAME = 'reset_expires'
    ),
    'SELECT 1',
    'ALTER TABLE users ADD COLUMN reset_expires DATETIME NULL AFTER reset_token'
  )
);
PREPARE stmt FROM @add_reset_expires;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @add_reset_token_index = (
  SELECT IF(
    EXISTS (
      SELECT 1
      FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'users'
        AND INDEX_NAME = 'idx_users_reset_token'
    ),
    'SELECT 1',
    'ALTER TABLE users ADD INDEX idx_users_reset_token (reset_token)'
  )
);
PREPARE stmt FROM @add_reset_token_index;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
