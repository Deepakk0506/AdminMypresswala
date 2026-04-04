-- Check what user your app is connecting as
SELECT 
    session_user,
    current_user,
    current_role();

-- Check all available roles
SELECT rolname FROM pg_roles ORDER BY rolname;

-- Check current database permissions
SELECT 
    schemaname,
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
