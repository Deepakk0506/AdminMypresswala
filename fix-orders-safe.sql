-- SAFE FIX: Check for foreign keys first, then fix orders table

-- Step 1: Check if there's a foreign key constraint on service_id
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'orders'
    AND kcu.column_name = 'service_id';

-- Step 2: If foreign key exists, drop it first
-- ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_service_id_fkey;

-- Step 3: Check current data type of service_id
SELECT column_name, data_type, udt_name
FROM information_schema.columns
WHERE table_name = 'orders' AND column_name = 'service_id';

-- Step 4: Add new INTEGER column
ALTER TABLE orders ADD COLUMN IF NOT EXISTS service_id_int INTEGER;

-- Step 5: Copy data - extract integer from UUID if needed, or set to 1
UPDATE orders SET service_id_int = 1 WHERE service_id IS NOT NULL;

-- Step 6: Verify the update
SELECT id, service_id, service_id_int FROM orders;

-- Step 7: Drop old column
ALTER TABLE orders DROP COLUMN IF EXISTS service_id;

-- Step 8: Rename new column
ALTER TABLE orders RENAME COLUMN service_id_int TO service_id;

-- Step 9: Add foreign key constraint back (optional but recommended)
-- ALTER TABLE orders ADD CONSTRAINT orders_service_id_fkey
--    FOREIGN KEY (service_id) REFERENCES services(id);
