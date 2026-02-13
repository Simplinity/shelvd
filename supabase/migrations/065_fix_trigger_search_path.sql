-- 065: Fix trigger search_path — use fully qualified table names
-- Both triggers fail because SECURITY DEFINER functions don't have
-- public in their search_path on newer Supabase versions.

-- Fix 1: handle_new_user (creates user_profiles row)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, display_name, created_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix 2: create_default_collection (creates Library collection)
CREATE OR REPLACE FUNCTION public.create_default_collection()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.collections (user_id, name, is_default, sort_order)
  VALUES (NEW.id, 'Library', true, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
