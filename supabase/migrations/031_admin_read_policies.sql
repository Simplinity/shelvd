-- Admin read policies for user detail page
-- Without these, admin can only see their own data due to RLS

-- Books: admin can read all books
CREATE POLICY "Admins can read all books" ON books
  FOR SELECT USING (is_admin());

-- Collections: admin can read all collections  
CREATE POLICY "Admins can read all collections" ON collections
  FOR SELECT USING (is_admin());

-- Book contributors: admin can read all
CREATE POLICY "Admins can read all book_contributors" ON book_contributors
  FOR SELECT USING (is_admin());

-- Book tags: admin can read all
CREATE POLICY "Admins can read all book_tags" ON book_tags
  FOR SELECT USING (is_admin());
