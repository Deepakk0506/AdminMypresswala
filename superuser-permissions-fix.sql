-- Superuser permissions fix - Use postgres role

-- Set current user to postgres (superuser)
SET SESSION AUTHORIZATION postgres;

-- Now grant permissions as superuser
GRANT ALL PRIVILEGES ON public.services TO authenticated;
GRANT ALL PRIVILEGES ON public.garment_categories TO authenticated;
GRANT ALL PRIVILEGES ON public.garments TO authenticated;
GRANT ALL PRIVILEGES ON public.service_garment_pricing TO authenticated;

GRANT ALL PRIVILEGES ON public.services TO service_role;
GRANT ALL PRIVILEGES ON public.garment_categories TO service_role;
GRANT ALL PRIVILEGES ON public.garments TO service_role;
GRANT ALL PRIVILEGES ON public.service_garment_pricing TO service_role;

-- Reset session authorization
RESET SESSION AUTHORIZATION;

-- Verify
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
