-- Allow anonymous reads on feedback_items so the widget can load existing annotations.
-- The widget's GET handler validates the preview token first, then fetches by project_id + page_url.
-- This policy allows the anon key to perform that SELECT.
CREATE POLICY "Anyone can read feedback by project" ON feedback_items
  FOR SELECT USING (true);
