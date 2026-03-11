-- Shop Approval System Migration
-- Add approval workflow, categories, and image support

-- 1. Add approval and category columns
ALTER TABLE shops 
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected', 'active')),
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS approved_by UUID,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_shops_approval_status ON shops(approval_status);
CREATE INDEX IF NOT EXISTS idx_shops_category ON shops(category);
CREATE INDEX IF NOT EXISTS idx_shops_submitted_at ON shops(submitted_at);

-- 3. Update existing shops to have approval status
UPDATE shops 
SET 
    approval_status = 'active',
    category = 'Laundry & Dry Cleaning',
    submitted_at = created_at,
    approved_at = created_at
WHERE approval_status IS NULL;

-- 4. Verify the columns were added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'shops' AND column_name IN ('approval_status', 'category', 'submitted_at', 'approved_at', 'approved_by', 'rejection_reason');

-- 5. Check current approval status distribution
SELECT 
    approval_status,
    COUNT(*) as count,
    category
FROM shops 
GROUP BY approval_status, category
ORDER BY approval_status;
