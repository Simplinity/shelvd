-- Migration 026: Admin stats RPC functions
-- Bypass RLS to provide platform-wide statistics for admin dashboard

-- Books grouped by status (all users)
CREATE OR REPLACE FUNCTION get_books_by_status_for_admin()
RETURNS TABLE(status TEXT, count BIGINT)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT b.status, count(*) as count
  FROM books b
  GROUP BY b.status
  ORDER BY count DESC;
$$;

-- Books grouped by condition (all users)
CREATE OR REPLACE FUNCTION get_books_by_condition_for_admin()
RETURNS TABLE(condition_name TEXT, count BIGINT)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(c.name, 'Not set') as condition_name, count(*) as count
  FROM books b
  LEFT JOIN conditions c ON b.condition_id = c.id
  GROUP BY c.name
  ORDER BY count DESC;
$$;

-- Top publishers (all users)
CREATE OR REPLACE FUNCTION get_top_publishers_for_admin(lim INT DEFAULT 10)
RETURNS TABLE(publisher TEXT, count BIGINT)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(b.publisher_name, 'Unknown') as publisher, count(*) as count
  FROM books b
  WHERE b.publisher_name IS NOT NULL AND b.publisher_name != ''
  GROUP BY b.publisher_name
  ORDER BY count DESC
  LIMIT lim;
$$;

-- Books added per month (all users)
CREATE OR REPLACE FUNCTION get_books_by_month_for_admin()
RETURNS TABLE(month TEXT, count BIGINT)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT to_char(b.created_at, 'YYYY-MM') as month, count(*) as count
  FROM books b
  GROUP BY month
  ORDER BY month;
$$;

-- Books per user (all users, for distribution)
CREATE OR REPLACE FUNCTION get_books_per_user_for_admin()
RETURNS TABLE(user_id UUID, email TEXT, book_count BIGINT)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    up.id as user_id,
    COALESCE(au.email, 'unknown') as email,
    COALESCE(bc.book_count, 0) as book_count
  FROM user_profiles up
  LEFT JOIN auth.users au ON au.id = up.id
  LEFT JOIN (
    SELECT b.user_id, count(*) as book_count
    FROM books b
    GROUP BY b.user_id
  ) bc ON bc.user_id = up.id
  ORDER BY book_count DESC;
$$;

-- Platform totals for admin dashboard
CREATE OR REPLACE FUNCTION get_platform_stats_for_admin()
RETURNS TABLE(
  total_users BIGINT,
  total_books BIGINT,
  total_contributors BIGINT,
  total_collections BIGINT,
  total_provenance BIGINT,
  total_tags BIGINT,
  total_external_links BIGINT,
  total_feedback BIGINT,
  books_no_isbn BIGINT,
  books_no_condition BIGINT,
  books_no_publisher BIGINT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (SELECT count(*) FROM user_profiles) as total_users,
    (SELECT count(*) FROM books) as total_books,
    (SELECT count(*) FROM contributors) as total_contributors,
    (SELECT count(*) FROM collections) as total_collections,
    (SELECT count(*) FROM provenance_entries) as total_provenance,
    (SELECT count(*) FROM tags) as total_tags,
    (SELECT count(*) FROM book_external_links) as total_external_links,
    (SELECT count(*) FROM feedback) as total_feedback,
    (SELECT count(*) FROM books WHERE isbn_13 IS NULL AND isbn_10 IS NULL) as books_no_isbn,
    (SELECT count(*) FROM books WHERE condition_id IS NULL) as books_no_condition,
    (SELECT count(*) FROM books WHERE publisher_name IS NULL OR publisher_name = '') as books_no_publisher;
$$;

-- User signups per week (for growth chart)
CREATE OR REPLACE FUNCTION get_signups_by_week_for_admin()
RETURNS TABLE(week TEXT, count BIGINT)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT to_char(date_trunc('week', created_at), 'YYYY-MM-DD') as week, count(*) as count
  FROM user_profiles
  GROUP BY week
  ORDER BY week;
$$;
