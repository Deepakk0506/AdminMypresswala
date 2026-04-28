import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import speakeasy from 'speakeasy'
import QRCode from 'qrcode'

export async function POST(request: Request) {
  try {
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

    // Check session
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { action, code } = await request.json()

    if (action === 'generate') {
      // Generate TOTP secret
      const secret = speakeasy.generateSecret({
        name: `Mypresswala (${session.user.email})`,
        length: 32
      })

      // Generate QR code
      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!)

      // Store temporary secret (not enabled yet)
      const { error: upsertError } = await supabase
        .from('mfa_settings')
        .upsert({
          user_id: session.user.id,
          secret: secret.base32,
          is_enabled: false,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })

      if (upsertError) {
        return NextResponse.json({ error: 'Failed to save secret' }, { status: 500 })
      }

      return NextResponse.json({
        secret: secret.base32,
        qrCode: qrCodeUrl,
        manualEntryKey: secret.base32
      })
    }

    if (action === 'verify') {
      // Get stored secret
      const { data: mfaData } = await supabase
        .from('mfa_settings')
        .select('secret')
        .eq('user_id', session.user.id)
        .single()

      if (!mfaData) {
        return NextResponse.json({ error: 'MFA not set up' }, { status: 400 })
      }

      // Verify code
      const verified = speakeasy.totp.verify({
        secret: mfaData.secret,
        encoding: 'base32',
        token: code,
        window: 2 // Allow 1 minute time drift
      })

      if (!verified) {
        return NextResponse.json({ error: 'Invalid code' }, { status: 400 })
      }

      // Generate backup codes
      const backupCodes = Array.from({ length: 10 }, () => 
        Math.random().toString(36).substring(2, 8).toUpperCase()
      )

      // Enable MFA
      const { error: updateError } = await supabase
        .from('mfa_settings')
        .update({
          is_enabled: true,
          backup_codes: backupCodes,
          verified_at: new Date().toISOString()
        })
        .eq('user_id', session.user.id)

      if (updateError) {
        return NextResponse.json({ error: 'Failed to enable MFA' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        backupCodes
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (err) {
    console.error('MFA setup error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
