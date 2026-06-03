-- Auto-delete notifications older than 30 days (app-level cleanup)

-- Allow users and owners to delete old notifications
CREATE POLICY "Users can delete old notifications" ON notifications
  FOR DELETE USING (
    (user_id = auth.uid())
    OR (user_id IS NULL AND agency_id IN (SELECT agency_id FROM profiles WHERE user_id = auth.uid()))
  );
