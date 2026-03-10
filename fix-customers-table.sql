-- Fix missing addr column in customers table
-- Execute this in Supabase SQL Editor

ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS addr TEXT;

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'customers' 
AND table_schema = 'public'
ORDER BY ordinal_position;
