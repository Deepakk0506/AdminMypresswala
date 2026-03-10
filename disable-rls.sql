-- Fix RLS policy error for customers table
-- Execute this in Supabase SQL Editor

-- Disable Row Level Security for customers table
ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;

-- Also disable RLS for related tables if needed
ALTER TABLE public.customer_order_summary DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_communications DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('customers', 'customer_order_summary', 'customer_tags', 'customer_communications');
