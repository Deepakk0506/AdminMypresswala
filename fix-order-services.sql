-- Fix orders to have correct services_id

-- Step 1: Check current orders
SELECT id, customer_id, services_id FROM orders;

-- Step 2: Check available services
SELECT id, name FROM services;

-- Step 3: Update orders to set services_id to first available service
UPDATE orders 
SET services_id = (SELECT id FROM services ORDER BY id LIMIT 1)
WHERE services_id IS NULL;

-- Step 4: Verify the fix
SELECT 
    o.id, 
    o.customer_id, 
    o.services_id, 
    c.name as customer_name, 
    s.name as service_name
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
LEFT JOIN services s ON o.services_id = s.id;
