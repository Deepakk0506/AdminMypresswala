-- Check and fix RLS policies for admin panel tables

-- First, let's check current RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('services', 'garment_categories', 'garments', 'service_garment_pricing')
ORDER BY tablename;

-- Check existing RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN ('services', 'garment_categories', 'garments', 'service_garment_pricing')
ORDER BY tablename, policyname;

-- Disable RLS for admin operations (simple fix)
ALTER TABLE public.services DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.garment_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.garments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_garment_pricing DISABLE ROW LEVEL SECURITY;

-- Alternative: Create admin bypass policies (if you want to keep RLS for other users)
-- CREATE POLICY "Admin users bypass RLS" ON public.services
--     FOR ALL USING (auth.jwt() ->> 'role' = 'admin')
--     WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- CREATE POLICY "Admin users bypass RLS" ON public.garment_categories
--     FOR ALL USING (auth.jwt() ->> 'role' = 'admin')
--     WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- CREATE POLICY "Admin users bypass RLS" ON public.garments
--     FOR ALL USING (auth.jwt() ->> 'role' = 'admin')
--     WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- CREATE POLICY "Admin users bypass RLS" ON public.service_garment_pricing
--     FOR ALL USING (auth.jwt() ->> 'role' = 'admin')
--     WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Grant necessary permissions
GRANT ALL ON public.services TO authenticated;
GRANT ALL ON public.services TO anon;
GRANT ALL ON public.garment_categories TO authenticated;
GRANT ALL ON public.garment_categories TO anon;
GRANT ALL ON public.garments TO authenticated;
GRANT ALL ON public.garments TO anon;
GRANT ALL ON public.service_garment_pricing TO authenticated;
GRANT ALL ON public.service_garment_pricing TO anon;

-- Test insert to verify fix
INSERT INTO public.services (name, description, is_active) 
VALUES ('Test Service', 'Test description', true)
ON CONFLICT DO NOTHING;

-- Clean up test data
DELETE FROM public.services WHERE name = 'Test Service';

-- Final status check
SELECT 
    tablename,
    rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('services', 'garment_categories', 'garments', 'service_garment_pricing')
ORDER BY tablename;
