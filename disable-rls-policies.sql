-- Disable RLS Policies for Admin Dashboard
-- Run this in Supabase SQL Editor to fix data access issues

-- 1. Disable RLS on all tables
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE services DISABLE ROW LEVEL SECURITY;
ALTER TABLE shops DISABLE ROW LEVEL SECURITY;
ALTER TABLE staff DISABLE ROW LEVEL SECURITY;
ALTER TABLE inventory DISABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE customer_tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE customer_addresses DISABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE customer_communications DISABLE ROW LEVEL SECURITY;

-- 2. Drop all existing RLS policies (if any)
DROP POLICY IF EXISTS "Users can view their own data" ON customers;
DROP POLICY IF EXISTS "Users can insert their own data" ON customers;
DROP POLICY IF EXISTS "Users can update their own data" ON customers;
DROP POLICY IF EXISTS "Users can delete their own data" ON customers;

DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Users can insert their own orders" ON orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON orders;
DROP POLICY IF EXISTS "Users can delete their own orders" ON orders;

DROP POLICY IF EXISTS "Users can view services" ON services;
DROP POLICY IF EXISTS "Users can insert services" ON services;
DROP POLICY IF EXISTS "Users can update services" ON services;
DROP POLICY IF EXISTS "Users can delete services" ON services;

DROP POLICY IF EXISTS "Shop access policies" ON shops;
DROP POLICY IF EXISTS "Staff access policies" ON staff;
DROP POLICY IF EXISTS "Inventory access policies" ON inventory;
DROP POLICY IF EXISTS "Delivery access policies" ON deliveries;

DROP POLICY IF EXISTS "Notification policies" ON notifications;
DROP POLICY IF EXISTS "Customer tag policies" ON customer_tags;
DROP POLICY IF EXISTS "Customer address policies" ON customer_addresses;
DROP POLICY IF EXISTS "Payment method policies" ON payment_methods;
DROP POLICY IF EXISTS "Review policies" ON reviews;
DROP POLICY IF EXISTS "Customer communication policies" ON customer_communications;

-- 3. Grant full access to authenticated users
GRANT ALL ON customers TO authenticated;
GRANT ALL ON orders TO authenticated;
GRANT ALL ON services TO authenticated;
GRANT ALL ON shops TO authenticated;
GRANT ALL ON staff TO authenticated;
GRANT ALL ON inventory TO authenticated;
GRANT ALL ON deliveries TO authenticated;
GRANT ALL ON notifications TO authenticated;
GRANT ALL ON customer_tags TO authenticated;
GRANT ALL ON customer_addresses TO authenticated;
GRANT ALL ON payment_methods TO authenticated;
GRANT ALL ON reviews TO authenticated;
GRANT ALL ON customer_communications TO authenticated;

-- 4. Grant access to service role (if it exists)
GRANT ALL ON customers TO service_role;
GRANT ALL ON orders TO service_role;
GRANT ALL ON services TO service_role;
GRANT ALL ON shops TO service_role;
GRANT ALL ON staff TO service_role;
GRANT ALL ON inventory TO service_role;
GRANT ALL ON deliveries TO service_role;
GRANT ALL ON notifications TO service_role;
GRANT ALL ON customer_tags TO service_role;
GRANT ALL ON customer_addresses TO service_role;
GRANT ALL ON payment_methods TO service_role;
GRANT ALL ON reviews TO service_role;
GRANT ALL ON customer_communications TO service_role;

-- 5. Grant public access for testing (remove in production)
GRANT ALL ON customers TO anon;
GRANT ALL ON orders TO anon;
GRANT ALL ON services TO anon;
GRANT ALL ON shops TO anon;

-- 6. Verify RLS is disabled
SELECT 
    tablename,
    rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('customers', 'orders', 'services', 'shops', 'staff', 'inventory', 'deliveries', 'notifications');

-- 7. Test data access
SELECT 'Testing customers access:' as info;
SELECT COUNT(*) as customer_count FROM customers;

SELECT 'Testing orders access:' as info;
SELECT COUNT(*) as order_count FROM orders;

SELECT 'Testing services access:' as info;
SELECT COUNT(*) as service_count FROM services;

SELECT 'Testing shops access:' as info;
SELECT COUNT(*) as shop_count FROM shops;

-- 8. Show current user
SELECT 'Current user:' as info, auth.uid() as current_user, auth.role() as current_role;

-- Success message
SELECT '✅ RLS policies disabled and permissions granted!' as result;
