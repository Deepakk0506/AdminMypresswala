-- Check RLS Policies on Shops Table
-- This will show if there are any policies blocking data

-- 1. Check if RLS is enabled on shops table
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    forcerlspolicy as force_rls
FROM pg_tables 
WHERE tablename = 'shops' AND schemaname = 'public';

-- 2. Check all RLS policies on shops table
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'shops';

-- 3. Check if there are any RLS policies affecting SELECT
SELECT 
    policyname,
    cmd,
    roles,
    CASE 
        WHEN qual IS NOT NULL THEN 'Has condition'
        ELSE 'No condition'
    END as has_condition
FROM pg_policies 
WHERE tablename = 'shops' AND cmd = 'SELECT';

-- 4. Test direct SELECT as the service role (what the UI uses)
-- This simulates what the Supabase client does
SET ROLE service_role;
SELECT COUNT(*) as service_role_count FROM shops;
RESET ROLE;

-- 5. Test SELECT as authenticated user
SET ROLE authenticated;
SELECT COUNT(*) as authenticated_count FROM shops;
RESET ROLE;

-- 6. Test SELECT as anon user (public access)
SET ROLE anon;
SELECT COUNT(*) as anon_count FROM shops;
RESET ROLE;

-- 7. Show current user and role
SELECT current_user, session_user;
