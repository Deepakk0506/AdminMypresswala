-- Alternative approach: Create admin user and bypass restrictions

-- Step 1: Create a dedicated admin role
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'admin_role') THEN
        CREATE ROLE admin_role WITH LOGIN PASSWORD 'admin123';
    END IF;
END $$;

-- Step 2: Grant admin role superuser-like permissions
GRANT postgres TO admin_role WITH ADMIN OPTION;

-- Step 3: Grant all permissions on all tables to admin_role
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO admin_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO admin_role;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO admin_role;

-- Step 4: Also try direct table grants (alternative approach)
GRANT ALL PRIVILEGES ON TABLE public.services TO admin_role;
GRANT ALL PRIVILEGES ON TABLE public.garment_categories TO admin_role;
GRANT ALL PRIVILEGES ON TABLE public.garments TO admin_role;
GRANT ALL PRIVILEGES ON TABLE public.service_garment_pricing TO admin_role;

-- Step 5: Update your app to use admin_role
-- You'll need to update your Supabase client to use this role

-- Step 6: Test the new role
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
    AND grantee = 'admin_role'
ORDER BY table_name, privilege_type;
