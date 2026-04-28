-- Disable RLS temporarily to allow admin check
-- This allows authenticated users to check if they are admins
ALTER TABLE public.admins DISABLE ROW LEVEL SECURITY;

-- Re-enable with simpler policies
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read their own admin record
CREATE POLICY "Users can read own admin record" ON public.admins
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

-- Allow super admin to manage all admins
CREATE POLICY "Super admin can manage admins" ON public.admins
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admins 
            WHERE id = auth.uid() AND role = 'super_admin' AND is_active = true
        )
    );
