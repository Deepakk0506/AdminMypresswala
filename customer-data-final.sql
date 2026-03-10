-- Check your actual customers first
SELECT id, name, phone FROM customers;

-- Then use the IDs from the query above in this script
-- Replace the IDs below with your actual customer IDs

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

INSERT INTO reviews (customer_id, service_id, order_id, rating, comment, is_public, created_at)
SELECT
  c.id,
  s.id,
  o.id,
  4,
  'Great service! Very satisfied.',
  true,
  NOW()
FROM customers c
CROSS JOIN (SELECT id FROM services LIMIT 1) s
CROSS JOIN (SELECT id FROM orders LIMIT 1) o
WHERE c.id IS NOT NULL
LIMIT 1;

INSERT INTO notifications (user_id, title, message, type, is_read, data, created_at)
SELECT
  id,
  'Welcome Message',
  'Welcome to our service!',
  'system',
  false,
  '{}'::jsonb,
  NOW()
FROM customers
WHERE id IS NOT NULL
LIMIT 1;
