-- Shops Soft Delete Migration
-- Add deleted_at column for soft delete functionality

-- 1. Add deleted_at column
ALTER TABLE shops 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- 2. Create index for performance
CREATE INDEX IF NOT EXISTS idx_shops_deleted_at ON shops(deleted_at);

-- 3. Update existing shops to have NULL deleted_at (not deleted)
UPDATE shops 
SET deleted_at = NULL 
WHERE deleted_at IS NOT NULL;

-- 4. Verify the column was added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'shops' AND column_name = 'deleted_at';

-- 5. Test soft delete functionality
-- This is just for testing - the actual soft delete will be done from the UI
-- UPDATE shops SET deleted_at = NOW() WHERE shop_name = 'Test Shop';

-- 6. Query to show active vs deleted shops
SELECT 
    shop_name,
    CASE 
        WHEN deleted_at IS NULL THEN 'Active'
        ELSE 'Deleted'
    END as status,
    deleted_at
FROM shops 
ORDER BY deleted_at NULLS LAST, shop_name;
