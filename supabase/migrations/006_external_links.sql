-- ============================================================================
-- EXTERNAL LINKS FEATURE — Migration
-- Run in Supabase SQL Editor
-- ============================================================================

-- 1. External Link Types (system defaults + user custom types)
-- ============================================================================
CREATE TABLE IF NOT EXISTS external_link_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(50) NOT NULL,
  label VARCHAR(200) NOT NULL,
  domain VARCHAR(200),
  category VARCHAR(50) NOT NULL DEFAULT 'other',
  sort_order INTEGER DEFAULT 0,
  is_system BOOLEAN DEFAULT false,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- System types: slug must be unique where user_id IS NULL
CREATE UNIQUE INDEX idx_elt_system_slug ON external_link_types (slug) WHERE user_id IS NULL;
-- User custom types: slug must be unique per user
CREATE UNIQUE INDEX idx_elt_user_slug ON external_link_types (slug, user_id) WHERE user_id IS NOT NULL;

-- Indexes
CREATE INDEX idx_elt_user_id ON external_link_types (user_id);
CREATE INDEX idx_elt_category ON external_link_types (category);

-- RLS
ALTER TABLE external_link_types ENABLE ROW LEVEL SECURITY;

-- Everyone can read system types
CREATE POLICY "System link types are visible to all authenticated users"
  ON external_link_types FOR SELECT
  TO authenticated
  USING (user_id IS NULL);

-- Users can read their own custom types
CREATE POLICY "Users can read their own custom link types"
  ON external_link_types FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can insert custom types (not system)
CREATE POLICY "Users can insert their own custom link types"
  ON external_link_types FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() AND is_system = false);

-- Users can update their own custom types only
CREATE POLICY "Users can update their own custom link types"
  ON external_link_types FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND is_system = false)
  WITH CHECK (user_id = auth.uid() AND is_system = false);

-- Users can delete their own custom types only
CREATE POLICY "Users can delete their own custom link types"
  ON external_link_types FOR DELETE
  TO authenticated
  USING (user_id = auth.uid() AND is_system = false);


-- 2. Book External Links (actual links per book)
-- ============================================================================
CREATE TABLE IF NOT EXISTS book_external_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  link_type_id UUID REFERENCES external_link_types(id) ON DELETE SET NULL,
  label VARCHAR(200),
  url TEXT NOT NULL,
  notes VARCHAR(500),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_bel_book_id ON book_external_links (book_id);
CREATE INDEX idx_bel_user_id ON book_external_links (user_id);

-- RLS
ALTER TABLE book_external_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own book links"
  ON book_external_links FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own book links"
  ON book_external_links FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own book links"
  ON book_external_links FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own book links"
  ON book_external_links FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());


-- 3. Seed system link types (55 types)
-- ============================================================================

-- BIBLIOGRAPHIC & AUTHORITY (7)
INSERT INTO external_link_types (slug, label, domain, category, sort_order, is_system) VALUES
('worldcat',       'WorldCat (OCLC)',                     'worldcat.org',                  'bibliographic', 10,  true),
('viaf',           'VIAF',                                'viaf.org',                      'bibliographic', 20,  true),
('wikidata',       'Wikidata',                            'wikidata.org',                  'bibliographic', 30,  true),
('wikipedia',      'Wikipedia',                           'wikipedia.org',                 'bibliographic', 40,  true),
('isni',           'ISNI',                                'isni.org',                      'bibliographic', 50,  true),
('open-library',   'Open Library',                        'openlibrary.org',               'bibliographic', 60,  true),
('kvk',            'KVK (Karlsruher Virtueller Katalog)', 'kvk.bibliothek.kit.edu',        'bibliographic', 70,  true);

-- SHORT TITLE CATALOGS (9)
INSERT INTO external_link_types (slug, label, domain, category, sort_order, is_system) VALUES
('istc',           'ISTC (Incunabula Short Title)',       'data.cerl.org',                 'short-title-catalog', 100, true),
('gw',             'GW (Gesamtkatalog der Wiegendrucke)', 'gesamtkatalogderwiegendrucke.de','short-title-catalog', 110, true),
('ustc',           'USTC (Universal Short Title)',        'ustc.ac.uk',                    'short-title-catalog', 120, true),
('estc',           'ESTC (English Short Title)',          'data.cerl.org',                 'short-title-catalog', 130, true),
('stcn',           'STCN (Short Title NL)',               'stcn.nl',                       'short-title-catalog', 140, true),
('stcv',           'STCV (Short Title Vlaanderen)',       'stcv.be',                       'short-title-catalog', 150, true),
('vd16',           'VD16 (Verzeichnis 16. Jh.)',          'vd16.de',                       'short-title-catalog', 160, true),
('vd17',           'VD17 (Verzeichnis 17. Jh.)',          'vd17.de',                       'short-title-catalog', 170, true),
('edit16',         'EDIT16 (Edizioni Italiane XVI sec.)', 'edit16.iccu.sbn.it',            'short-title-catalog', 180, true);

-- NATIONAL & REGIONAL CATALOGS (12)
INSERT INTO external_link_types (slug, label, domain, category, sort_order, is_system) VALUES
('kbr',            'KBR (Koninklijke Bibliotheek België)','kbr.be',                        'national-catalog', 200, true),
('kb-nl',          'KB (Koninklijke Bibliotheek NL)',     'kb.nl',                         'national-catalog', 210, true),
('bnf',            'BnF Catalogue général',               'catalogue.bnf.fr',              'national-catalog', 220, true),
('sudoc',          'SUDOC',                               'sudoc.abes.fr',                 'national-catalog', 230, true),
('ccfr',           'CCFr (Catalogue Collectif de France)','ccfr.bnf.fr',                   'national-catalog', 240, true),
('british-library','British Library',                     'bl.uk',                         'national-catalog', 250, true),
('jisc-library-hub','Jisc Library Hub Discover',          'discover.libraryhub.jisc.ac.uk','national-catalog', 260, true),
('dnb',            'Deutsche Nationalbibliothek',         'dnb.de',                        'national-catalog', 270, true),
('bsb',            'BSB (Bayerische Staatsbibliothek)',   'bsb-muenchen.de',              'national-catalog', 280, true),
('sbn-iccu',       'SBN/ICCU (Servizio Bib. Nazionale)', 'sbn.it',                        'national-catalog', 290, true),
('bne',            'BNE (Biblioteca Nacional de España)', 'bne.es',                        'national-catalog', 300, true),
('loc',            'Library of Congress',                 'loc.gov',                       'national-catalog', 310, true);

-- DIGITAL LIBRARIES (8)
INSERT INTO external_link_types (slug, label, domain, category, sort_order, is_system) VALUES
('gallica',        'Gallica (BnF)',                       'gallica.bnf.fr',                'digital-library', 400, true),
('europeana',      'Europeana',                           'europeana.eu',                  'digital-library', 410, true),
('google-books',   'Google Books',                        'books.google.com',              'digital-library', 420, true),
('hathitrust',     'HathiTrust',                          'hathitrust.org',                'digital-library', 430, true),
('internet-archive','Internet Archive',                   'archive.org',                   'digital-library', 440, true),
('mdz',            'MDZ (Münchener DigitalisierungsZ.)',  'mdz-nbn-resolving.de',          'digital-library', 450, true),
('cerl-hpb',       'CERL HPB (Heritage Printed Book)',    'cerl.org',                      'digital-library', 460, true),
('bdl',            'Biodiversity Heritage Library',       'biodiversitylibrary.org',       'digital-library', 470, true);

-- PROVENANCE & SPECIALIST (4)
INSERT INTO external_link_types (slug, label, domain, category, sort_order, is_system) VALUES
('cerl-thesaurus', 'CERL Thesaurus',                     'data.cerl.org',                 'provenance', 500, true),
('mei',            'MEI (Material Evidence Incunabula)',  'data.cerl.org',                 'provenance', 510, true),
('data-bnf',       'data.bnf.fr',                        'data.bnf.fr',                   'provenance', 520, true),
('gnd',            'GND (Gemeinsame Normdatei)',          'd-nb.info',                     'provenance', 530, true);

-- ANTIQUARIAN & MARKETPLACES (6)
INSERT INTO external_link_types (slug, label, domain, category, sort_order, is_system) VALUES
('abebooks',       'AbeBooks',                            'abebooks.com',                  'marketplace', 600, true),
('zvab',           'ZVAB',                                'zvab.com',                      'marketplace', 610, true),
('biblio',         'Biblio.com',                          'biblio.com',                    'marketplace', 620, true),
('vialibri',       'viaLibri',                            'vialibri.net',                  'marketplace', 630, true),
('bookfinder',     'Bookfinder',                          'bookfinder.com',                'marketplace', 640, true),
('catawiki',       'Catawiki',                            'catawiki.com',                  'marketplace', 650, true);

-- AUCTION HOUSES & PRICES (5)
INSERT INTO external_link_types (slug, label, domain, category, sort_order, is_system) VALUES
('rare-book-hub',  'Rare Book Hub',                       'rarebookhub.com',               'auction', 700, true),
('christies',      'Christie''s',                         'christies.com',                 'auction', 710, true),
('sothebys',       'Sotheby''s',                          'sothebys.com',                  'auction', 720, true),
('bonhams',        'Bonhams',                             'bonhams.com',                   'auction', 730, true),
('drouot',         'Drouot',                              'drouot.com',                    'auction', 740, true);

-- COMMUNITY (2)
INSERT INTO external_link_types (slug, label, domain, category, sort_order, is_system) VALUES
('goodreads',      'Goodreads',                           'goodreads.com',                 'community', 800, true),
('librarything',   'LibraryThing',                        'librarything.com',              'community', 810, true);

-- FREE / OTHER (2)
INSERT INTO external_link_types (slug, label, domain, category, sort_order, is_system) VALUES
('publisher',      'Publisher Website',                   NULL,                            'other', 900, true),
('other',          'Other',                               NULL,                            'other', 999, true);


-- 4. Verification
-- ============================================================================
SELECT category, count(*) as count
FROM external_link_types
WHERE is_system = true
GROUP BY category
ORDER BY min(sort_order);
