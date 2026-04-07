-- FIX: Change orders table columns from UUID to INTEGER to match services/customers tables

-- Step 1: Drop existing order (since we're changing column types)
DELETE FROM orders;

-- Step 2: Drop the columns and recreate them as INTEGER
ALTER TABLE orders DROP COLUMN IF EXISTS customer_id;
ALTER TABLE orders DROP COLUMN IF EXISTS service_id;

-- Step 3: Add columns as INTEGER type
ALTER TABLE orders ADD COLUMN customer_id INTEGER;
ALTER TABLE orders ADD COLUMN service_id INTEGER;

-- Step 4: Add foreign key constraints (optional but recommended)
-- ALTER TABLE orders ADD CONSTRAINT fk_orders_customer 
--     FOREIGN KEY (customer_id) REFERENCES customers(id);
-- ALTER TABLE orders ADD CONSTRAINT fk_orders_service 
--     FOREIGN KEY (service_id) REFERENCES services(id);

-- Step 5: Insert test order with proper integer IDs
INSERT INTO orders (id, customer_id, service_id, quantity, total_price, status, order_date, created_at, priority_level, payment_method, payment_status)
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

-- Step 6: Verify
SELECT o.id, o.customer_id, o.service_id, c.name as customer_name, s.name as service_name
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
LEFT JOIN services s ON o.service_id = s.id;
