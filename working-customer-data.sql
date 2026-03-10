-- WORKING Customer Data Script (Using actual customer IDs)
-- Execute this in Supabase SQL Editor

-- First, check what customers exist
SELECT 'Existing Customers:' as info, id, name, phone FROM customers;

-- Then use those IDs in the dummy data
-- Replace the hardcoded IDs below with your actual customer IDs from the query above

INSERT INTO customer_addresses (customer_id, address_type, address_line1, address_line2, city, state, postal_code, is_default, created_at)
SELECT
  id as customer_id,
  'delivery' as address_type,
  '123 Main Street' as address_line1,
  'Apt 5' as address_line2,
  'Mumbai' as city,
  'Maharashtra' as state,
  '400001' as postal_code,
  true as is_default,
  NOW() as created_at
FROM customers
LIMIT 1;

INSERT INTO payment_methods (customer_id, method_type, provider, last_four, expiry_month, expiry_year, is_default, is_active, created_at)
SELECT
  id as customer_id,
  'card' as method_type,
  'Visa' as provider,
  '1234' as last_four,
  12 as expiry_month,
  2026 as expiry_year,
  true as is_default,
  true as is_active,
  NOW() as created_at
FROM customers
LIMIT 1;

INSERT INTO reviews (customer_id, service_id, order_id, rating, comment, is_public, created_at)
SELECT
  c.id as customer_id,
  (SELECT id FROM services LIMIT 1) as service_id,
  (SELECT id FROM orders LIMIT 1) as order_id,
  4 as rating,
  'Great service! Very satisfied with the quality.' as comment,
  true as is_public,
  NOW() as created_at
FROM customers c
LIMIT 1;

INSERT INTO notifications (user_id, title, message, type, is_read, data, created_at)
SELECT
  id as user_id,
  'Welcome Message' as title,
  'Welcome to our service! We are excited to serve you.' as message,
  'system' as type,
  false as is_read,
  '{}'::jsonb as data,
  NOW() as created_at
FROM customers
LIMIT 1;

-- Check results
SELECT 'Addresses:', COUNT(*) FROM customer_addresses
UNION ALL
SELECT 'Payments:', COUNT(*) FROM payment_methods
UNION ALL
SELECT 'Reviews:', COUNT(*) FROM reviews
UNION ALL
SELECT 'Notifications:', COUNT(*) FROM notifications;
