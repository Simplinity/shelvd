-- Update public stats: replace images with publishers count

CREATE OR REPLACE FUNCTION get_public_stats()
RETURNS JSON
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT json_build_object(
    'total_books', (SELECT count(*) FROM books),
    'total_contributors', (SELECT count(*) FROM contributors),
    'total_publishers', (SELECT count(DISTINCT publisher_name) FROM books WHERE publisher_name IS NOT NULL AND publisher_name != ''),
    'total_collections', (SELECT count(*) FROM collections)
  );
$$;
