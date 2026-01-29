-- Book Formats
-- Traditional book format designations based on paper folding
-- Source: Standard bibliographic terminology and printing conventions

INSERT INTO book_formats (type, name, abbreviation, leaves, pages, width_cm, height_cm, width_inches, height_inches, joint_info) VALUES
  -- Folio formats (1 fold = 2 leaves = 4 pages)
  ('Folio', 'Imperial Folio', 'imp. fo.', 2, 4, 37.5, 55.0, 14.75, 21.65, 'Chain lines horizontal'),
  ('Folio', 'Royal Folio', 'roy. fo.', 2, 4, 32.5, 50.0, 12.80, 19.69, 'Chain lines horizontal'),
  ('Folio', 'Median Folio', 'med. fo.', 2, 4, 29.0, 46.5, 11.42, 18.31, 'Chain lines horizontal'),
  ('Folio', 'Demy Folio', 'demy fo.', 2, 4, 28.5, 44.5, 11.22, 17.52, 'Chain lines horizontal'),
  ('Folio', 'Crown Folio', 'cr. fo.', 2, 4, 25.0, 38.0, 9.84, 14.96, 'Chain lines horizontal'),
  ('Folio', 'Post Folio', 'post fo.', 2, 4, 24.0, 39.5, 9.45, 15.55, 'Chain lines horizontal'),
  ('Folio', 'Foolscap Folio', 'fcp. fo.', 2, 4, 21.5, 34.0, 8.46, 13.39, 'Chain lines horizontal'),
  ('Folio', 'Pot Folio', 'pot fo.', 2, 4, 20.0, 31.5, 7.87, 12.40, 'Chain lines horizontal'),
  ('Folio', 'Elephant Folio', 'el. fo.', 2, 4, 35.5, 58.0, 13.98, 22.83, 'Large format, chain lines horizontal'),
  ('Folio', 'Atlas Folio', 'atl. fo.', 2, 4, 42.0, 66.0, 16.54, 25.98, 'Very large format'),
  ('Folio', 'Double Elephant Folio', 'dbl. el. fo.', 2, 4, 50.0, 76.0, 19.69, 29.92, 'Extremely large format'),
  
  -- Quarto formats (2 folds = 4 leaves = 8 pages)
  ('Quarto', 'Imperial Quarto', 'imp. 4to', 4, 8, 27.5, 37.5, 10.83, 14.76, 'Chain lines vertical'),
  ('Quarto', 'Royal Quarto', 'roy. 4to', 4, 8, 25.0, 32.5, 9.84, 12.80, 'Chain lines vertical'),
  ('Quarto', 'Medium Quarto', 'med. 4to', 4, 8, 23.5, 29.5, 9.25, 11.61, 'Chain lines vertical'),
  ('Quarto', 'Demy Quarto', 'demy 4to', 4, 8, 22.0, 28.5, 8.66, 11.22, 'Chain lines vertical'),
  ('Quarto', 'Crown Quarto', 'cr. 4to', 4, 8, 19.0, 25.0, 7.48, 9.84, 'Chain lines vertical'),
  ('Quarto', 'Post Quarto', 'post 4to', 4, 8, 20.0, 25.0, 7.87, 9.84, 'Chain lines vertical'),
  ('Quarto', 'Foolscap Quarto', 'fcp. 4to', 4, 8, 17.0, 21.5, 6.69, 8.46, 'Chain lines vertical'),
  ('Quarto', 'Pot Quarto', 'pot 4to', 4, 8, 15.5, 20.0, 6.10, 7.87, 'Chain lines vertical'),
  ('Quarto', 'Large Post Quarto', 'lg. post 4to', 4, 8, 21.0, 26.5, 8.27, 10.43, 'Chain lines vertical'),
  ('Quarto', 'Small Quarto', 'sm. 4to', 4, 8, 14.0, 18.0, 5.51, 7.09, 'Chain lines vertical'),
  
  -- Octavo formats (3 folds = 8 leaves = 16 pages)
  ('Octavo', 'Imperial Octavo', 'imp. 8vo', 8, 16, 18.5, 27.5, 7.28, 10.83, 'Chain lines horizontal'),
  ('Octavo', 'Royal Octavo', 'roy. 8vo', 8, 16, 16.0, 25.0, 6.30, 9.84, 'Chain lines horizontal'),
  ('Octavo', 'Super Royal Octavo', 'sup. roy. 8vo', 8, 16, 17.0, 26.5, 6.69, 10.43, 'Chain lines horizontal'),
  ('Octavo', 'Medium Octavo', 'med. 8vo', 8, 16, 14.5, 23.5, 5.71, 9.25, 'Chain lines horizontal'),
  ('Octavo', 'Demy Octavo', 'demy 8vo', 8, 16, 14.0, 22.0, 5.51, 8.66, 'Standard trade size'),
  ('Octavo', 'Crown Octavo', 'cr. 8vo', 8, 16, 12.5, 19.0, 4.92, 7.48, 'Common book size'),
  ('Octavo', 'Post Octavo', 'post 8vo', 8, 16, 12.5, 20.0, 4.92, 7.87, 'Chain lines horizontal'),
  ('Octavo', 'Foolscap Octavo', 'fcp. 8vo', 8, 16, 10.5, 17.0, 4.13, 6.69, 'Chain lines horizontal'),
  ('Octavo', 'Pot Octavo', 'pot 8vo', 8, 16, 10.0, 15.5, 3.94, 6.10, 'Chain lines horizontal'),
  ('Octavo', 'Large Crown Octavo', 'lg. cr. 8vo', 8, 16, 13.5, 20.5, 5.31, 8.07, 'Common UK trade size'),
  ('Octavo', 'Small Crown Octavo', 'sm. cr. 8vo', 8, 16, 11.0, 17.5, 4.33, 6.89, 'Chain lines horizontal'),
  ('Octavo', 'Large Post Octavo', 'lg. post 8vo', 8, 16, 13.0, 21.0, 5.12, 8.27, 'Chain lines horizontal'),
  
  -- Duodecimo/Twelvemo formats (4 folds, special imposition = 12 leaves = 24 pages)
  ('Duodecimo', 'Crown Duodecimo', 'cr. 12mo', 12, 24, 12.5, 19.0, 4.92, 7.48, 'Chain lines diagonal'),
  ('Duodecimo', 'Post Duodecimo', 'post 12mo', 12, 24, 12.5, 19.5, 4.92, 7.68, 'Chain lines diagonal'),
  ('Duodecimo', 'Foolscap Duodecimo', 'fcp. 12mo', 12, 24, 10.5, 16.5, 4.13, 6.50, 'Chain lines diagonal'),
  ('Duodecimo', 'Demy Duodecimo', 'demy 12mo', 12, 24, 14.0, 22.5, 5.51, 8.86, 'Chain lines diagonal'),
  ('Duodecimo', 'Royal Duodecimo', 'roy. 12mo', 12, 24, 12.5, 20.0, 4.92, 7.87, 'Chain lines diagonal'),
  
  -- Sextodecimo/Sixteenmo formats (4 folds = 16 leaves = 32 pages)
  ('Sextodecimo', 'Crown Sextodecimo', 'cr. 16mo', 16, 32, 9.5, 12.5, 3.74, 4.92, 'Chain lines vertical'),
  ('Sextodecimo', 'Post Sextodecimo', 'post 16mo', 16, 32, 10.0, 12.5, 3.94, 4.92, 'Chain lines vertical'),
  ('Sextodecimo', 'Foolscap Sextodecimo', 'fcp. 16mo', 16, 32, 8.5, 10.5, 3.35, 4.13, 'Chain lines vertical'),
  ('Sextodecimo', 'Demy Sextodecimo', 'demy 16mo', 16, 32, 11.0, 14.0, 4.33, 5.51, 'Chain lines vertical'),
  ('Sextodecimo', 'Royal Sextodecimo', 'roy. 16mo', 16, 32, 12.5, 16.0, 4.92, 6.30, 'Chain lines vertical'),
  
  -- Octodecimo/Eighteenmo formats (18 leaves = 36 pages)
  ('Octodecimo', 'Crown Octodecimo', 'cr. 18mo', 18, 36, 9.5, 12.5, 3.74, 4.92, NULL),
  ('Octodecimo', 'Post Octodecimo', 'post 18mo', 18, 36, 10.0, 12.5, 3.94, 4.92, NULL),
  ('Octodecimo', 'Demy Octodecimo', 'demy 18mo', 18, 36, 10.0, 14.0, 3.94, 5.51, NULL),
  
  -- Vicesimo-quarto/Twenty-fourmo formats (24 leaves = 48 pages)
  ('Vicesimo-quarto', 'Crown Twenty-fourmo', 'cr. 24mo', 24, 48, 9.5, 12.5, 3.74, 4.92, NULL),
  ('Vicesimo-quarto', 'Post Twenty-fourmo', 'post 24mo', 24, 48, 9.0, 12.5, 3.54, 4.92, NULL),
  ('Vicesimo-quarto', 'Foolscap Twenty-fourmo', 'fcp. 24mo', 24, 48, 8.5, 10.5, 3.35, 4.13, NULL),
  
  -- Trigesimo-secundo/Thirty-twomo formats (32 leaves = 64 pages)
  ('Trigesimo-secundo', 'Crown Thirty-twomo', 'cr. 32mo', 32, 64, 6.5, 9.5, 2.56, 3.74, 'Miniature format'),
  ('Trigesimo-secundo', 'Post Thirty-twomo', 'post 32mo', 32, 64, 6.0, 10.0, 2.36, 3.94, 'Miniature format'),
  ('Trigesimo-secundo', 'Demy Thirty-twomo', 'demy 32mo', 32, 64, 7.0, 11.0, 2.76, 4.33, 'Miniature format'),
  
  -- Sexagesimo-quarto/Sixty-fourmo formats (64 leaves = 128 pages)
  ('Sexagesimo-quarto', 'Sixty-fourmo', '64mo', 64, 128, 5.0, 7.5, 1.97, 2.95, 'Micro format'),
  
  -- Modern standard sizes (ISO and US trade)
  ('Modern', 'A4', 'A4', NULL, NULL, 21.0, 29.7, 8.27, 11.69, 'ISO 216 standard'),
  ('Modern', 'A5', 'A5', NULL, NULL, 14.8, 21.0, 5.83, 8.27, 'ISO 216 standard'),
  ('Modern', 'A6', 'A6', NULL, NULL, 10.5, 14.8, 4.13, 5.83, 'ISO 216 standard, pocket size'),
  ('Modern', 'B5', 'B5', NULL, NULL, 17.6, 25.0, 6.93, 9.84, 'ISO 216 standard'),
  ('Modern', 'B6', 'B6', NULL, NULL, 12.5, 17.6, 4.92, 6.93, 'ISO 216 standard'),
  ('Modern', 'US Trade Paperback', 'trade pb', NULL, NULL, 15.2, 22.9, 6.0, 9.0, 'Standard US trade size'),
  ('Modern', 'US Mass Market Paperback', 'mm pb', NULL, NULL, 10.5, 17.5, 4.125, 6.875, 'Standard US rack size'),
  ('Modern', 'US Letter', 'letter', NULL, NULL, 21.6, 27.9, 8.5, 11.0, 'US standard'),
  ('Modern', 'US Legal', 'legal', NULL, NULL, 21.6, 35.6, 8.5, 14.0, 'US legal size'),
  
  -- Square formats
  ('Square', 'Small Square', 'sm. sq.', NULL, NULL, 17.8, 17.8, 7.0, 7.0, 'Coffee table format'),
  ('Square', 'Medium Square', 'med. sq.', NULL, NULL, 21.0, 21.0, 8.27, 8.27, 'Art book format'),
  ('Square', 'Large Square', 'lg. sq.', NULL, NULL, 30.5, 30.5, 12.0, 12.0, 'Large art book'),
  
  -- Landscape/oblong formats
  ('Oblong', 'Oblong Quarto', 'obl. 4to', 4, 8, 25.0, 19.0, 9.84, 7.48, 'Width greater than height'),
  ('Oblong', 'Oblong Octavo', 'obl. 8vo', 8, 16, 19.0, 12.5, 7.48, 4.92, 'Width greater than height'),
  ('Oblong', 'Oblong Folio', 'obl. fo.', 2, 4, 38.0, 25.0, 14.96, 9.84, 'Width greater than height'),
  
  -- Broadside
  ('Broadside', 'Broadside', 'broadside', 1, 1, NULL, NULL, NULL, NULL, 'Single sheet, printed one side'),
  ('Broadside', 'Broadsheet', 'broadsheet', 1, 2, NULL, NULL, NULL, NULL, 'Single sheet, printed both sides'),
  
  -- Scroll/roll formats (for Asian books)
  ('Roll', 'Scroll', 'scroll', NULL, NULL, NULL, NULL, NULL, NULL, 'Rolled format, common in Asian traditions'),
  ('Accordion', 'Accordion Fold', 'accordion', NULL, NULL, NULL, NULL, NULL, NULL, 'Concertina/leporello format'),
  
  -- Other descriptive sizes
  ('Descriptive', 'Miniature', 'miniature', NULL, NULL, NULL, 7.5, NULL, 3.0, 'Under 3 inches/7.5cm height'),
  ('Descriptive', 'Pocket', 'pocket', NULL, NULL, NULL, NULL, NULL, NULL, 'Small enough for pocket'),
  ('Descriptive', 'Oversize', 'oversize', NULL, NULL, NULL, NULL, NULL, NULL, 'Larger than standard shelf'),
  ('Descriptive', 'Elephant', 'elephant', NULL, NULL, NULL, NULL, NULL, NULL, 'Very large format')
ON CONFLICT DO NOTHING;
