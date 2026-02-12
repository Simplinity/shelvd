-- Add BNE (Spain), SLSP/Swisscovery (Switzerland) and Unicat (Belgium) ISBN providers
-- BNE and SLSP use Ex Libris Alma SRU endpoints with alma.* index namespace
-- Unicat is the Belgian union catalog (KBR + university libraries) via SemperTool SRU

-- Replace the old non-functional 'kbr' entry with Unicat (which includes KBR records)
DELETE FROM user_isbn_providers WHERE provider_id IN (SELECT id FROM isbn_providers WHERE code = 'kbr');
DELETE FROM isbn_providers WHERE code = 'kbr';

INSERT INTO isbn_providers (code, name, country, provider_type, base_url, display_order) VALUES
  ('unicat', 'Unicat (Belgium)', 'BE', 'sru', 'https://www.unicat.be', 55),
  ('bne', 'Biblioteca Nacional de España', 'ES', 'sru', 'https://catalogo.bne.es', 56),
  ('slsp', 'Swisscovery (SLSP)', 'CH', 'sru', 'https://swisscovery.slsp.ch', 65);

-- Also add provider_type 'xsearch' to the check constraint (for LIBRIS which uses it)
ALTER TABLE isbn_providers DROP CONSTRAINT IF EXISTS isbn_providers_provider_type_check;
ALTER TABLE isbn_providers ADD CONSTRAINT isbn_providers_provider_type_check
  CHECK (provider_type IN ('api', 'sru', 'html', 'xsearch'));
