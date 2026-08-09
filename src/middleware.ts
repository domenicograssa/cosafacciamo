import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Header interno con cui il middleware comunica ai Server Component quale
// lingua servire (vedi src/lib/i18n/getLang.ts). NON è un cookie: vedi la nota
// architetturale in gestisciLingua().
import { LANG_HEADER } from '@/lib/i18n/lang-header'

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
// REGOLA UNICA E DEFINITIVA (9/8/2026): la lingua sta SOLO nell'indirizzo.
//   /qualcosa     → sempre italiano
//   /en/qualcosa  → sempre inglese
// Nessun cookie, nessun redirect automatico, nessun auto-detect da
// Accept-Language o geo-IP. Un indirizzo restituisce sempre la stessa lingua,
// per chiunque, sempre.
//
// PERCHÉ (storia del bug, da non ripetere): prima la lingua era in un cookie
// di durata annuale e il middleware reindirizzava a forza. Bastava cliccare
// una volta lo switch EN per restare agganciati all'inglese su TUTTO il sito
// per un anno — anche riaprendo il sito da zero, anche aprendo link italiani.
// Il sintomo tornava "ciclicamente" e l'unico rimedio applicato era rinominare
// il cookie (moesco_lang → moesco_lang_v2) per sganciare gli utenti: un
// cerotto da riapplicare ogni volta. Inoltre, con la lingua in un cookie e non
// nell'URL, l'indirizzo non identifica più univocamente il contenuto: qualsiasi
// livello di cache (CDN, ISR, browser, anteprime social) può servire la lingua
// sbagliata. Togliendo il cookie il problema sparisce alla radice.
//
// La lingua scelta viene passata ai Server Component tramite un header di
// richiesta interno (LANG_HEADER), non tramite cookie.
const PREFISSI_ESCLUSI_DA_I18N = ['/admin', '/dashboard', '/accedi', '/api', '/_next']
const ESTENSIONI_STATICHE = /\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|txt|xml|json|webmanifest|woff|woff2|ttf)$/i

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
  if (!isEnPath) {
    // Percorso italiano: nessun redirect, nessun cookie. Prosegue il middleware
    // (auth ecc.) e i Server Component vedranno l'italiano di default.
    return null
  }

  // /en/* → viene servito dagli stessi file di pagina, con l'header di lingua.
  const nuovoPath = pathname.replace(/^\/en/, '') || '/'
  const rewriteUrl = request.nextUrl.clone()
  rewriteUrl.pathname = nuovoPath

  const headersRichiesta = new Headers(request.headers)
  headersRichiesta.set(LANG_HEADER, 'en')

  const res = NextResponse.rewrite(rewriteUrl, { request: { headers: headersRichiesta } })
  res.headers.set('Content-Language', 'en')
  return res
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const rispostaLingua = gestisciLingua(request)
  if (rispostaLingua) return rispostaLingua

  const response = NextResponse.next()
  // Percorso senza prefisso /en → italiano, dichiarato esplicitamente a livello
  // HTTP (prima next.config.ts marcava "it" TUTTE le pagine, comprese quelle
  // /en: era uno dei motivi per cui i browser in-app proponevano di tradurre
  // le pagine inglesi).
  response.headers.set('Content-Language', 'it')

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
