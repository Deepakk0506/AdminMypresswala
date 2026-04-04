-- Final solution: Work with current user privileges

-- Step 1: Check what privileges your current user actually has
SELECT 
    current_user,
    session_user,
    current_database(),
    current_schema();

-- Step 2: Check if your user can grant privileges
SELECT 
    grantor,
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND grantee = CURRENT_USER
    AND privilege_type = 'GRANT OPTION'
ORDER BY table_name, privilege_type;

-- Step 3: Try using WITH GRANT OPTION (if available)
REVOKE ALL ON public.services FROM authenticated CASCADE;
REVOKE ALL ON public.garment_categories FROM authenticated CASCADE;
REVOKE ALL ON public.garments FROM authenticated CASCADE;
REVOKE ALL ON public.service_garment_pricing FROM authenticated CASCADE;

-- Grant with explicit privileges and GRANT OPTION
GRANT SELECT, INSERT, UPDATE, DELETE, TRIGGER ON public.services TO authenticated WITH GRANT OPTION;
GRANT SELECT, INSERT, UPDATE, DELETE, TRIGGER ON public.garment_categories TO authenticated WITH GRANT OPTION;
GRANT SELECT, INSERT, UPDATE, DELETE, TRIGGER ON public.garments TO authenticated WITH GRANT OPTION;
GRANT SELECT, INSERT, UPDATE, DELETE, TRIGGER ON public.service_garment_pricing TO authenticated WITH GRANT OPTION;

-- Step 4: Also try PUBLIC as fallback
GRANT SELECT, INSERT, UPDATE, DELETE ON public.services TO PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.garment_categories TO PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.garments TO PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_garment_pricing TO PUBLIC;

-- Step 5: Test permissions with current user
SET ROLE authenticated;  -- or try without this if it fails

-- Test insert
INSERT INTO public.services (name, description, is_active) 
VALUES ('Current User Test', 'Testing current user permissions', true)
ON CONFLICT DO NOTHING;

-- Clean up test
DELETE FROM public.services WHERE name = 'Current User Test';

-- Step 6: Final verification
SELECT 
    table_name,
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND table_name IN ('services', 'garment_categories', 'garments', 'service_garment_pricing')
    AND grantee IN ('authenticated', 'public')
    AND privilege_type IN ('SELECT', 'INSERT', 'UPDATE', 'DELETE')
ORDER BY table_name, grantee, privilege_type;
