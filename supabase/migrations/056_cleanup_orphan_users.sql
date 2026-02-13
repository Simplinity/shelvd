-- 056: Clean up orphaned auth users that shouldn't exist
-- Only keep bruno@simplinity.co and bruno@vanbranden.be
-- Delete any others (like bvanbranden@icloud.com from failed signup)

-- First delete any user_profiles for non-legit users
DELETE FROM public.user_profiles
WHERE id NOT IN (
  SELECT id FROM auth.users 
  WHERE email IN ('bruno@simplinity.co', 'bruno@vanbranden.be')
);

-- Then delete the auth users themselves
DELETE FROM auth.users
WHERE email NOT IN ('bruno@simplinity.co', 'bruno@vanbranden.be');
