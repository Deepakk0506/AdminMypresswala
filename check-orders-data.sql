-- Check what data is actually in orders table
SELECT 
    id, 
    customer_id, 
    services_id, 
    status,
    created_at
FROM orders 
ORDER BY created_at DESC 
LIMIT 5;

-- Check if services_id is NULL in recent orders
SELECT COUNT(*) as null_services_count 
FROM orders 
WHERE services_id IS NULL;

-- Check the latest order details
SELECT 
    o.id,
    o.customer_id,
    o.services_id,
    c.name as customer_name,
    s.name as service_name
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
LEFT JOIN services s ON o.services_id = s.id
ORDER BY o.created_at DESC
LIMIT 1;
