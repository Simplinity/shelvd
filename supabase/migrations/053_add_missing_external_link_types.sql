-- Migration 053: Add missing library catalogs to external_link_types
-- These 10 providers exist in isbn_providers but were missing from external links
INSERT INTO external_link_types (slug, label, domain, category, sort_order, is_system) VALUES
  ('k10plus',      'K10plus (GBV/SWB)',                   'opac.k10plus.de',               'national-catalog', 275, true),
  ('unicat',       'Unicat (Belgium)',                     'unicat.be',                     'national-catalog', 205, true),
  ('slsp',         'Swisscovery (SLSP)',                   'swisscovery.slsp.ch',           'national-catalog', 315, true),
  ('bibsys',       'BIBSYS / Oria (Norway)',               'bibsys.no',                     'national-catalog', 320, true),
  ('onb',          'ÖNB (Österreichische Nationalbib.)',   'onb.ac.at',                     'national-catalog', 325, true),
  ('libris',       'Libris (Sweden)',                      'libris.kb.se',                  'national-catalog', 330, true),
  ('finna',        'Finna (Finland)',                      'finna.fi',                      'national-catalog', 335, true),
  ('ndl',          'NDL (National Diet Library, Japan)',    'ndl.go.jp',                     'national-catalog', 340, true),
  ('trove',        'Trove / NLA (Australia)',               'trove.nla.gov.au',              'national-catalog', 345, true),
  ('danbib',       'DanBib / bibliotek.dk (Denmark)',      'bibliotek.dk',                  'national-catalog', 350, true)
ON CONFLICT (slug) WHERE user_id IS NULL DO NOTHING;
