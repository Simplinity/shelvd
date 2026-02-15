-- Add COBISS provider (SE Europe: Slovenia, Serbia, N. Macedonia, Bosnia-Herzegovina, Montenegro, Bulgaria, Albania, Kosovo)
-- Co-operative Online Bibliographic System and Services — 10M+ records across 780+ libraries in 8 countries
-- Uses legacy COBISS+ interface (server-rendered HTML) with expert search
-- No API key required, no authentication needed

INSERT INTO isbn_providers (code, name, country, provider_type, base_url, display_order)
VALUES ('cobiss', 'COBISS (SE Europe)', 'SI', 'html', 'https://plus-legacy.cobiss.net', 82)
ON CONFLICT (code) DO NOTHING;
