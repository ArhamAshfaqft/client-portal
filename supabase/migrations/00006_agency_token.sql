-- Add agency_token column for auto-connect flow
ALTER TABLE agencies ADD COLUMN IF NOT EXISTS agency_token UUID UNIQUE DEFAULT gen_random_uuid();

-- Generate tokens for existing agencies that don't have one
UPDATE agencies SET agency_token = gen_random_uuid() WHERE agency_token IS NULL;
