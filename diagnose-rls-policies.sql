-- Check current RLS policies and permissions
-- Run this first to see what's currently configured

-- Check if RLS is enabled on tables
SELECT 
    tablename,
    rowsecurity as "RLS Enabled",
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('services', 'garment_categories', 'garments', 'service_garment_pricing')
ORDER BY tablename;

-- Check existing RLS policies
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd as "Command",
    qual as "Qualification"
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN ('services', 'garment_categories', 'garments', 'service_garment_pricing')
ORDER BY tablename, policyname;

-- Check table permissions
SELECT 
    table_name,
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND table_name IN ('services', 'garment_categories', 'garments', 'service_garment_pricing')
ORDER BY table_name, grantee, privilege_type;
