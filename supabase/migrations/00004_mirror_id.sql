-- Track the WordPress annotation ID so we can deduplicate mirror pushes
ALTER TABLE feedback_items
  ADD COLUMN IF NOT EXISTS mirror_id VARCHAR(36);

CREATE UNIQUE INDEX IF NOT EXISTS idx_feedback_items_mirror_id ON feedback_items(mirror_id);
