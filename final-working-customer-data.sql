-- WORKING Customer Data Script - Uses YOUR actual customer IDs
-- Execute this in Supabase SQL Editor

-- This script uses your real customer IDs from the database

-- 1. Add addresses for existing customers
INSERT INTO customer_addresses (customer_id, address_type, address_line1, address_line2, city, state, postal_code, is_default, created_at)
SELECT
  id,
  'delivery',
  '123 Main Street',
  'Apt 5',
  'Mumbai',
  'Maharashtra',
  '400001',
  true,
  NOW()
FROM customers
WHERE id IS NOT NULL
LIMIT 1;

-- 2. Add payment methods for existing customers
INSERT INTO payment_methods (customer_id, method_type, provider, last_four, expiry_month, expiry_year, is_default, is_active, created_at)
SELECT
  id,
  'card',
  'Visa',
  '1234',
  12,
  2026,
  true,
  true,
  NOW()
FROM customers
WHERE id IS NOT NULL
LIMIT 1;

-- 3. Add reviews for existing customers
INSERT INTO reviews (customer_id, service_id, order_id, rating, comment, is_public, created_at)
SELECT
  c.id,
  (SELECT id FROM services LIMIT 1),
  (SELECT id FROM orders LIMIT 1),
  4,
  'Excellent service! Very professional and quick delivery.',
  true,
  NOW()
FROM customers c
WHERE c.id IS NOT NULL
LIMIT 1;

-- 4. Add notifications for existing customers
INSERT INTO notifications (user_id, title, message, type, is_read, data, created_at)
SELECT
  id,
  'Order Confirmation',
  'Your order has been confirmed and is being processed.',
  'order_update',
  false,
  '{"order_id": 12345}'::jsonb,
  NOW()
FROM customers
WHERE id IS NOT NULL
LIMIT 1;

-- Check results
SELECT 'Customer Addresses Count:' as info, COUNT(*) as count FROM customer_addresses
UNION ALL
SELECT 'Payment Methods Count:', COUNT(*) FROM payment_methods
UNION ALL
SELECT 'Reviews Count:', COUNT(*) FROM reviews
UNION ALL
SELECT 'Notifications Count:', COUNT(*) FROM notifications;
