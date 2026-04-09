-- Add foreign key constraints to orders table

-- Step 1: First, fix any existing orders with NULL services_id
UPDATE orders 
SET services_id = (SELECT id FROM services ORDER BY id LIMIT 1)
WHERE services_id IS NULL;

-- Step 2: Add foreign key constraint for services_id
ALTER TABLE orders 
ADD CONSTRAINT fk_orders_services 
FOREIGN KEY (services_id) 
REFERENCES services(id);

-- Step 3: Add foreign key constraint for customer_id (if not already present)
-- ALTER TABLE orders 
-- ADD CONSTRAINT fk_orders_customers 
-- FOREIGN KEY (customer_id) 
-- REFERENCES customers(id);

-- Step 4: Make services_id NOT NULL to prevent future issues
-- ALTER TABLE orders ALTER COLUMN services_id SET NOT NULL;

-- Step 5: Verify constraints
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'orders';
