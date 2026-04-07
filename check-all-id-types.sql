-- Check ID types in all tables
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('customers', 'services', 'orders') 
AND column_name = 'id'
ORDER BY table_name;

-- Check all columns for customers
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'customers'
ORDER BY ordinal_position;
