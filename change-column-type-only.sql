-- ONLY change orders.services_id from UUID to INTEGER (no data deletion)

-- Step 1: Drop the UUID services_id column
ALTER TABLE orders DROP COLUMN IF EXISTS services_id;

-- Step 2: Add services_id as INTEGER type
ALTER TABLE orders ADD COLUMN services_id INTEGER;

-- Step 3: Update existing orders to set services_id to a valid service ID
UPDATE orders SET services_id = (SELECT id FROM services LIMIT 1) WHERE services_id IS NULL;

-- Step 4: Verify the change
SELECT 
    o.id, 
    o.customer_id, 
    o.services_id, 
    c.name as customer_name, 
    s.name as service_name
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
LEFT JOIN services s ON o.services_id = s.id;
