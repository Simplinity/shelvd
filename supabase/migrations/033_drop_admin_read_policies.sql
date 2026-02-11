-- DROP the overly broad admin read policies from 031
-- These caused admins to see ALL users' books in their own collection view!
-- Admin cross-user visibility is handled by SECURITY DEFINER RPCs (032) instead.

DROP POLICY IF EXISTS "Admins can read all books" ON books;
DROP POLICY IF EXISTS "Admins can read all collections" ON collections;
DROP POLICY IF EXISTS "Admins can read all book_contributors" ON book_contributors;
DROP POLICY IF EXISTS "Admins can read all book_tags" ON book_tags;
