-- 062: Deep clean — remove ALL traces of orphaned auth users
-- auth.users has FK cascades to identities, sessions, etc.
-- but we need to be thorough

-- Check what auth tables exist and clean them
DELETE FROM auth.sessions 
WHERE user_id NOT IN (SELECT id FROM auth.users);

DELETE FROM auth.refresh_tokens 
WHERE instance_id NOT IN (SELECT instance_id FROM auth.instances)
OR session_id NOT IN (SELECT id FROM auth.sessions);

DELETE FROM auth.mfa_factors
WHERE user_id NOT IN (SELECT id FROM auth.users);

DELETE FROM auth.identities
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Also clean any flow_state entries
DELETE FROM auth.flow_state
WHERE user_id IS NOT NULL 
AND user_id NOT IN (SELECT id FROM auth.users);
