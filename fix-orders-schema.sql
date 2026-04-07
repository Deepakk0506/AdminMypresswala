-- FIX: Change orders.service_id from UUID to INTEGER to match services.id
-- First, check current data
SELECT id, service_id FROM orders LIMIT 5;

-- If service_id contains UUIDs that don't match services, you need to:
-- Option 1: Add a new integer column and populate it correctly
ALTER TABLE orders ADD COLUMN service_id_int INTEGER;

-- Option 2: Update service_id_int based on service name matching (if you have service names in orders)
-- Or manually update based on your data

-- Option 3: Drop and recreate service_id as integer (DATA LOSS - only if service_id is wrong)
-- ALTER TABLE orders DROP COLUMN service_id;
-- ALTER TABLE orders ADD COLUMN service_id INTEGER REFERENCES services(id);
