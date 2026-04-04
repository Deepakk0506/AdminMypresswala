-- Simple RLS fix - Disable RLS for all admin tables
-- Run this in Supabase SQL Editor

-- Disable RLS for services table
ALTER TABLE public.services DISABLE ROW LEVEL SECURITY;

-- Disable RLS for garment_categories table  
ALTER TABLE public.garment_categories DISABLE ROW LEVEL SECURITY;

-- Disable RLS for garments table
ALTER TABLE public.garments DISABLE ROW LEVEL SECURITY;

-- Disable RLS for service_garment_pricing table
ALTER TABLE public.service_garment_pricing DISABLE ROW LEVEL SECURITY;

-- Grant full permissions to authenticated users
GRANT ALL ON public.services TO authenticated;
GRANT ALL ON public.garment_categories TO authenticated;
GRANT ALL ON public.garments TO authenticated;  
GRANT ALL ON public.service_garment_pricing TO authenticated;

-- Grant read permissions to anonymous users (optional)
GRANT SELECT ON public.services TO anon;
GRANT SELECT ON public.garment_categories TO anon;
GRANT SELECT ON public.garments TO anon;
GRANT SELECT ON public.service_garment_pricing TO anon;

-- Verify RLS is disabled
SELECT 
    tablename,
    rowsecurity as "RLS Status"
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('services', 'garment_categories', 'garments', 'service_garment_pricing')
ORDER BY tablename;
