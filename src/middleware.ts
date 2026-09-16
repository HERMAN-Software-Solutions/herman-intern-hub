import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const PROTECTED = ['/dashboard', '/onboarding', '/admin']

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
    return NextResponse.redirect(new URL('/onboarding/welcome', req.url))
  }

  // Admin routes
  if (pathname.startsWith('/admin')) {
    if (profile.role !== 'admin' && profile.role !== 'super_admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    return res
  }

  // Dashboard routes — must be active
  if (pathname.startsWith('/dashboard')) {
    if (profile.status !== 'active') {
      if (profile.status === 'onboarding') {
        return NextResponse.redirect(new URL('/onboarding', req.url))
      }
      return NextResponse.redirect(new URL('/account-status', req.url))
    }
    return res
  }

  // Onboarding routes — only for onboarding status
  if (pathname.startsWith('/onboarding')) {
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
  matcher: ['/dashboard/:path*', '/onboarding/:path*', '/admin/:path*'],
}