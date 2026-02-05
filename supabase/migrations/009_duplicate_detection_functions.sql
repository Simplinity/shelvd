-- ============================================================================
-- DUPLICATE DETECTION FUNCTIONS
-- Fast server-side duplicate detection
-- ============================================================================

-- Find ISBN-13 duplicates
CREATE OR REPLACE FUNCTION find_isbn13_duplicates()
RETURNS TABLE (isbn_13 text, books jsonb) 
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.isbn_13::text,
    jsonb_agg(
      jsonb_build_object(
        'id', b.id,
        'title', b.title,
        'author', COALESCE(c.canonical_name, ''),
        'publication_year', COALESCE(b.publication_year, ''),
        'publisher_name', COALESCE(b.publisher_name, ''),
        'isbn_13', COALESCE(b.isbn_13, ''),
        'isbn_10', COALESCE(b.isbn_10, '')
      ) ORDER BY b.title
    ) as books
  FROM books b
  LEFT JOIN LATERAL (
    SELECT cont.canonical_name 
    FROM book_contributors bc
    JOIN contributors cont ON cont.id = bc.contributor_id
    WHERE bc.book_id = b.id
    ORDER BY bc.sort_order
    LIMIT 1
  ) c ON true
  WHERE b.user_id = auth.uid()
    AND b.isbn_13 IS NOT NULL 
    AND b.isbn_13 != ''
  GROUP BY b.isbn_13
  HAVING COUNT(*) > 1;
END;
$$ LANGUAGE plpgsql;

-- Find ISBN-10 duplicates
CREATE OR REPLACE FUNCTION find_isbn10_duplicates()
RETURNS TABLE (isbn_10 text, books jsonb) 
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.isbn_10::text,
    jsonb_agg(
      jsonb_build_object(
        'id', b.id,
        'title', b.title,
        'author', COALESCE(c.canonical_name, ''),
        'publication_year', COALESCE(b.publication_year, ''),
        'publisher_name', COALESCE(b.publisher_name, ''),
        'isbn_13', COALESCE(b.isbn_13, ''),
        'isbn_10', COALESCE(b.isbn_10, '')
      ) ORDER BY b.title
    ) as books
  FROM books b
  LEFT JOIN LATERAL (
    SELECT cont.canonical_name 
    FROM book_contributors bc
    JOIN contributors cont ON cont.id = bc.contributor_id
    WHERE bc.book_id = b.id
    ORDER BY bc.sort_order
    LIMIT 1
  ) c ON true
  WHERE b.user_id = auth.uid()
    AND b.isbn_10 IS NOT NULL 
    AND b.isbn_10 != ''
  GROUP BY b.isbn_10
  HAVING COUNT(*) > 1;
END;
$$ LANGUAGE plpgsql;

-- Find exact title duplicates
CREATE OR REPLACE FUNCTION find_title_duplicates()
RETURNS TABLE (title text, books jsonb) 
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    lower(trim(b.title))::text as norm_title,
    jsonb_agg(
      jsonb_build_object(
        'id', b.id,
        'title', b.title,
        'author', COALESCE(c.canonical_name, ''),
        'publication_year', COALESCE(b.publication_year, ''),
        'publisher_name', COALESCE(b.publisher_name, ''),
        'isbn_13', COALESCE(b.isbn_13, ''),
        'isbn_10', COALESCE(b.isbn_10, '')
      ) ORDER BY b.title
    ) as books
  FROM books b
  LEFT JOIN LATERAL (
    SELECT cont.canonical_name 
    FROM book_contributors bc
    JOIN contributors cont ON cont.id = bc.contributor_id
    WHERE bc.book_id = b.id
    ORDER BY bc.sort_order
    LIMIT 1
  ) c ON true
  WHERE b.user_id = auth.uid()
    AND b.title IS NOT NULL 
    AND b.title != ''
  GROUP BY lower(trim(b.title))
  HAVING COUNT(*) > 1;
END;
$$ LANGUAGE plpgsql;

-- Placeholder for fuzzy matching (requires pg_trgm extension)
CREATE OR REPLACE FUNCTION find_fuzzy_title_duplicates(similarity_threshold float)
RETURNS TABLE (title text, similarity float, books jsonb) 
SECURITY DEFINER
AS $$
BEGIN
  RETURN;
END;
$$ LANGUAGE plpgsql;
