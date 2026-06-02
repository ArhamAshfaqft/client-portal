-- Enable Supabase Realtime for feedback_items and notifications tables
-- Without this, postgres_changes subscriptions silently receive nothing.
ALTER PUBLICATION supabase_realtime ADD TABLE feedback_items;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
