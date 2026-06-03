-- Merge in_progress → open in existing data
UPDATE feedback_items SET status = 'open' WHERE status = 'in_progress';

-- Remove in_progress from the CHECK constraint
ALTER TABLE feedback_items DROP CONSTRAINT IF EXISTS feedback_items_status_check;
ALTER TABLE feedback_items ADD CONSTRAINT feedback_items_status_check
  CHECK (status IN ('open', 'resolved', 'closed'));

-- Recreate the agency stats function
DROP FUNCTION IF EXISTS get_agency_stats(uuid);
CREATE OR REPLACE FUNCTION get_agency_stats(agency_id_param UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_sites', (SELECT COUNT(*) FROM sites WHERE agency_id = agency_id_param),
    'total_projects', (SELECT COUNT(*) FROM projects WHERE agency_id = agency_id_param),
    'total_feedback', (SELECT COUNT(*) FROM feedback_items WHERE project_id IN (SELECT id FROM projects WHERE agency_id = agency_id_param)),
    'open_feedback', (SELECT COUNT(*) FROM feedback_items WHERE status = 'open' AND project_id IN (SELECT id FROM projects WHERE agency_id = agency_id_param)),
    'resolved_feedback', (SELECT COUNT(*) FROM feedback_items WHERE status = 'resolved' AND project_id IN (SELECT id FROM projects WHERE agency_id = agency_id_param)),
    'team_members', (SELECT COUNT(*) FROM profiles WHERE agency_id = agency_id_param)
  ) INTO result;
  RETURN result;
END;
$$;
