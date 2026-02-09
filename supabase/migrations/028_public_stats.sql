-- Public stats function for auth pages (no login required)
-- Returns aggregate counts only — no sensitive data exposed

CREATE OR REPLACE FUNCTION get_public_stats()
RETURNS JSON
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT json_build_object(
    'total_books', (SELECT count(*) FROM books),
    'total_contributors', (SELECT count(*) FROM contributors),
    'total_images', (SELECT count(*) FROM book_images),
    'total_collections', (SELECT count(*) FROM collections)
  );
$$;

-- Allow anonymous access
GRANT EXECUTE ON FUNCTION get_public_stats() TO anon;
GRANT EXECUTE ON FUNCTION get_public_stats() TO authenticated;
