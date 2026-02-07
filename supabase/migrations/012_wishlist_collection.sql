-- Migration 012: Add default "Wishlist" collection for all users
-- Wishlist is a regular collection (same schema), just auto-created alongside Library

-- 1. Seed: create "Wishlist" for all existing users who don't have one yet
INSERT INTO collections (user_id, name, description, is_default, sort_order)
SELECT id, 'Wishlist', 'Books you want to add to your collection', false, 1
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM collections c WHERE c.user_id = u.id AND c.name = 'Wishlist'
);

-- 2. Update the trigger function to also create Wishlist for new users
CREATE OR REPLACE FUNCTION create_default_collection()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO collections (user_id, name, is_default, sort_order)
  VALUES (NEW.id, 'Library', true, 0);
  INSERT INTO collections (user_id, name, description, is_default, sort_order)
  VALUES (NEW.id, 'Wishlist', 'Books you want to add to your collection', false, 1);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
