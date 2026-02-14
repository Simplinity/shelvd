-- Book Conditions
-- Standard antiquarian book condition grades
-- Source: ABAA (Antiquarian Booksellers' Association of America) standards

INSERT INTO conditions (abbreviation, name, description, sort_order) VALUES
  ('M', 'As New', 'Perfect, as issued. No defects, no wear, no marks. Extremely rare in older books.', 1),
  ('NF', 'Near Fine', 'Nearly as new with only the slightest signs of age or handling. No significant defects.', 2),
  ('F', 'Fine', 'Close to mint with no defects. May show minimal signs of careful use. Tight binding, clean pages.', 3),
  ('VG+', 'Very Good Plus', 'Better than very good with only minor wear. All text and illustrations complete.', 4),
  ('VG', 'Very Good', 'Shows some small signs of wear but no tears. May have minor marking, bookplate, or small inscription. Binding still tight.', 5),
  ('G+', 'Good Plus', 'Better than good. Average used book with all pages present. May have inscriptions, light foxing, or minor edge wear.', 6),
  ('G', 'Good', 'Average used condition. Reading copy with all text intact. May have considerable wear, soiling, or library markings.', 7),
  ('G-', 'Good Minus', 'Worn but complete. May have loose binding, tears (not affecting text), or heavy markings.', 8),
  ('Fr', 'Fair', 'Worn but intact. Noticeable defects, soiling, or damage. All text present. A reading copy.', 9),
  ('P', 'Poor', 'Very worn but still readable and complete. May have significant damage but holds together. Reading copy only.', 10)
ON CONFLICT (abbreviation) DO NOTHING;
