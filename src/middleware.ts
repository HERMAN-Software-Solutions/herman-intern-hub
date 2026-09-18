import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const PROTECTED = ['/dashboard', '/onboarding', '/admin', '/mentor']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (!PROTECTED.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookies) => {
          cookies.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('status, role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  const isAdmin = profile.role === 'admin' || profile.role === 'super_admin'
  const isMentor = profile.role === 'mentor'
  const isMentorOrAdmin = isMentor || isAdmin

  // ─── Admin routes (admins only) ─────────────────────
  if (pathname.startsWith('/admin')) {
    if (!isAdmin) {
      // Mentors who somehow hit /admin → send to their own panel
      if (isMentor) {
        return NextResponse.redirect(new URL('/mentor', req.url))
      }
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    return res
  }

  // ─── Mentor routes (mentors + admins) ───────────────
  if (pathname.startsWith('/mentor')) {
    if (!isMentorOrAdmin) {
      // Interns or others → their dashboard
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    return res
  }

  // ─── Dashboard routes (interns only) ────────────────
  if (pathname.startsWith('/dashboard')) {
    // Mentors + admins → their own panels (they don't have intern dashboards)
    if (isAdmin) {
      return NextResponse.redirect(new URL('/admin', req.url))
    }
    if (isMentor) {
      return NextResponse.redirect(new URL('/mentor', req.url))
    }

    // Interns — must be active
    if (profile.status !== 'active') {
      if (profile.status === 'onboarding') {
        return NextResponse.redirect(new URL('/onboarding', req.url))
      }
      return NextResponse.redirect(new URL('/account-status', req.url))
    }
    return res
  }

  // ─── Onboarding routes (interns only) ───────────────
  if (pathname.startsWith('/onboarding')) {
    // Mentors + admins don't onboard
    if (isAdmin) {
      return NextResponse.redirect(new URL('/admin', req.url))
    }
    if (isMentor) {
      return NextResponse.redirect(new URL('/mentor', req.url))
    }

    // Interns
    if (profile.status === 'active') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    if (profile.status !== 'onboarding') {
      return NextResponse.redirect(new URL('/account-status', req.url))
    }
    return res
  }

  return res
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/onboarding/:path*',
    '/admin/:path*',
    '/mentor/:path*',
  ],
}