-- Agencies
CREATE TABLE agencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  primary_color TEXT NOT NULL DEFAULT '#2563eb',
  secondary_color TEXT NOT NULL DEFAULT '#64748b',
  custom_domain TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'developer', 'client')) DEFAULT 'developer',
  position TEXT CHECK (position IN ('manager', 'developer', 'designer', 'custom')),
  permissions JSONB NOT NULL DEFAULT '[]',
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sites (WordPress sites)
CREATE TABLE sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  wp_api_url TEXT,
  wp_application_password TEXT,
  wp_connected BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Preview Links
CREATE TABLE preview_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  target_url TEXT NOT NULL,
  created_by TEXT,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Feedback Items
CREATE TABLE feedback_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES feedback_items(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('pin', 'comment', 'voice', 'media')) DEFAULT 'comment',
  content TEXT NOT NULL,
  page_url TEXT NOT NULL DEFAULT '',
  selector TEXT,
  coordinates_x REAL,
  coordinates_y REAL,
  viewport_width INTEGER,
  viewport_height INTEGER,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  assigned_to UUID REFERENCES profiles(user_id) ON DELETE SET NULL,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Feedback Media
CREATE TABLE feedback_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_item_id UUID NOT NULL REFERENCES feedback_items(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT '',
  file_name TEXT NOT NULL DEFAULT '',
  file_size INTEGER NOT NULL DEFAULT 0,
  storage_type TEXT NOT NULL DEFAULT 'supabase' CHECK (storage_type IN ('wordpress', 'supabase')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Developer Reports
CREATE TABLE dev_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  summary TEXT NOT NULL DEFAULT '',
  hours_logged REAL NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_profiles_agency ON profiles(agency_id);
CREATE INDEX idx_profiles_user ON profiles(user_id);
CREATE INDEX idx_sites_agency ON sites(agency_id);
CREATE INDEX idx_projects_agency ON projects(agency_id);
CREATE INDEX idx_projects_site ON projects(site_id);
CREATE INDEX idx_preview_links_project ON preview_links(project_id);
CREATE INDEX idx_preview_links_token ON preview_links(token);
CREATE INDEX idx_feedback_project ON feedback_items(project_id);
CREATE INDEX idx_feedback_status ON feedback_items(status);
CREATE INDEX idx_feedback_media_item ON feedback_media(feedback_item_id);
CREATE INDEX idx_dev_reports_developer ON dev_reports(developer_id);
CREATE INDEX idx_dev_reports_project ON dev_reports(project_id);

-- Row Level Security
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE preview_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE dev_reports ENABLE ROW LEVEL SECURITY;

-- Agencies: authenticated users can create a new agency (registration)
CREATE POLICY "Users can insert agencies" ON agencies
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Agencies: owner can see their own agency
CREATE POLICY "Users can view their agency" ON agencies
  FOR SELECT USING (
    auth.role() = 'authenticated'
    AND (
      id IN (SELECT agency_id FROM profiles WHERE user_id = auth.uid())
      OR NOT EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their agency" ON agencies
  FOR UPDATE USING (
    id IN (SELECT agency_id FROM profiles WHERE user_id = auth.uid() AND role = 'owner')
  );

-- Profiles: authenticated users can view profiles
CREATE POLICY "Users can view profiles" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Owners can insert profiles" ON profiles
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'owner')
    OR user_id = auth.uid()
  );

-- Sites: users see their agency's sites
CREATE POLICY "Users can view sites in their agency" ON sites
  FOR SELECT USING (
    agency_id IN (SELECT agency_id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert sites" ON sites
  FOR INSERT WITH CHECK (
    agency_id IN (SELECT agency_id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update sites" ON sites
  FOR UPDATE USING (
    agency_id IN (SELECT agency_id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete sites" ON sites
  FOR DELETE USING (
    agency_id IN (SELECT agency_id FROM profiles WHERE user_id = auth.uid())
  );

-- Projects: agency-wide access
CREATE POLICY "Users can view projects" ON projects
  FOR SELECT USING (
    agency_id IN (SELECT agency_id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert projects" ON projects
  FOR INSERT WITH CHECK (
    agency_id IN (SELECT agency_id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update projects" ON projects
  FOR UPDATE USING (
    agency_id IN (SELECT agency_id FROM profiles WHERE user_id = auth.uid())
  );

-- Preview Links: anyone with token can read (for the widget)
CREATE POLICY "Anyone can read preview links by token" ON preview_links
  FOR SELECT USING (true);

CREATE POLICY "Users can manage preview links" ON preview_links
  FOR INSERT WITH CHECK (
    project_id IN (SELECT id FROM projects WHERE agency_id IN (SELECT agency_id FROM profiles WHERE user_id = auth.uid()))
  );

CREATE POLICY "Users can update preview links" ON preview_links
  FOR UPDATE USING (
    project_id IN (SELECT id FROM projects WHERE agency_id IN (SELECT agency_id FROM profiles WHERE user_id = auth.uid()))
  );

-- Feedback: anyone can insert (for clients on preview)
CREATE POLICY "Anyone can submit feedback" ON feedback_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view feedback" ON feedback_items
  FOR SELECT USING (
    project_id IN (SELECT id FROM projects WHERE agency_id IN (SELECT agency_id FROM profiles WHERE user_id = auth.uid()))
    OR created_by = auth.uid()::text
  );

CREATE POLICY "Users can update feedback" ON feedback_items
  FOR UPDATE USING (
    project_id IN (SELECT id FROM projects WHERE agency_id IN (SELECT agency_id FROM profiles WHERE user_id = auth.uid()))
  );

-- Feedback Media
CREATE POLICY "Users can view feedback media" ON feedback_media
  FOR SELECT USING (
    feedback_item_id IN (SELECT id FROM feedback_items WHERE project_id IN (SELECT id FROM projects))
  );

CREATE POLICY "Anyone can insert feedback media" ON feedback_media
  FOR INSERT WITH CHECK (true);

-- Dev Reports
CREATE POLICY "Users can view dev reports" ON dev_reports
  FOR SELECT USING (
    project_id IN (SELECT id FROM projects WHERE agency_id IN (SELECT agency_id FROM profiles WHERE user_id = auth.uid()))
    OR developer_id = auth.uid()
  );

CREATE POLICY "Developers can insert their reports" ON dev_reports
  FOR INSERT WITH CHECK (developer_id = auth.uid());

CREATE POLICY "Developers can update their reports" ON dev_reports
  FOR UPDATE USING (developer_id = auth.uid());

-- Functions
CREATE OR REPLACE FUNCTION get_agency_stats(agency_id_param UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_sites', (SELECT COUNT(*) FROM sites WHERE agency_id = agency_id_param),
    'active_projects', (SELECT COUNT(*) FROM projects WHERE agency_id = agency_id_param AND status = 'active'),
    'open_feedback', (SELECT COUNT(*) FROM feedback_items WHERE status IN ('open', 'in_progress')),
    'team_members', (SELECT COUNT(*) FROM profiles WHERE agency_id = agency_id_param),
    'resolved_feedback', (SELECT COUNT(*) FROM feedback_items WHERE status = 'resolved')
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql;
