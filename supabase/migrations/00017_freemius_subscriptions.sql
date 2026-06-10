-- Add Freemius subscription tracking to agencies
ALTER TABLE agencies
ADD COLUMN plan_status TEXT NOT NULL DEFAULT 'beta'
  CHECK (plan_status IN ('beta', 'trialing', 'active', 'past_due', 'canceled', 'expired', 'lifetime')),
ADD COLUMN freemius_user_id TEXT,
ADD COLUMN freemius_subscription_id TEXT;

CREATE INDEX idx_agencies_freemius_user_id ON agencies(freemius_user_id);
