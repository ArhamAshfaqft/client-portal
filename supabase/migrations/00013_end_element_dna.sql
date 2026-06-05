-- Add end_element_dna column for arrow annotations (two-point arrows)
ALTER TABLE feedback_items ADD COLUMN IF NOT EXISTS end_element_dna JSONB;
