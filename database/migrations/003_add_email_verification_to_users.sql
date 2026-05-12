USE planifica_db;

SET @add_email_verified = (
  SELECT IF(
    EXISTS (
      SELECT 1
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'users'
        AND COLUMN_NAME = 'email_verified'
    ),
    'SELECT 1',
    'ALTER TABLE users ADD COLUMN email_verified TINYINT(1) NOT NULL DEFAULT 0 AFTER password_hash'
  )
);
PREPARE stmt FROM @add_email_verified;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @add_verification_token = (
  SELECT IF(
    EXISTS (
      SELECT 1
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'users'
        AND COLUMN_NAME = 'verification_token'
    ),
    'SELECT 1',
    'ALTER TABLE users ADD COLUMN verification_token VARCHAR(255) NULL AFTER email_verified'
  )
);
PREPARE stmt FROM @add_verification_token;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @add_verification_expires = (
  SELECT IF(
    EXISTS (
      SELECT 1
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'users'
        AND COLUMN_NAME = 'verification_expires'
    ),
    'SELECT 1',
    'ALTER TABLE users ADD COLUMN verification_expires DATETIME NULL AFTER verification_token'
  )
);
PREPARE stmt FROM @add_verification_expires;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @add_verification_token_index = (
  SELECT IF(
    EXISTS (
      SELECT 1
      FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'users'
        AND INDEX_NAME = 'idx_users_verification_token'
    ),
    'SELECT 1',
    'ALTER TABLE users ADD INDEX idx_users_verification_token (verification_token)'
  )
);
PREPARE stmt FROM @add_verification_token_index;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
