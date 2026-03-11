-- Fix RLS Issues on Shops Table
-- Run this if RLS is blocking data access

-- 1. Disable RLS on shops table (if enabled)
ALTER TABLE shops DISABLE ROW LEVEL SECURITY;

-- 2. Drop any existing policies (clean slate)
DROP POLICY IF EXISTS "Shops can view own shops" ON shops;
DROP POLICY IF EXISTS "Shops can update own shops" ON shops;
DROP POLICY IF EXISTS "Shops can insert own shops" ON shops;
DROP POLICY IF EXISTS "Public can view shops" ON shops;
DROP POLICY IF EXISTS "Authenticated can view shops" ON shops;

-- 3. Create simple public read policy (if needed)
-- Only enable if you want RLS but with public read access
-- ALTER TABLE shops ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Public can view all shops" ON shops
--     FOR SELECT USING (true);

-- CREATE POLICY "Service role full access" ON shops
--     FOR ALL USING (true) WITH CHECK (true);

-- 4. Grant public access (bypass RLS)
GRANT ALL ON shops TO anon;
GRANT ALL ON shops TO authenticated;
GRANT ALL ON shops TO service_role;

-- 5. Verify access
SELECT 
    'RLS Status: ' || CASE 
        WHEN rowsecurity THEN 'ENABLED' 
        ELSE 'DISABLED' 
    END as rls_status
FROM pg_tables 
WHERE tablename = 'shops' AND schemaname = 'public';

-- 6. Test access with different roles
SET ROLE anon;
SELECT COUNT(*) as anon_access FROM shops;
RESET ROLE;

SET ROLE authenticated;
SELECT COUNT(*) as authenticated_access FROM shops;
RESET ROLE;

SELECT COUNT(*) as direct_access FROM shops;
