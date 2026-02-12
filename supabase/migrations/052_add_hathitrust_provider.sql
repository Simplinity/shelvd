-- Migration 052: Add HathiTrust provider
-- 13M+ digitised volumes from 200+ research libraries
-- REST JSON at catalog.hathitrust.org/api/volumes/ — public, no auth
INSERT INTO isbn_providers (code, name, country, provider_type, base_url, display_order) VALUES
  ('hathitrust', 'HathiTrust Digital Library', 'US', 'api', 'https://catalog.hathitrust.org/api/volumes', 75)
ON CONFLICT (code) DO NOTHING;
