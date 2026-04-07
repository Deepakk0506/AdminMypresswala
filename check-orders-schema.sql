-- Check orders table columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;

-- Check if service_id is UUID or integer
SELECT column_name, data_type, udt_name
FROM information_schema.columns 
WHERE table_name = 'orders' AND column_name = 'service_id';
