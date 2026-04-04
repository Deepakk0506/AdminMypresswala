-- Complete permissions fix for admin panel
-- RLS is already disabled, but authenticated users need permissions

-- Grant ALL permissions to authenticated users for all admin tables
GRANT ALL ON public.services TO authenticated;
GRANT ALL ON public.garment_categories TO authenticated;
GRANT ALL ON public.garments TO authenticated;
GRANT ALL ON public.service_garment_pricing TO authenticated;

-- Grant ALL permissions to service_role (in case your app uses this role)
GRANT ALL ON public.services TO service_role;
GRANT ALL ON public.garment_categories TO service_role;
GRANT ALL ON public.garments TO service_role;
GRANT ALL ON public.service_garment_pricing TO service_role;

-- Grant read permissions to anon users (for public access)
GRANT SELECT ON public.services TO anon;
GRANT SELECT ON public.garment_categories TO anon;
GRANT SELECT ON public.garments TO anon;
GRANT SELECT ON public.service_garment_pricing TO anon;

-- Verify the fix
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
