-- Migration 040: Tier features table + seed + rename membership_tier values
-- Part of #14 Tier System & Feature Gating

-- 1. Create tier_features table
CREATE TABLE IF NOT EXISTS tier_features (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tier TEXT NOT NULL CHECK (tier IN ('collector', 'collector_pro', 'dealer')),
  feature TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (tier, feature)
);

-- 2. RLS
ALTER TABLE tier_features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tier_features_select" ON tier_features
  FOR SELECT USING (true);

-- 3. Indexes
CREATE INDEX idx_tier_features_tier ON tier_features (tier);
CREATE INDEX idx_tier_features_feature ON tier_features (feature);

-- 4. Seed: Collector (free) features
INSERT INTO tier_features (tier, feature) VALUES
  ('collector', 'full_cataloging'),
  ('collector', 'collections'),
  ('collector', 'provenance_tracking'),
  ('collector', 'condition_tracking'),
  ('collector', 'book_lookup'),
  ('collector', 'library_enrich'),
  ('collector', 'csv_import_export'),
  ('collector', 'activity_log'),
  ('collector', 'external_links');

-- 5. Seed: Collector Pro features (everything in Collector + extras)
INSERT INTO tier_features (tier, feature) VALUES
  ('collector_pro', 'full_cataloging'),
  ('collector_pro', 'collections'),
  ('collector_pro', 'provenance_tracking'),
  ('collector_pro', 'condition_tracking'),
  ('collector_pro', 'book_lookup'),
  ('collector_pro', 'library_enrich'),
  ('collector_pro', 'csv_import_export'),
  ('collector_pro', 'activity_log'),
  ('collector_pro', 'external_links'),
  ('collector_pro', 'image_upload'),
  ('collector_pro', 'pdf_inserts'),
  ('collector_pro', 'public_sharing'),
  ('collector_pro', 'collection_audit'),
  ('collector_pro', 'advanced_statistics');

-- 6. Seed: Dealer features (everything in Pro + extras)
INSERT INTO tier_features (tier, feature) VALUES
  ('dealer', 'full_cataloging'),
  ('dealer', 'collections'),
  ('dealer', 'provenance_tracking'),
  ('dealer', 'condition_tracking'),
  ('dealer', 'book_lookup'),
  ('dealer', 'library_enrich'),
  ('dealer', 'csv_import_export'),
  ('dealer', 'activity_log'),
  ('dealer', 'external_links'),
  ('dealer', 'image_upload'),
  ('dealer', 'pdf_inserts'),
  ('dealer', 'public_sharing'),
  ('dealer', 'collection_audit'),
  ('dealer', 'advanced_statistics'),
  ('dealer', 'catalog_generator'),
  ('dealer', 'bulk_operations'),
  ('dealer', 'document_storage'),
  ('dealer', 'dealer_directory'),
  ('dealer', 'insurance_valuation_reports');

-- 7. Rename existing membership_tier values
UPDATE user_profiles SET membership_tier = 'collector' WHERE membership_tier = 'free';
UPDATE user_profiles SET membership_tier = 'collector_pro' WHERE membership_tier = 'pro';

-- 8. Tier limits table (book/tag/storage limits per tier)
CREATE TABLE IF NOT EXISTS tier_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tier TEXT NOT NULL CHECK (tier IN ('collector', 'collector_pro', 'dealer')),
  limit_key TEXT NOT NULL,
  limit_value BIGINT NOT NULL,
  UNIQUE (tier, limit_key)
);

ALTER TABLE tier_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tier_limits_select" ON tier_limits
  FOR SELECT USING (true);

INSERT INTO tier_limits (tier, limit_key, limit_value) VALUES
  ('collector',     'max_books',           500),
  ('collector',     'max_tags',            20),
  ('collector',     'storage_bytes',       0),
  ('collector',     'bandwidth_bytes_mo',  0),
  ('collector_pro', 'max_books',           5000),
  ('collector_pro', 'max_tags',            -1),
  ('collector_pro', 'storage_bytes',       5368709120),
  ('collector_pro', 'bandwidth_bytes_mo',  26843545600),
  ('dealer',        'max_books',           -1),
  ('dealer',        'max_tags',            -1),
  ('dealer',        'storage_bytes',       26843545600),
  ('dealer',        'bandwidth_bytes_mo',  268435456000);
