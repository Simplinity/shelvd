-- Migration 067: Fix get_value_summary — exclude provenance_purchase from "current value"
--
-- Problem: provenance_purchase entries (what was paid) were being picked as
-- "latest valuation" because they had the highest position number. This caused
-- collection values to show acquisition cost instead of estimated worth.
--
-- Fix: filter WHERE source != 'provenance_purchase' in the latest_valuations CTE.

CREATE OR REPLACE FUNCTION get_value_summary(
  p_user_id UUID,
  p_collection_id UUID DEFAULT NULL,
  p_tag_id UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH book_ids AS (
    SELECT b.id
    FROM books b
    WHERE b.user_id = p_user_id
      AND (p_collection_id IS NULL OR b.id IN (
        SELECT bc.book_id FROM book_collections bc WHERE bc.collection_id = p_collection_id
      ))
      AND (p_tag_id IS NULL OR b.id IN (
        SELECT bt.book_id FROM book_tags bt WHERE bt.tag_id = p_tag_id
      ))
  ),
  latest_valuations AS (
    SELECT DISTINCT ON (vh.book_id) vh.book_id, vh.value
    FROM valuation_history vh
    INNER JOIN book_ids bi ON bi.id = vh.book_id
    WHERE vh.source != 'provenance_purchase'
    ORDER BY vh.book_id, vh.position DESC
  ),
  acquisition_prices AS (
    SELECT DISTINCT ON (pe.book_id) pe.book_id, pe.price_paid
    FROM provenance_entries pe
    INNER JOIN book_ids bi ON bi.id = pe.book_id
    WHERE pe.owner_type = 'self' AND pe.price_paid IS NOT NULL AND pe.price_paid > 0
    ORDER BY pe.book_id, pe.position ASC
  )
  SELECT json_build_object(
    'total_estimated', COALESCE((SELECT SUM(value) FROM latest_valuations), 0),
    'total_acquired', COALESCE((SELECT SUM(price_paid) FROM acquisition_prices), 0),
    'book_count', (SELECT COUNT(*) FROM book_ids WHERE id IN (SELECT book_id FROM latest_valuations) OR id IN (SELECT book_id FROM acquisition_prices)),
    'total_books', (SELECT COUNT(*) FROM book_ids)
  );
$$;
