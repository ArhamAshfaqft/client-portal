-- Site members table: tracks which developers are assigned to which sites
CREATE TABLE IF NOT EXISTS site_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- auth.users id
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  assigned_by TEXT, -- owner name
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(site_id, user_id)
);

CREATE INDEX idx_site_members_user ON site_members(user_id);
CREATE INDEX idx_site_members_site ON site_members(site_id);
CREATE INDEX idx_site_members_agency ON site_members(agency_id);

ALTER TABLE site_members ENABLE ROW LEVEL SECURITY;

-- Owners can manage all assignments in their agency
CREATE POLICY "Owners can manage site members" ON site_members
  FOR ALL USING (
    agency_id IN (SELECT agency_id FROM profiles WHERE user_id = auth.uid() AND role = 'owner')
  );

-- Users can view their own assignments
CREATE POLICY "Users can view own assignments" ON site_members
  FOR SELECT USING (
    user_id = auth.uid()
  );
