-- Quick fix for settings table RLS
-- Run this entire script in Supabase SQL Editor

-- Step 1: Disable RLS completely
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;

-- Step 2: Grant permissions
GRANT ALL ON settings TO authenticated;
GRANT ALL ON settings TO service_role;
GRANT SELECT ON settings TO anon;

-- Step 3: Insert default settings if they don't exist
INSERT INTO settings (key, value) VALUES 
  ('delivery_charge', '50'),
  ('pickup_charge', '30'),
  ('tax_rate', '18'),
  ('minimum_order_amount', '100'),
  ('currency', 'INR'),
  ('support_phone', '+919876543210')
ON CONFLICT (key) DO NOTHING;

-- Step 4: Test the settings table
SELECT * FROM settings ORDER BY key;
