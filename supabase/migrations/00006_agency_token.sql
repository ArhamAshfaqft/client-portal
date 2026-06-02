-- Add agency_token column for auto-connect flow
ALTER TABLE agencies ADD COLUMN IF NOT EXISTS agency_token UUID UNIQUE DEFAULT gen_random_uuid();

-- Generate tokens for existing agencies that don't have one
UPDATE agencies SET agency_token = gen_random_uuid() WHERE agency_token IS NULL;

-- Allow unauthenticated lookup by agency_token (auto-register endpoint)
CREATE POLICY "Anyone can look up agency by token" ON agencies
  FOR SELECT USING (agency_token IS NOT NULL);

-- Allow site creation for auto-register (validates against agencies internally)
CREATE POLICY "Allow site creation for valid agencies" ON sites
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM agencies WHERE id = agency_id)
  );
