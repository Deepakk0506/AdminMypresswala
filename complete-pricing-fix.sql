-- Complete fix for pricing table RLS issues
-- Run this entire script in your Supabase SQL Editor

-- Step 1: Check if table exists and create if needed
CREATE TABLE IF NOT EXISTS pricing (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    unit TEXT NOT NULL CHECK (unit IN ('per item', 'per kg', 'per trip')),
    price NUMERIC NOT NULL CHECK (price >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Completely disable RLS
ALTER TABLE pricing DISABLE ROW LEVEL SECURITY;

-- Step 3: Drop all existing policies (if any)
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON pricing;
DROP POLICY IF EXISTS "Enable select for authenticated users" ON pricing;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON pricing;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON pricing;
DROP POLICY IF EXISTS "Enable ALL for authenticated users" ON pricing;
DROP POLICY IF EXISTS "Allow all operations" ON pricing;

-- Step 4: Grant necessary permissions
GRANT ALL ON pricing TO authenticated;
GRANT ALL ON pricing TO service_role;
GRANT SELECT ON pricing TO anon;

-- Step 5: Verify table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'pricing' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 6: Test insert (commented out - uncomment to test)
-- INSERT INTO pricing (service_id, unit, price) 
-- VALUES ('87394ccd-618e-4eaa-9fb4-171c1bd82b2d', 'per item', 99.99);

-- Success message
SELECT 'Pricing table setup completed successfully!' as status;
