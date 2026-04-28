-- MFA Setup: Create tables for multi-factor authentication

-- Create mfa_settings table to store TOTP secrets
CREATE TABLE IF NOT EXISTS public.mfa_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.admins(id) ON DELETE CASCADE,
    secret TEXT NOT NULL, -- Encrypted TOTP secret
    is_enabled BOOLEAN DEFAULT false,
    backup_codes TEXT[], -- Array of hashed backup codes
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Add mfa_required column to admins table
ALTER TABLE public.admins 
ADD COLUMN IF NOT EXISTS mfa_required BOOLEAN DEFAULT false;

-- Add mfa_enabled column to admins table for quick checking
ALTER TABLE public.admins 
ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN DEFAULT false;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_mfa_settings_user_id ON public.mfa_settings(user_id);

-- Enable RLS
ALTER TABLE public.mfa_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own MFA settings
CREATE POLICY "Users can manage own MFA settings" ON public.mfa_settings
    FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create policy for super admin to manage all MFA settings
CREATE POLICY "Super admin can manage all MFA settings" ON public.mfa_settings
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admins 
            WHERE id = auth.uid() AND role = 'super_admin' AND is_active = true
        )
    );

-- Function to update mfa_enabled in admins table
CREATE OR REPLACE FUNCTION update_mfa_enabled()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.admins 
    SET mfa_enabled = NEW.is_enabled,
        updated_at = NOW()
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to keep admins.mfa_enabled in sync
DROP TRIGGER IF EXISTS sync_mfa_enabled ON public.mfa_settings;
CREATE TRIGGER sync_mfa_enabled
    AFTER INSERT OR UPDATE ON public.mfa_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_mfa_enabled();
