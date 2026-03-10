-- SIMPLE WORKING Customer Data Insert Script
-- Execute this in Supabase SQL Editor

-- 1. Customer Addresses (Simple version)
INSERT INTO customer_addresses (customer_id, address_type, address_line1, address_line2, city, state, postal_code, is_default, created_at)
VALUES
  ('0c0758d0-3c31-47bc-9b0a-eb8d6ead81a1', 'delivery', '123 Main Street', 'Apt 5', 'Mumbai', 'Maharashtra', '400001', true, NOW()),
  ('7bbb46cb-99a0-4a70-81b8-49cfaf5e8c6d', 'delivery', '456 Oak Avenue', NULL, 'Delhi', 'Delhi', '110001', true, NOW()),
  ('0f9e1b7b-9213-4beb-836f-54304f1fb1ad', 'delivery', '789 Pine Road', 'Suite 200', 'Bangalore', 'Karnataka', '560001', true, NOW());

-- 2. Payment Methods (Simple version)
INSERT INTO payment_methods (customer_id, method_type, provider, last_four, expiry_month, expiry_year, is_default, is_active, created_at)
VALUES
  ('0c0758d0-3c31-47bc-9b0a-eb8d6ead81a1', 'card', 'Visa', '1234', 12, 2026, true, true, NOW()),
  ('7bbb46cb-99a0-4a70-81b8-49cfaf5e8c6d', 'upi', 'GPay', NULL, NULL, NULL, true, true, NOW()),
  ('0f9e1b7b-9213-4beb-836f-54304f1fb1ad', 'wallet', 'Paytm', NULL, NULL, NULL, true, true, NOW());

-- 3. Customer Reviews (Simple version)
INSERT INTO reviews (customer_id, service_id, order_id, rating, comment, is_public, created_at)
SELECT
  c.id as customer_id,
  (SELECT id FROM services ORDER BY RANDOM() LIMIT 1) as service_id,
  (SELECT id FROM orders ORDER BY RANDOM() LIMIT 1) as order_id,
  4 as rating,
  'Great service! Very satisfied with the quality.' as comment,
  true as is_public,
  NOW() as created_at
FROM customers c
LIMIT 3;

-- 4. Notifications (Simple version)
INSERT INTO notifications (user_id, title, message, type, is_read, data, created_at)
VALUES
  ('0c0758d0-3c31-47bc-9b0a-eb8d6ead81a1', 'Order Confirmation', 'Your order #12345 has been confirmed and is being processed.', 'order_update', false, '{"order_id": 12345}'::jsonb, NOW()),
  ('7bbb46cb-99a0-4a70-81b8-49cfaf5e8c6d', 'Delivery Update', 'Your order is out for delivery. Expected arrival: 2-3 hours.', 'order_update', false, '{"order_id": 67890}'::jsonb, NOW()),
  ('0f9e1b7b-9213-4beb-836f-54304f1fb1ad', 'Special Offer', 'Get 20% off on your next laundry service! Use code SAVE20.', 'promotion', false, '{"discount_code": "SAVE20", "discount_percent": 20}'::jsonb, NOW());

-- Verification
SELECT 'Customer Addresses Count:' as info, COUNT(*) as count FROM customer_addresses
UNION ALL
SELECT 'Payment Methods Count:', COUNT(*) FROM payment_methods
UNION ALL
SELECT 'Reviews Count:', COUNT(*) FROM reviews
UNION ALL
SELECT 'Notifications Count:', COUNT(*) FROM notifications;
