-- Add BNE (Spain) and SLSP/Swisscovery (Switzerland) ISBN providers
-- Both use Ex Libris Alma SRU endpoints with alma.* index namespace

INSERT INTO isbn_providers (code, name, country, provider_type, base_url, display_order) VALUES
  ('bne', 'Biblioteca Nacional de España', 'ES', 'sru', 'https://catalogo.bne.es', 55),
  ('slsp', 'Swisscovery (SLSP)', 'CH', 'sru', 'https://swisscovery.slsp.ch', 65);

-- Also add provider_type 'xsearch' to the check constraint (for LIBRIS which uses it)
ALTER TABLE isbn_providers DROP CONSTRAINT IF EXISTS isbn_providers_provider_type_check;
ALTER TABLE isbn_providers ADD CONSTRAINT isbn_providers_provider_type_check
  CHECK (provider_type IN ('api', 'sru', 'html', 'xsearch'));
