-- Add Finna (Finland), OPAC SBN (Italy), NDL (Japan), Trove (Australia), KB Netherlands providers
-- v0.18.0: Brings total to 20 providers across 18 countries
-- First Asian (Japan) and Oceania (Australia) coverage

INSERT INTO isbn_providers (code, name, country, provider_type, base_url, display_order) VALUES
  ('finna', 'Finna (Finland)', 'FI', 'api', 'https://api.finna.fi/api/v1', 60),
  ('opac_sbn', 'OPAC SBN (Italy)', 'IT', 'api', 'http://opac.sbn.it/opacmobilegw', 61),
  ('ndl', 'NDL — National Diet Library (Japan)', 'JP', 'api', 'https://ndlsearch.ndl.go.jp/api/opensearch', 62),
  ('trove', 'Trove / NLA (Australia)', 'AU', 'api', 'https://api.trove.nla.gov.au/v3', 63),
  ('kb_nl', 'KB — Koninklijke Bibliotheek (Netherlands)', 'NL', 'sru', 'http://jsru.kb.nl/sru/sru', 64)
ON CONFLICT (code) DO NOTHING;

-- Disable the old 'kb' entry (replaced by kb_nl with proper Dublin Core parser)
UPDATE isbn_providers SET is_enabled = false WHERE code = 'kb';
