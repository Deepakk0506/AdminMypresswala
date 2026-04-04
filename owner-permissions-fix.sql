-- Direct permissions fix for table owners
-- Since you own the tables, try this approach

-- Step 1: Grant permissions using current user (you as owner)
GRANT ALL PRIVILEGES ON public.services TO authenticated;
GRANT ALL PRIVILEGES ON public.garment_categories TO authenticated;
GRANT ALL PRIVILEGES ON public.garments TO authenticated;
GRANT ALL PRIVILEGES ON public.service_garment_pricing TO authenticated;

-- Step 2: Also grant to service_role
GRANT ALL PRIVILEGES ON public.services TO service_role;
GRANT ALL PRIVILEGES ON public.garment_categories TO service_role;
GRANT ALL PRIVILEGES ON public.garments TO service_role;
GRANT ALL PRIVILEGES ON public.service_garment_pricing TO service_role;

-- Step 3: Grant basic permissions to anon for read access
GRANT SELECT ON public.services TO anon;
GRANT SELECT ON public.garment_categories TO anon;
GRANT SELECT ON public.garments TO anon;
GRANT SELECT ON public.service_garment_pricing TO anon;

-- Step 4: Test with a simple insert to verify
INSERT INTO public.services (name, description, is_active) 
VALUES ('Permission Test', 'Testing if permissions work', true);

-- Step 5: Clean up test data
DELETE FROM public.services WHERE name = 'Permission Test';

-- Step 6: Verify permissions
SELECT 
    table_name,
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND table_name IN ('services', 'garment_categories', 'garments', 'service_garment_pricing')
    AND grantee IN ('authenticated', 'service_role')
    AND privilege_type IN ('SELECT', 'INSERT', 'UPDATE', 'DELETE')
ORDER BY table_name, grantee, privilege_type;
