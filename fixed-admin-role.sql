-- Fixed admin role creation without postgres role grant

-- Step 1: Create dedicated admin role
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'admin_role') THEN
        CREATE ROLE admin_role NOINHERIT NOCREATEDB NOCREATEROLE LOGIN PASSWORD 'admin123';
    END IF;
END $$;

-- Step 2: Grant all schema permissions to admin_role
GRANT USAGE ON SCHEMA public TO admin_role;
GRANT CREATE ON SCHEMA public TO admin_role;

-- Step 3: Grant all table permissions to admin_role
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO admin_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO admin_role;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO admin_role;

-- Step 4: Grant specific table permissions (explicit)
GRANT ALL PRIVILEGES ON public.services TO admin_role;
GRANT ALL PRIVILEGES ON public.garment_categories TO admin_role;
GRANT ALL PRIVILEGES ON public.garments TO admin_role;
GRANT ALL PRIVILEGES ON public.service_garment_pricing TO admin_role;

-- Step 5: Also try to fix authenticated permissions with different approach
-- Remove existing grants first
REVOKE ALL ON public.services FROM authenticated CASCADE;
REVOKE ALL ON public.garment_categories FROM authenticated CASCADE;
REVOKE ALL ON public.garments FROM authenticated CASCADE;
REVOKE ALL ON public.service_garment_pricing FROM authenticated CASCADE;

-- Re-grant with explicit permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.garment_categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.garments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_garment_pricing TO authenticated;

-- Step 6: Test admin_role permissions
SET ROLE admin_role;

-- Step 7: Test insert
INSERT INTO public.services (name, description, is_active) 
VALUES ('Admin Role Test', 'Testing admin role permissions', true)
ON CONFLICT DO NOTHING;

-- Step 8: Clean up test
DELETE FROM public.services WHERE name = 'Admin Role Test';

-- Step 9: Reset role
RESET ROLE;

-- Step 10: Verify admin_role permissions
SELECT 
    table_name,
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND table_name IN ('services', 'garment_categories', 'garments', 'service_garment_pricing')
    AND grantee IN ('admin_role', 'authenticated')
    AND privilege_type IN ('SELECT', 'INSERT', 'UPDATE', 'DELETE')
ORDER BY table_name, grantee, privilege_type;
