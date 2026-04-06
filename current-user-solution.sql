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

-- Drop the price table
DROP TABLE IF EXISTS price;

-- Query to check columns and data types for a specific table
-- Replace 'your_table_name' with the actual table name you want to inspect
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'your_table_name'  -- Replace with your table name
ORDER BY ordinal_position;

-- Check current user and table ownership
SELECT current_user, session_user;

-- Check who owns the service_garment_pricing table
SELECT tableowner FROM pg_tables WHERE tablename = 'service_garment_pricing';

-- Check the actual column names in the services table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'services'
ORDER BY ordinal_position;

-- Check the actual column names in the garments table  
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'garments'
ORDER BY ordinal_position;

-- Test the corrected query
SELECT 
    sgp.*,
    s.name as service_name,
    g.name as garment_name
FROM service_garment_pricing sgp
LEFT JOIN services s ON sgp.service_id = s.id
LEFT JOIN garments g ON sgp.garment_id = g.id
LIMIT 5;

-- Check existing constraints
SELECT 
    constraint_name,
    table_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name IN ('service_garment_pricing', 'services', 'garments')
ORDER BY table_name, constraint_name;

-- Try a simpler approach - test if we can query without explicit constraints
SELECT 
    sgp.id,
    sgp.price,
    sgp.is_available,
    s.name as service_name,
    g.name as garment_name
FROM service_garment_pricing sgp
INNER JOIN services s ON sgp.service_id = s.id
INNER JOIN garments g ON sgp.garment_id = g.id
ORDER BY sgp.id
LIMIT 5;
