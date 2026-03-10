-- Fix Customer Addresses and Payments Data
-- Execute this in Supabase SQL Editor

-- First, let's check what customers exist
SELECT '=== EXISTING CUSTOMERS ===' as info;
SELECT id, name, email, created_at FROM customers ORDER BY created_at DESC LIMIT 5;

-- Check if we have any existing addresses/payments
SELECT '=== EXISTING DATA COUNTS ===' as info;
SELECT 'Customer Addresses:' as table_name, COUNT(*) as count FROM customer_addresses
UNION ALL
SELECT 'Payment Methods:', COUNT(*) FROM payment_methods
UNION ALL
SELECT 'Reviews:', COUNT(*) FROM reviews
UNION ALL
SELECT 'Notifications:', COUNT(*) FROM notifications;

-- Clear existing data to avoid duplicates
DELETE FROM customer_addresses;
DELETE FROM payment_methods;
DELETE FROM reviews;
DELETE FROM notifications;

-- Insert addresses for ALL existing customers
INSERT INTO customer_addresses (customer_id, address_type, address_line1, address_line2, city, state, postal_code, is_default, created_at)
SELECT 
  id,
  'delivery',
  '123 Main Street',
  'Apt ' || (ROW_NUMBER() OVER (ORDER BY id))::text,
  CASE WHEN (ROW_NUMBER() OVER (ORDER BY id)) % 3 = 0 THEN 'Mumbai'
       WHEN (ROW_NUMBER() OVER (ORDER BY id)) % 3 = 1 THEN 'Delhi'
       ELSE 'Bangalore' END,
  CASE WHEN (ROW_NUMBER() OVER (ORDER BY id)) % 3 = 0 THEN 'Maharashtra'
       WHEN (ROW_NUMBER() OVER (ORDER BY id)) % 3 = 1 THEN 'Delhi'
       ELSE 'Karnataka' END,
  LPAD((ROW_NUMBER() OVER (ORDER BY id))::text, 6, '0'),
  true,
  NOW()
FROM customers;

-- Insert payment methods for ALL existing customers
INSERT INTO payment_methods (customer_id, method_type, provider, last_four, expiry_month, expiry_year, is_default, is_active, created_at)
SELECT 
  id,
  CASE WHEN (ROW_NUMBER() OVER (ORDER BY id)) % 3 = 0 THEN 'card'
       WHEN (ROW_NUMBER() OVER (ORDER BY id)) % 3 = 1 THEN 'upi'
       ELSE 'cash' END,
  CASE WHEN (ROW_NUMBER() OVER (ORDER BY id)) % 3 = 0 THEN 'Visa'
       WHEN (ROW_NUMBER() OVER (ORDER BY id)) % 3 = 1 THEN 'Google Pay'
       ELSE 'Cash on Delivery' END,
  CASE WHEN (ROW_NUMBER() OVER (ORDER BY id)) % 3 = 0 THEN LPAD(((ROW_NUMBER() OVER (ORDER BY id)) * 1234)::text, 4, '0')
       ELSE NULL END,
  CASE WHEN (ROW_NUMBER() OVER (ORDER BY id)) % 3 = 0 THEN 12
       ELSE NULL END,
  CASE WHEN (ROW_NUMBER() OVER (ORDER BY id)) % 3 = 0 THEN 2026
       ELSE NULL END,
  true,
  true,
  NOW()
FROM customers;

-- Insert reviews for ALL existing customers (if services table exists)
INSERT INTO reviews (customer_id, service_id, order_id, rating, comment, is_public, created_at)
SELECT 
  c.id,
  (SELECT id FROM services LIMIT 1),
  (SELECT id FROM orders LIMIT 1),
  4 + (ROW_NUMBER() OVER (ORDER BY c.id)) % 2, -- 4 or 5 rating
  CASE WHEN (ROW_NUMBER() OVER (ORDER BY c.id)) % 3 = 0 THEN 'Excellent service! Very professional and quick delivery.'
       WHEN (ROW_NUMBER() OVER (ORDER BY c.id)) % 3 = 1 THEN 'Good quality work, satisfied with the results.'
       ELSE 'Amazing service, will definitely recommend!' END,
  true,
  NOW()
FROM customers c
WHERE EXISTS (SELECT 1 FROM services LIMIT 1) AND EXISTS (SELECT 1 FROM orders LIMIT 1);

-- Insert notifications for ALL existing customers
INSERT INTO notifications (user_id, title, message, type, is_read, data, created_at)
SELECT 
  id,
  CASE WHEN (ROW_NUMBER() OVER (ORDER BY id)) % 3 = 0 THEN 'Order Confirmation'
       WHEN (ROW_NUMBER() OVER (ORDER BY id)) % 3 = 1 THEN 'Delivery Update'
       ELSE 'Special Offer' END,
  CASE WHEN (ROW_NUMBER() OVER (ORDER BY id)) % 3 = 0 THEN 'Your order has been confirmed and is being processed.'
       WHEN (ROW_NUMBER() OVER (ORDER BY id)) % 3 = 1 THEN 'Your order is out for delivery!'
       ELSE 'Get 20% off on your next service!' END,
  CASE WHEN (ROW_NUMBER() OVER (ORDER BY id)) % 3 = 0 THEN 'order_update'
       WHEN (ROW_NUMBER() OVER (ORDER BY id)) % 3 = 1 THEN 'delivery_update'
       ELSE 'promotion' END,
  false,
  CASE WHEN (ROW_NUMBER() OVER (ORDER BY id)) % 3 = 0 THEN '{"order_id": ' || (ROW_NUMBER() OVER (ORDER BY id))::text || '}'
       ELSE '{"offer_id": "SPECIAL20"}' END::jsonb,
  NOW()
FROM customers;

-- Verify the results
SELECT '=== FINAL DATA COUNTS ===' as info;
SELECT 'Customer Addresses:' as table_name, COUNT(*) as count FROM customer_addresses
UNION ALL
SELECT 'Payment Methods:', COUNT(*) FROM payment_methods
UNION ALL
SELECT 'Reviews:', COUNT(*) FROM reviews
UNION ALL
SELECT 'Notifications:', COUNT(*) FROM notifications;

-- Show sample data with customer IDs
SELECT '=== SAMPLE ADDRESS DATA ===' as info;
SELECT customer_id, address_type, city, state, created_at FROM customer_addresses LIMIT 3;

SELECT '=== SAMPLE PAYMENT DATA ===' as info;
SELECT customer_id, method_type, provider, is_active, created_at FROM payment_methods LIMIT 3;
