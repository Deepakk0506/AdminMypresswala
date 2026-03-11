-- Fix RLS policies for pricing table
-- This will allow authenticated users to perform CRUD operations on the pricing table

-- First, drop any existing policies on the pricing table
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON pricing;
DROP POLICY IF EXISTS "Enable select for authenticated users" ON pricing;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON pricing;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON pricing;
DROP POLICY IF EXISTS "Enable ALL for authenticated users" ON pricing;

-- Create a comprehensive policy for all operations
CREATE POLICY "Enable ALL for authenticated users" ON pricing
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Alternatively, if you want more restrictive policies, you can use these instead:
-- CREATE POLICY "Enable insert for authenticated users" ON pricing
--   FOR INSERT TO authenticated
--   WITH CHECK (true);

-- CREATE POLICY "Enable select for authenticated users" ON pricing
--   FOR SELECT TO authenticated
--   USING (true);

-- CREATE POLICY "Enable update for authenticated users" ON pricing
--   FOR UPDATE TO authenticated
--   USING (true)
--   WITH CHECK (true);

-- CREATE POLICY "Enable delete for authenticated users" ON pricing
--   FOR DELETE TO authenticated
--   USING (true);
