-- Simple approach: Direct permissions without creating roles

-- Step 1: Try using the current user's full permissions
-- First, let's see what user we're running as
SELECT current_user, session_user;

-- Step 2: Try different permission grant approaches
-- Approach A: Grant to current user directly
GRANT ALL PRIVILEGES ON public.services TO CURRENT_USER;
GRANT ALL PRIVILEGES ON public.garment_categories TO CURRENT_USER;
GRANT ALL PRIVILEGES ON public.garments TO CURRENT_USER;
GRANT ALL PRIVILEGES ON public.service_garment_pricing TO CURRENT_USER;

-- Step 3: Try granting to public (if current_USER doesn't work)
GRANT ALL PRIVILEGES ON public.services TO PUBLIC;
GRANT ALL PRIVILEGES ON public.garment_categories TO PUBLIC;
GRANT ALL PRIVILEGES ON public.garments TO PUBLIC;
GRANT ALL PRIVILEGES ON public.service_garment_pricing TO PUBLIC;

-- Step 4: Try removing and re-adding authenticated permissions
REVOKE ALL ON public.services FROM authenticated;
REVOKE ALL ON public.garment_categories FROM authenticated;
REVOKE ALL ON public.garments FROM authenticated;
REVOKE ALL ON public.service_garment_pricing FROM authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.services TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.garment_categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.garments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.service_garment_pricing TO authenticated;

-- Step 5: Test with a simple insert
INSERT INTO public.services (name, description, is_active) 
VALUES ('Direct Test', 'Testing direct permissions', true)
ON CONFLICT DO NOTHING;

-- Step 6: Clean up test
DELETE FROM public.services WHERE name = 'Direct Test';

-- Step 7: Check final permissions
SELECT 
    table_name,
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND table_name IN ('services', 'garment_categories', 'garments', 'service_garment_pricing')
    AND grantee IN ('authenticated', 'public', CURRENT_USER)
    AND privilege_type IN ('SELECT', 'INSERT', 'UPDATE', 'DELETE')
ORDER BY table_name, grantee, privilege_type;
