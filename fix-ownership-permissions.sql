-- Fix table ownership and permissions - Complete solution

-- Step 1: Check current table owners
SELECT 
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('services', 'garment_categories', 'garments', 'service_garment_pricing')
ORDER BY tablename;

-- Step 2: Change table ownership to postgres (superuser)
ALTER TABLE public.services OWNER TO postgres;
ALTER TABLE public.garment_categories OWNER TO postgres;
ALTER TABLE public.garments OWNER TO postgres;
ALTER TABLE public.service_garment_pricing OWNER TO postgres;

-- Step 3: Grant permissions with proper syntax
-- Revoke first to clean up
REVOKE ALL ON public.services FROM authenticated;
REVOKE ALL ON public.garment_categories FROM authenticated;
REVOKE ALL ON public.garments FROM authenticated;
REVOKE ALL ON public.service_garment_pricing FROM authenticated;

REVOKE ALL ON public.services FROM service_role;
REVOKE ALL ON public.garment_categories FROM service_role;
REVOKE ALL ON public.garments FROM service_role;
REVOKE ALL ON public.service_garment_pricing FROM service_role;

-- Grant permissions with option cascade
GRANT ALL PRIVILEGES ON public.services TO authenticated WITH GRANT OPTION;
GRANT ALL PRIVILEGES ON public.garment_categories TO authenticated WITH GRANT OPTION;
GRANT ALL PRIVILEGES ON public.garments TO authenticated WITH GRANT OPTION;
GRANT ALL PRIVILEGES ON public.service_garment_pricing TO authenticated WITH GRANT OPTION;

GRANT ALL PRIVILEGES ON public.services TO service_role WITH GRANT OPTION;
GRANT ALL PRIVILEGES ON public.garment_categories TO service_role WITH GRANT OPTION;
GRANT ALL PRIVILEGES ON public.garments TO service_role WITH GRANT OPTION;
GRANT ALL PRIVILEGES ON public.service_garment_pricing TO service_role WITH GRANT OPTION;

-- Step 4: Grant basic permissions to anon
GRANT SELECT ON public.services TO anon;
GRANT SELECT ON public.garment_categories TO anon;
GRANT SELECT ON public.garments TO anon;
GRANT SELECT ON public.service_garment_pricing TO anon;

-- Step 5: Verify the fix
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
