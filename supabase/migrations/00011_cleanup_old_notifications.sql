-- Auto-delete notifications older than 30 days

-- Allow users and owners to delete old notifications (used by app-level cleanup)
CREATE POLICY "Users can delete old notifications" ON notifications
  FOR DELETE USING (
    (user_id = auth.uid())
    OR (user_id IS NULL AND agency_id IN (SELECT agency_id FROM profiles WHERE user_id = auth.uid()))
  );

-- Also run cleanup inline when the policy above is used
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM notifications
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$;

-- Schedule daily cleanup via pg_cron if available
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.schedule('cleanup-notifications', '0 3 * * *', 'SELECT cleanup_old_notifications();');
  END IF;
END;
$$;
