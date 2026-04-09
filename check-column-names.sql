-- Check the actual column names in orders table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'orders'
ORDER BY ordinal_position;

-- Check specific order to see what services_id value it has
SELECT id, customer_id, services_id, created_at
FROM orders
ORDER BY created_at DESC
LIMIT 3;
