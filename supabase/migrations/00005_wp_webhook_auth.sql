-- Store the WP REST API key so Vercel can push changes back to the site
ALTER TABLE sites
  ADD COLUMN IF NOT EXISTS wp_api_key TEXT;
