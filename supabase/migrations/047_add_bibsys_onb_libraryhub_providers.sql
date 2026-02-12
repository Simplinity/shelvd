-- Add BIBSYS (Norway), ÖNB (Austria), Library Hub Discover (UK) ISBN providers
-- Brings total to 15 providers across 13 countries

-- Add 'sru-mods' to provider_type check constraint (Library Hub uses MODS, not MARCXML)
ALTER TABLE isbn_providers DROP CONSTRAINT IF EXISTS isbn_providers_provider_type_check;
ALTER TABLE isbn_providers ADD CONSTRAINT isbn_providers_provider_type_check
  CHECK (provider_type IN ('api', 'sru', 'sru-mods', 'html', 'xsearch'));

INSERT INTO isbn_providers (code, name, country, provider_type, base_url, display_order) VALUES
  ('bibsys', 'BIBSYS/Oria (Norway)', 'NO', 'sru', 'https://bibsys.alma.exlibrisgroup.com/view/sru/47BIBSYS_NETWORK', 57),
  ('onb', 'Österreichische Nationalbibliothek', 'AT', 'sru', 'https://obv-at-oenb.alma.exlibrisgroup.com/view/sru/43ACC_ONB', 58),
  ('library_hub', 'Library Hub Discover (UK)', 'GB', 'sru-mods', 'https://discover.libraryhub.jisc.ac.uk/sru-api', 59)
ON CONFLICT (code) DO NOTHING;
