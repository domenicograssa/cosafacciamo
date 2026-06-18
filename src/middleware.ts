import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

function buildSupabase(request: NextRequest, response: NextResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()

  // ── Proteggi /admin (tranne /admin/login) ─────────────────────────────────
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const supabase = buildSupabase(request, response)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Se già loggato e va su /admin/login, manda all'admin
  if (pathname === '/admin/login') {
    const supabase = buildSupabase(request, response)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) return NextResponse.redirect(new URL('/admin', request.url))
  }

  // ── Proteggi /dashboard ───────────────────────────────────────────────────
  if (pathname.startsWith('/dashboard')) {
    const supabase = buildSupabase(request, response)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      const loginUrl = new URL('/accedi', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Se già loggato e va su /accedi, manda alla dashboard
  if (pathname === '/accedi') {
    const supabase = buildSupabase(request, response)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/accedi'],
}
