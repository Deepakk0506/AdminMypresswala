-- Check current order data
SELECT id, customers_id, services_id FROM orders;

-- Check what customers and services exist
SELECT id, name FROM customers;
SELECT id, name FROM services;

-- Update order with first customer and service (if they exist)
UPDATE orders 
SET 
    customers_id = (SELECT id FROM customers ORDER BY id LIMIT 1),
    services_id = (SELECT id FROM services ORDER BY id LIMIT 1)
WHERE customers_id IS NULL OR services_id IS NULL;

-- Verify after update
SELECT 
    o.id, 
    o.customers_id, 
    o.services_id, 
    c.name as customer_name, 
    s.name as service_name
FROM orders o
LEFT JOIN customers c ON o.customers_id = c.id
LEFT JOIN services s ON o.services_id = s.id;
