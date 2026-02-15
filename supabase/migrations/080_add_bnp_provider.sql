-- Add BNP / PORBASE provider (Portugal)
-- URN HTTP service returning MODS XML, no API key required
-- PORBASE = union catalog of Portuguese libraries

INSERT INTO isbn_providers (code, name, country, provider_type, base_url, display_order)
VALUES ('bnp', 'BNP / PORBASE (Portugal)', 'PT', 'api', 'https://urn.porbase.org/isbn/mods/xml', 81)
ON CONFLICT (code) DO NOTHING;
