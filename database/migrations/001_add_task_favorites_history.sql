USE planifica_db;

ALTER TABLE tasks
  ADD COLUMN is_favorite TINYINT(1) NOT NULL DEFAULT 0 AFTER fecha,
  ADD COLUMN completed_at DATETIME NULL AFTER is_favorite,
  ADD INDEX idx_tasks_user_favorite (user_id, is_favorite),
  ADD INDEX idx_tasks_user_completed (user_id, completed_at);

UPDATE tasks
SET completed_at = updated_at
WHERE estado = 'completada'
  AND completed_at IS NULL;
