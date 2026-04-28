-- Fix RLS policies to allow admin authentication check
-- The current policy blocks the login API from checking if user is an admin

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can read own data" ON public.admins;
DROP POLICY IF EXISTS "Super admin can manage all admins" ON public.admins;

-- Create new policies that allow authenticated users to read their own admin record
CREATE POLICY "Users can read own admin record" ON public.admins
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

-- Allow super admin to do everything
CREATE POLICY "Super admin full access" ON public.admins
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admins 
            WHERE id = auth.uid() AND role = 'super_admin' AND is_active = true
        )
    );

-- Allow super admin to insert/update/delete
CREATE POLICY "Super admin can manage admins" ON public.admins
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admins 
            WHERE id = auth.uid() AND role = 'super_admin' AND is_active = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.admins 
            WHERE id = auth.uid() AND role = 'super_admin' AND is_active = true
        )
    );
