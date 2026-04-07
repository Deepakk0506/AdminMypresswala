-- FIX: Update the existing order with proper customer_id and service_id

-- Step 1: Check what customers and services exist
SELECT id, name FROM customers LIMIT 5;
SELECT id, name FROM services LIMIT 5;

-- Step 2: Update the order with the first customer and service
UPDATE orders 
SET 
    customer_id = (SELECT id FROM customers LIMIT 1),
    service_id = (SELECT id FROM services LIMIT 1)
WHERE customer_id IS NULL OR service_id IS NULL;

-- Step 3: Verify the fix
SELECT o.id, o.customer_id, o.service_id, c.name as customer_name, s.name as service_name
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
LEFT JOIN services s ON o.service_id = s.id;
