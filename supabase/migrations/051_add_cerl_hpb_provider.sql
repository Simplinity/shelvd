-- Migration 051: Add CERL HPB (Heritage of the Printed Book) provider
-- 6M+ records of European printed books (1455–1830)
-- SRU at sru.k10plus.de/hpb — MARCXML, public access, no auth
INSERT INTO isbn_providers (code, name, country, provider_type, base_url, display_order) VALUES
  ('cerl_hpb', 'CERL HPB (Heritage of the Printed Book)', 'EU', 'sru', 'http://sru.k10plus.de/hpb', 70)
ON CONFLICT (code) DO NOTHING;
