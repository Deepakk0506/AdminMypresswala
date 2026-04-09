-- Fix for new orders showing Unknown Service
-- This sets services_id for any orders that have NULL services_id

-- Step 1: Check how many orders have NULL services_id
SELECT COUNT(*) as null_count FROM orders WHERE services_id IS NULL;

-- Step 2: Get the first available service ID
SELECT id, name FROM services ORDER BY id LIMIT 1;

-- Step 3: Update all orders with NULL services_id to use the first service
-- (You can change the service ID based on your needs)
UPDATE orders 
SET services_id = (SELECT id FROM services ORDER BY id LIMIT 1)
WHERE services_id IS NULL;

-- Step 4: Or update to specific service based on order type/needs
-- UPDATE orders SET services_id = 1 WHERE services_id IS NULL;

-- Step 5: Verify all orders now have service names
SELECT 
    o.id, 
    o.customer_id, 
    o.services_id, 
    c.name as customer_name, 
    s.name as service_name
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
LEFT JOIN services s ON o.services_id = s.id
ORDER BY o.created_at DESC;
