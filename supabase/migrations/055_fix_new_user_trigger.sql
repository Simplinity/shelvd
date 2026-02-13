-- 055: Fix handle_new_user trigger to handle re-signups gracefully
-- If a user already has a profile (e.g. from a previous unconfirmed signup),
-- don't fail — just update the display name.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, display_name, created_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    display_name = COALESCE(
      EXCLUDED.display_name,
      user_profiles.display_name
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
