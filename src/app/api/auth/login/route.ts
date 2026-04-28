import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
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

    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }

    // Check if user exists in admins table and is active
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('id, email, full_name, role, is_active, mfa_enabled')
      .eq('id', data.user.id)
      .single()

    if (adminError || !adminData) {
      // Sign out if not an admin
      await supabase.auth.signOut()
      return NextResponse.json(
        { error: 'Access denied. Not an admin account.' },
        { status: 403 }
      )
    }

    if (!adminData.is_active) {
      await supabase.auth.signOut()
      return NextResponse.json(
        { error: 'Account is deactivated. Contact super admin.' },
        { status: 403 }
      )
    }

    // Check if MFA is enabled for this user
    if (adminData.mfa_enabled) {
      // MFA is required - return partial success, wait for MFA verification
      return NextResponse.json({
        success: true,
        mfaRequired: true,
        user: {
          id: adminData.id,
          email: adminData.email,
          full_name: adminData.full_name,
          role: adminData.role,
        },
      })
    }

    // No MFA required - complete login
    // Update last login timestamp
    await supabase
      .from('admins')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', data.user.id)

    return NextResponse.json({
      success: true,
      mfaRequired: false,
      user: {
        id: adminData.id,
        email: adminData.email,
        full_name: adminData.full_name,
        role: adminData.role,
      },
    })
  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
