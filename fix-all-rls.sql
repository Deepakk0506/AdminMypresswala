-- Fix RLS for ALL customer-related tables
-- Execute this in Supabase SQL Editor

-- Disable RLS on all customer-related tables
ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_order_summary DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_communications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_addresses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
  tablename, 
  rowsecurity,
  CASE 
    WHEN rowsecurity THEN 'RLS ENABLED (❌)'
    ELSE 'RLS DISABLED (✅)'
  END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
  'customers', 
  'customer_order_summary', 
  'customer_tags', 
  'customer_communications',
  'customer_addresses',
  'payment_methods',
  'reviews',
  'notifications'
)
ORDER BY tablename;

-- Test data access
SELECT '=== TESTING DATA ACCESS ===' as info;

-- Test customers table
SELECT 'Customers table access:' as test, COUNT(*) as count FROM customers;

-- Test customer_addresses table
SELECT 'Customer addresses table access:' as test, COUNT(*) as count FROM customer_addresses;

-- Test payment_methods table
SELECT 'Payment methods table access:' as test, COUNT(*) as count FROM payment_methods;

-- Test reviews table
SELECT 'Reviews table access:' as test, COUNT(*) as count FROM reviews;

-- Test notifications table
SELECT 'Notifications table access:' as test, COUNT(*) as count FROM notifications;

-- Show sample data with customer relationships
SELECT '=== SAMPLE DATA WITH RELATIONSHIPS ===' as info;

SELECT 
  c.name as customer_name,
  c.id as customer_id,
  COUNT(ca.id) as address_count,
  COUNT(pm.id) as payment_count
FROM customers c
LEFT JOIN customer_addresses ca ON c.id = ca.customer_id
LEFT JOIN payment_methods pm ON c.id = pm.customer_id
GROUP BY c.id, c.name, c.id
ORDER BY c.created_at DESC
LIMIT 3;
