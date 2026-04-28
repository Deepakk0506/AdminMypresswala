-- Create admins table for authentication
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin')),
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to read their own data
CREATE POLICY "Admins can read own data" ON public.admins
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

-- Create policy for super_admin to manage all admins
CREATE POLICY "Super admin can manage all admins" ON public.admins
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admins 
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_admins_email ON public.admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_role ON public.admins(role);

-- Insert initial super admin (will be linked to Supabase Auth user)
-- Note: After creating this, you'll need to sign up the user in Supabase Auth
-- and update this record with the auth user's UUID
INSERT INTO public.admins (email, full_name, role, is_active)
VALUES ('admin@mypresswala.com', 'Super Admin', 'super_admin', true)
ON CONFLICT (email) DO NOTHING;
