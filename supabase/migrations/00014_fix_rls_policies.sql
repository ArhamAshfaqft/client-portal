-- Fix profiles SELECT policy: scope to user's own agency instead of all authenticated users
DROP POLICY IF EXISTS "Users can view profiles" ON profiles;
CREATE POLICY "Users can view profiles" ON profiles
  FOR SELECT USING (
    agency_id IN (SELECT agency_id FROM profiles WHERE user_id = auth.uid())
  );

-- Fix feedback_media SELECT policy: missing agency filter in the subquery chain
DROP POLICY IF EXISTS "Users can view feedback media" ON feedback_media;
CREATE POLICY "Users can view feedback media" ON feedback_media
  FOR SELECT USING (
    feedback_item_id IN (
      SELECT id FROM feedback_items
      WHERE project_id IN (
        SELECT id FROM projects
        WHERE agency_id IN (SELECT agency_id FROM profiles WHERE user_id = auth.uid())
      )
    )
  );
