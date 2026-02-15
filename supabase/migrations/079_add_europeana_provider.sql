-- Add Europeana provider
-- 200M+ records from 4,000+ European cultural institutions across 49 countries
-- REST API (JSON), requires API key from https://pro.europeana.eu/page/get-api

INSERT INTO isbn_providers (code, name, country, provider_type, base_url, display_order)
VALUES ('europeana', 'Europeana', 'EU', 'api', 'https://api.europeana.eu/record/v2', 80)
ON CONFLICT (code) DO NOTHING;
