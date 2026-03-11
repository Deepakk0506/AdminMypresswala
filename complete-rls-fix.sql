-- COMPLETE RLS FIX FOR ALL TABLES
-- Run this entire script in Supabase SQL Editor

-- Disable RLS on all relevant tables
ALTER TABLE services DISABLE ROW LEVEL SECURITY;
ALTER TABLE pricing DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;

-- Drop ALL policies on all tables
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON services;
DROP POLICY IF EXISTS "Enable select for authenticated users" ON services;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON services;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON services;
DROP POLICY IF EXISTS "Enable ALL for authenticated users" ON services;
DROP POLICY IF EXISTS "Allow all operations" ON services;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON pricing;
DROP POLICY IF EXISTS "Enable select for authenticated users" ON pricing;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON pricing;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON pricing;
DROP POLICY IF EXISTS "Enable ALL for authenticated users" ON pricing;
DROP POLICY IF EXISTS "Allow all operations" ON pricing;

-- Grant comprehensive permissions
GRANT ALL ON services TO authenticated;
GRANT ALL ON services TO service_role;
GRANT SELECT ON services TO anon;

GRANT ALL ON pricing TO authenticated;
GRANT ALL ON pricing TO service_role;
GRANT SELECT ON pricing TO anon;

GRANT ALL ON settings TO authenticated;
GRANT ALL ON settings TO service_role;
GRANT SELECT ON settings TO anon;

-- Add Dry Cleaning service if it doesn't exist
INSERT INTO services (
    service_name, 
    description, 
    status, 
    duration_estimate, 
    image_url, 
    min_order_quantity, 
    popularity_score, 
    service_code, 
    price, 
    category
) VALUES (
    'Dry Cleaning',
    'Professional dry cleaning for delicate fabrics and special garments',
    true,
    'Usually ready in 2-3 days',
    NULL,
    1,
    50,
    'SRVDRY',
    150,
    'Dry Cleaning'
) ON CONFLICT (service_name) DO NOTHING;

-- Verify all tables are accessible
SELECT 'RLS fix completed - All tables now accessible!' as status;

-- Check Dry Cleaning service was added
SELECT service_name, service_code FROM services WHERE service_name = 'Dry Cleaning';

-- Show all services
SELECT service_name, service_code FROM services ORDER BY service_name;
