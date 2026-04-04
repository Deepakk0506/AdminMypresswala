-- Final approach: Check and fix table ownership

-- Step 1: Check who actually owns these tables
SELECT 
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('services', 'garment_categories', 'garments', 'service_garment_pricing')
ORDER BY tablename;

-- Step 2: If you don't own them, transfer ownership
-- (Run this only if you're not the owner shown above)

/*
ALTER TABLE public.services OWNER TO CURRENT_USER;
ALTER TABLE public.garment_categories OWNER TO CURRENT_USER;
ALTER TABLE public.garments OWNER TO CURRENT_USER;
ALTER TABLE public.service_garment_pricing OWNER TO CURRENT_USER;
*/

-- Step 3: Grant permissions to the actual owner
GRANT ALL PRIVILEGES ON public.services TO CURRENT_USER;
GRANT ALL PRIVILEGES ON public.garment_categories TO CURRENT_USER;
GRANT ALL PRIVILEGES ON public.garments TO CURRENT_USER;
GRANT ALL PRIVILEGES ON public.service_garment_pricing TO CURRENT_USER;

-- Step 4: Also grant to authenticated and public
GRANT ALL PRIVILEGES ON public.services TO authenticated;
GRANT ALL PRIVILEGES ON public.garment_categories TO authenticated;
GRANT ALL PRIVILEGES ON public.garments TO authenticated;
GRANT ALL PRIVILEGES ON public.service_garment_pricing TO authenticated;

GRANT ALL PRIVILEGES ON public.services TO PUBLIC;
GRANT ALL PRIVILEGES ON public.garment_categories TO PUBLIC;
GRANT ALL PRIVILEGES ON public.garments TO PUBLIC;
GRANT ALL PRIVILEGES ON public.service_garment_pricing TO PUBLIC;

-- Step 5: Test permissions
INSERT INTO public.services (name, description, is_active) 
VALUES ('Final Test', 'Testing final approach', true)
ON CONFLICT DO NOTHING;

-- Step 6: Clean up
DELETE FROM public.services WHERE name = 'Final Test';

-- Step 7: Verify final state
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
