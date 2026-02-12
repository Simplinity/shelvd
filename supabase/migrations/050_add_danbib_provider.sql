-- Migration 050: Add DanBib provider (Denmark)
-- 14M+ records from the Danish union catalog via bibliotek.dk
INSERT INTO isbn_providers (code, name, country, provider_type, base_url, display_order) VALUES
  ('danbib', 'DanBib / bibliotek.dk (Denmark)', 'DK', 'xsearch', 'https://opensearch.addi.dk/b3.5_5.3/', 65)
ON CONFLICT (code) DO NOTHING;
