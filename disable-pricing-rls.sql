-- Disable RLS completely for pricing table (quick fix)
ALTER TABLE pricing DISABLE ROW LEVEL SECURITY;

-- OR if you want to keep RLS enabled but allow everything:
-- First disable RLS
ALTER TABLE pricing DISABLE ROW LEVEL SECURITY;

-- Then re-enable with permissive policy
ALTER TABLE pricing ENABLE ROW LEVEL SECURITY;

-- Create a very permissive policy
CREATE POLICY "Allow all operations" ON pricing
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Check current policies
SELECT * FROM pg_policies WHERE tablename = 'pricing';
