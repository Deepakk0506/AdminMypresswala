import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

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

    // Verify password before disabling MFA
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: session.user.email!,
      password,
    })

    if (signInError) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 400 })
    }

    // Disable MFA
    const { error: updateError } = await supabase
      .from('mfa_settings')
      .update({
        is_enabled: false,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', session.user.id)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to disable MFA' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('MFA disable error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
