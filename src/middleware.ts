import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// v2: rinominato da 'moesco_lang' per invalidare i cookie "en" residui
// impostati prima della fix "italiano sempre di default" (vedi sotto) — senza
// il bump di versione, chi aveva già il cookie vecchio a "en" (es. da un
// browser in-app tipo Facebook/Instagram) sarebbe rimasto bloccato in inglese
// per un anno, nonostante il fix.
const LANG_COOKIE = 'moesco_lang_v2'
const UN_ANNO = 60 * 60 * 24 * 365

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

function isAdmin(email: string | undefined): boolean {
  const adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail) return true // fallback: se non configurato, qualsiasi utente loggato
  return email === adminEmail
}

// ─── Localizzazione (IT/EN) ──────────────────────────────────────────────
// Pattern "rewrite + cookie" (senza cartella [locale] in app/): /en/* viene
// riscritto internamente sulla stessa pagina italiana (stessi file, stesso
// slug), con un cookie che dice ai Server Component quale lingua servire
// (vedi src/lib/i18n/getLang.ts).
//
// Italiano è SEMPRE la lingua di default alla prima visita (nessun cookie):
// niente auto-detect basato su Accept-Language/geo IP. In passato la
// detection mandava su /en visitatori italiani veri (header del browser non
// affidabili, IP geolocalizzati male, tool automatizzati senza header
// coerenti) e il cookie impostato su "en" restava fisso per un anno,
// rompendo la navigazione in italiano finché non si passava manualmente
// dallo switch in navbar. L'inglese resta disponibile solo tramite quello
// switch manuale, mai come default automatico.
const PREFISSI_ESCLUSI_DA_I18N = ['/admin', '/dashboard', '/accedi', '/api', '/_next']
const ESTENSIONI_STATICHE = /\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|txt|xml|json|woff|woff2|ttf)$/i

function gestisciLingua(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl

  if (
    PREFISSI_ESCLUSI_DA_I18N.some(p => pathname === p || pathname.startsWith(p + '/')) ||
    ESTENSIONI_STATICHE.test(pathname) ||
    pathname === '/favicon.ico'
  ) {
    return null
  }

  const isEnPath = pathname === '/en' || pathname.startsWith('/en/')
  const cookieLang = request.cookies.get(LANG_COOKIE)?.value

  if (isEnPath) {
    const nuovoPath = pathname.replace(/^\/en/, '') || '/'
    const rewriteUrl = request.nextUrl.clone()
    rewriteUrl.pathname = nuovoPath
    const res = NextResponse.rewrite(rewriteUrl)
    if (cookieLang !== 'en') res.cookies.set(LANG_COOKIE, 'en', { path: '/', maxAge: UN_ANNO })
    return res
  }

  // Percorso "italiano" (senza prefisso /en): se l'utente ha già scelto EN in
  // precedenza (cookie), portalo sulla versione /en dello stesso percorso.
  if (cookieLang === 'en') {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/en' + pathname
    return NextResponse.redirect(redirectUrl)
  }

  if (!cookieLang) {
    // Nessuna detection: italiano di default, sempre. Fissiamo il cookie per
    // non ripetere la logica ad ogni richiesta.
    const res = NextResponse.next()
    res.cookies.set(LANG_COOKIE, 'it', { path: '/', maxAge: UN_ANNO })
    return res
  }

  return null
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const rispostaLingua = gestisciLingua(request)
  if (rispostaLingua) return rispostaLingua

  const response = NextResponse.next()

  // Pagine admin pubbliche (non richiedono login)
  const adminPubbliche = ['/admin/login', '/admin/recupera-password', '/admin/nuova-password']

  // ── Proteggi /admin (tranne le pagine pubbliche) ──────────────────────────
  if (pathname.startsWith('/admin') && !adminPubbliche.includes(pathname)) {
    const supabase = buildSupabase(request, response)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !isAdmin(user.email)) {
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Se già loggato come admin e va su /admin/login o recupera-password, manda all'admin
  if (pathname === '/admin/login' || pathname === '/admin/recupera-password') {
    const supabase = buildSupabase(request, response)
    const { data: { user } } = await supabase.auth.getUser()
    if (user && isAdmin(user.email)) return NextResponse.redirect(new URL('/admin', request.url))
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

  // Se già loggato e va su /accedi, manda alla dashboard (o /admin se è l'admin)
  if (pathname === '/accedi') {
    const supabase = buildSupabase(request, response)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const dest = isAdmin(user.email) ? '/admin' : '/dashboard'
      return NextResponse.redirect(new URL(dest, request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico).*)',
  ],
}
