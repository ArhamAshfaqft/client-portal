-- Notifications table for in-app real-time notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('assigned', 'resolved', 'replied', 'new_feedback')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  site_id UUID REFERENCES sites(id) ON DELETE SET NULL,
  feedback_id UUID REFERENCES feedback_items(id) ON DELETE SET NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_agency ON notifications(agency_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, read) WHERE NOT read;

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (
    user_id = auth.uid()
    OR (user_id IS NULL AND agency_id IN (SELECT agency_id FROM profiles WHERE user_id = auth.uid()))
  );

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can insert notifications for their agency" ON notifications
  FOR INSERT WITH CHECK (
    agency_id IN (SELECT agency_id FROM profiles WHERE user_id = auth.uid())
  );
