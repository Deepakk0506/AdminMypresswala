-- Fix foreign key constraints to allow customer deletion
-- Execute this in Supabase SQL Editor

-- Drop existing foreign key constraints and recreate with CASCADE
ALTER TABLE public.customer_order_summary DROP CONSTRAINT IF EXISTS customer_order_summary_customer_id_fkey;
ALTER TABLE public.customer_tags DROP CONSTRAINT IF EXISTS customer_tags_customer_id_fkey;
ALTER TABLE public.customer_communications DROP CONSTRAINT IF EXISTS customer_communications_customer_id_fkey;

-- Recreate foreign keys with ON DELETE CASCADE
ALTER TABLE public.customer_order_summary 
ADD CONSTRAINT customer_order_summary_customer_id_fkey 
FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;

ALTER TABLE public.customer_tags 
ADD CONSTRAINT customer_tags_customer_id_fkey 
FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;

ALTER TABLE public.customer_communications 
ADD CONSTRAINT customer_communications_customer_id_fkey 
FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;

-- Verify constraints
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    rc.update_rule, 
    rc.delete_rule
FROM information_schema.table_constraints tc
JOIN information_schema.referential_constraints rc 
    ON tc.constraint_name = rc.constraint_name
WHERE tc.table_schema = 'public'
AND tc.table_name IN ('customer_order_summary', 'customer_tags', 'customer_communications')
AND rc.unique_constraint_name IS NOT NULL;
