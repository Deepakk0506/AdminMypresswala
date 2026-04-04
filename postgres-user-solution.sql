-- Solution: Connect as postgres user instead of authenticated

-- Step 1: Grant postgres user login capabilities
ALTER ROLE postgres LOGIN;

-- Step 2: Set postgres password (if needed)
-- ALTER ROLE postgres PASSWORD 'your_postgres_password';

-- Step 3: Test postgres user can access tables
SELECT 
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('services', 'garment_categories', 'garments', 'service_garment_pricing')
ORDER BY tablename;

-- Step 4: Verify postgres user permissions
SELECT 
    table_name,
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND table_name IN ('services', 'garment_categories', 'garments', 'service_garment_pricing')
    AND grantee = 'postgres'
    AND privilege_type IN ('SELECT', 'INSERT', 'UPDATE', 'DELETE')
ORDER BY table_name, privilege_type;
