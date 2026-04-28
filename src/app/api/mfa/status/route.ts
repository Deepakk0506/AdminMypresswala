import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
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

    // Check if MFA is enabled
    const { data: mfaData } = await supabase
      .from('mfa_settings')
      .select('is_enabled, verified_at')
      .eq('user_id', session.user.id)
      .single()

    return NextResponse.json({
      mfaEnabled: mfaData?.is_enabled || false,
      verifiedAt: mfaData?.verified_at || null
    })
  } catch (err) {
    console.error('MFA status error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
