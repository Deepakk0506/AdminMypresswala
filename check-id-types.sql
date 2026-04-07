-- Check customers table ID type
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'customers' AND column_name = 'id';

-- Check services table ID type  
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'services' AND column_name = 'id';

-- Show all columns for customers
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'customers'
ORDER BY ordinal_position;

-- Show all columns for services
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'services'
ORDER BY ordinal_position;
