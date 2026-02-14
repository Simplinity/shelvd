-- Fix condition grades to conform to ABAA/ABA antiquarian standards
-- 1. Rename "Mint" → "As New" (ABAA standard term)
-- 2. Rename "Fine Plus" → "Near Fine" (ABAA standard term, abbreviation NF)
-- 3. Add "Fair" grade between Good and Poor (missing standard grade)

-- Rename Mint → As New
UPDATE conditions SET name = 'As New', description = 'Perfect, as issued. No defects, no wear, no marks. Extremely rare in older books.' WHERE abbreviation = 'M' AND name = 'Mint';

-- Rename Fine Plus → Near Fine, fix abbreviation
UPDATE conditions SET name = 'Near Fine', abbreviation = 'NF', description = 'Nearly as new with only the slightest signs of age or handling. No significant defects.' WHERE abbreviation = 'F+' AND name = 'Fine Plus';

-- Add Fair between Good Minus (sort_order 8) and Poor (sort_order 9)
-- First bump Poor to make room
UPDATE conditions SET sort_order = 10 WHERE abbreviation = 'P' AND name = 'Poor';

-- Insert Fair
INSERT INTO conditions (abbreviation, name, description, sort_order)
VALUES ('Fr', 'Fair', 'Worn but intact. Noticeable defects, soiling, or damage. All text present. A reading copy.', 9)
ON CONFLICT (abbreviation) DO NOTHING;
