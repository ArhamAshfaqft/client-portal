-- Make Supabase Realtime reliable for the dashboard.
--
-- 1) Ensure the tables are members of the realtime publication. Without this,
--    postgres_changes subscriptions silently receive nothing (this is the #1
--    reason new pins/notifications only show after a manual refresh).
-- 2) REPLICA IDENTITY FULL makes UPDATE/DELETE events carry the full row, which
--    is required for RLS-protected tables so the subscriber's RLS policy can be
--    evaluated against the changed row (e.g. resolving/reopening a pin).
--
-- Safe to run multiple times.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'feedback_items'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE feedback_items;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
  END IF;
END
$$;

ALTER TABLE feedback_items REPLICA IDENTITY FULL;
ALTER TABLE notifications REPLICA IDENTITY FULL;
