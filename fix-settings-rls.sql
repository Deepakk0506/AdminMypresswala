-- Fix RLS policies for settings table
-- This will allow authenticated users to perform CRUD operations on the settings table

-- First, disable RLS completely
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON settings;
DROP POLICY IF EXISTS "Enable select for authenticated users" ON settings;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON settings;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON settings;
DROP POLICY IF EXISTS "Enable ALL for authenticated users" ON settings;
DROP POLICY IF EXISTS "Allow all operations" ON settings;

-- Grant necessary permissions
GRANT ALL ON settings TO authenticated;
GRANT ALL ON settings TO service_role;
GRANT SELECT ON settings TO anon;

-- Create default settings if they don't exist
INSERT INTO settings (key, value) VALUES 
  ('delivery_charge', '50'),
  ('pickup_charge', '30'),
  ('tax_rate', '18'),
  ('minimum_order_amount', '100'),
  ('currency', 'INR'),
  ('support_phone', '+919876543210')
ON CONFLICT (key) DO NOTHING;
