-- Check what address_id is stored in orders and compare with customer_addresses

-- Check orders with their address_id
SELECT 
    o.id as order_id,
    o.customer_id,
    o.address_id,
    o.created_at
FROM orders o
ORDER BY o.created_at DESC
LIMIT 5;

-- Check all addresses for customers
SELECT 
    ca.id as address_id,
    ca.customer_id,
    ca.contact_name,
    ca.contact_phone,
    ca.address_line1
FROM customer_addresses ca
ORDER BY ca.customer_id, ca.id;

-- Join to see what should be matched
SELECT 
    o.id as order_id,
    o.customer_id,
    o.address_id as order_address_id,
    ca.id as matched_address_id,
    ca.contact_name,
    ca.contact_phone
FROM orders o
LEFT JOIN customer_addresses ca ON o.address_id = ca.id
ORDER BY o.created_at DESC
LIMIT 5;
