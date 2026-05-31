-- Add new columns for widget annotation engine support
-- This migration adds fields required for the inline WordPress widget

ALTER TABLE feedback_items
  ADD COLUMN IF NOT EXISTS coordinates_x_end REAL,
  ADD COLUMN IF NOT EXISTS coordinates_y_end REAL,
  ADD COLUMN IF NOT EXISTS width REAL,
  ADD COLUMN IF NOT EXISTS height REAL,
  ADD COLUMN IF NOT EXISTS draw_data TEXT,
  ADD COLUMN IF NOT EXISTS element_dna JSONB,
  ADD COLUMN IF NOT EXISTS meta_data JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS device TEXT DEFAULT 'desktop';

-- Expand type constraint to include all annotation tool types
ALTER TABLE feedback_items
  DROP CONSTRAINT IF EXISTS feedback_items_type_check;

ALTER TABLE feedback_items
  ADD CONSTRAINT feedback_items_type_check
  CHECK (type IN ('pin', 'comment', 'voice', 'media', 'rect', 'arrow', 'draw'));

-- Index for widget API queries
CREATE INDEX IF NOT EXISTS idx_feedback_items_page_url ON feedback_items(page_url);
CREATE INDEX IF NOT EXISTS idx_feedback_items_device ON feedback_items(device);
