-- FIX: Change orders.services_id from UUID to INTEGER to match services.id

-- Step 1: Delete existing order data (since we're changing column type)
DELETE FROM orders;

-- Step 2: Drop the UUID services_id column
ALTER TABLE orders DROP COLUMN IF EXISTS services_id;

-- Step 3: Add services_id as INTEGER type
ALTER TABLE orders ADD COLUMN services_id INTEGER;

-- Step 4: Insert test order with proper types
INSERT INTO orders (id, customer_id, services_id, quantity, total_price, status, order_date, created_at, priority_level, payment_method, payment_status)
VALUES (
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
    'pending'
);

-- Step 5: Verify the fix
SELECT 
    o.id, 
    o.customer_id, 
    o.services_id, 
    c.name as customer_name, 
    s.name as service_name
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
LEFT JOIN services s ON o.services_id = s.id;
