-- FIX ORDERS TABLE: Change service_id from UUID to INTEGER

-- Step 1: Check current orders data
SELECT id, service_id, customer_id FROM orders LIMIT 5;

-- Step 2: Add new INTEGER column for service_id
ALTER TABLE orders ADD COLUMN service_id_new INTEGER;

-- Step 3: If you have services with IDs 1, 2, 3 and want to test,
-- manually update your order to point to a valid service
-- (Replace 'your-order-uuid-here' with actual order ID and pick a valid service_id)
-- UPDATE orders SET service_id_new = 1 WHERE id = 'your-order-uuid-here';

-- Step 4: After populating service_id_new, drop old column and rename
-- ALTER TABLE orders DROP COLUMN service_id;
-- ALTER TABLE orders RENAME COLUMN service_id_new TO service_id;

-- ALTERNATIVE QUICK FIX: Just delete the test order and create new one with proper service_id
-- DELETE FROM orders;
-- Then create a new order through the UI with valid service selected
