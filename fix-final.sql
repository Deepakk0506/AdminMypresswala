-- FIX: Change orders.customers_id from INTEGER to UUID to match customers.id

-- Step 1: Delete existing bad data
DELETE FROM orders;

-- Step 2: Drop the INTEGER customers_id column
ALTER TABLE orders DROP COLUMN IF EXISTS customers_id;

-- Step 3: Add customers_id as UUID type
ALTER TABLE orders ADD COLUMN customers_id UUID;

-- Step 4: Drop old UUID customer_id column (we don't need duplicate)
ALTER TABLE orders DROP COLUMN IF EXISTS customer_id;

-- Step 5: Insert test order with proper UUID customer_id and INTEGER service_id
INSERT INTO orders (id, customers_id, services_id, quantity, total_price, status, order_date, created_at, priority_level, payment_method, payment_status)
SELECT 
    gen_random_uuid(),
    (SELECT id FROM customers LIMIT 1),
    (SELECT id FROM services LIMIT 1),
    2,
    100.00,
    'pending',
    NOW(),
    NOW(),
    'normal',
    'cash',
    'pending';

-- Step 6: Verify
SELECT 
    o.id, 
    o.customers_id, 
    o.services_id, 
    c.name as customer_name, 
    s.name as service_name
FROM orders o
LEFT JOIN customers c ON o.customers_id = c.id
LEFT JOIN services s ON o.services_id = s.id;
