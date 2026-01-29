-- Master seed file for Shelvd
-- Run with: psql "postgresql://postgres:LsY1yr4siVYlZhiN@db.euieagntkbhzkyzvnllx.supabase.co:5432/postgres" -f supabase/seed.sql
-- From the project root: ~/Documents/GitHub/shelvd/

-- Reference tables (shared across all users)
\i supabase/seed/conditions.sql
\i supabase/seed/bindings.sql
\i supabase/seed/book_parts.sql
\i supabase/seed/book_formats.sql
\i supabase/seed/languages.sql
\i supabase/seed/contributor_roles.sql
\i supabase/seed/dewey_classifications.sql
\i supabase/seed/bisac_codes.sql
