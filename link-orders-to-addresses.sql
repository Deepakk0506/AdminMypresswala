-- Link orders table to customer_addresses table
-- Execute this in Supabase SQL Editor

-- 1. Add customer_address_id column to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS customer_address_id UUID REFERENCES customer_addresses(id) ON DELETE SET NULL;

-- 2. Create index for performance
CREATE INDEX IF NOT EXISTS idx_orders_customer_address_id ON orders(customer_address_id);

-- 3. Migrate existing orders: link to customer's default address if available
UPDATE orders o
SET customer_address_id = (
    SELECT id FROM customer_addresses ca
    WHERE ca.customer_id = o.customer_id
    AND ca.is_default = true
    LIMIT 1
)
WHERE o.customer_address_id IS NULL
AND EXISTS (SELECT 1 FROM customer_addresses ca WHERE ca.customer_id = o.customer_id);

-- 4. For orders without a default address, link to any address of the customer
UPDATE orders o
SET customer_address_id = (
    SELECT id FROM customer_addresses ca
    WHERE ca.customer_id = o.customer_id
    ORDER BY ca.created_at ASC
    LIMIT 1
)
WHERE o.customer_address_id IS NULL
AND EXISTS (SELECT 1 FROM customer_addresses ca WHERE ca.customer_id = o.customer_id);

-- 5. Verify the changes
SELECT 
    o.id as order_id,
    o.customer_id,
    o.customer_address_id,
    ca.address_line1,
    ca.city,
    ca.is_default
FROM orders o
LEFT JOIN customer_addresses ca ON ca.id = o.customer_address_id
LIMIT 10;
