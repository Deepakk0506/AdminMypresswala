import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import speakeasy from 'speakeasy'

export async function POST(request: Request) {
  try {
    const { email, code, isBackupCode } = await request.json()

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and code are required' },
        { status: 400 }
      )
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    // Get user session (should be partially authenticated from password login)
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Session expired. Please login again.' },
        { status: 401 }
      )
    }

    // Get MFA settings
    const { data: mfaData } = await supabase
      .from('mfa_settings')
      .select('secret, backup_codes, is_enabled')
      .eq('user_id', session.user.id)
      .single()

    if (!mfaData || !mfaData.is_enabled) {
      return NextResponse.json(
        { error: 'MFA not enabled for this user' },
        { status: 400 }
      )
    }

    let verified = false

    if (isBackupCode) {
      // Verify backup code
      const backupCodes = mfaData.backup_codes || []
      const codeIndex = backupCodes.findIndex(
        (bc: string) => bc.toUpperCase() === code.toUpperCase()
      )

      if (codeIndex === -1) {
        return NextResponse.json(
          { error: 'Invalid backup code' },
          { status: 400 }
        )
      }

      // Remove used backup code
      backupCodes.splice(codeIndex, 1)
      await supabase
        .from('mfa_settings')
        .update({ backup_codes: backupCodes })
        .eq('user_id', session.user.id)

      verified = true
    } else {
      // Verify TOTP code
      verified = speakeasy.totp.verify({
        secret: mfaData.secret,
        encoding: 'base32',
        token: code,
        window: 2
      })
    }

    if (!verified) {
      return NextResponse.json(
        { error: 'Invalid code' },
        { status: 400 }
      )
    }

    // Get admin details
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('id, email, full_name, role, is_active')
      .eq('id', session.user.id)
      .single()

    if (adminError || !adminData) {
      return NextResponse.json(
        { error: 'Admin account not found' },
        { status: 403 }
      )
    }

    // At this point, adminData is guaranteed to exist
    const admin = adminData!

    // Update last login
    await supabase
      .from('admins')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', session.user.id)

    return NextResponse.json({
      success: true,
      mfaVerified: true,
      user: {
        id: admin.id,
        email: admin.email,
        full_name: admin.full_name,
        role: admin.role,
      },
    })
  } catch (err) {
    console.error('MFA verify error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
