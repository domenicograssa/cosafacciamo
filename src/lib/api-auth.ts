import { timingSafeEqual } from 'crypto'
import type { NextRequest } from 'next/server'

// ─── Autenticazione degli endpoint di servizio ───────────────────────────────
//
// Usata da /api/proponi-eventi e /api/revalidate, endpoint richiamati da
// automazioni (task di ricerca eventi, invalidazione cache dopo modifiche SQL)
// e non da utenti loggati.
//
// STORIA (9/8/2026): prima il "segreto" condiviso era ADMIN_EMAIL, passato in
// query string. Peggio: la route pubblica /api/debug restituiva a chiunque il
// valore di ADMIN_EMAIL, quindi il segreto era di fatto pubblico e chiunque
// poteva iniettare eventi nella coda di revisione. /api/debug è stata rimossa e
// il segreto è ora una variabile dedicata (CRON_SECRET), scollegata
// dall'identità dell'amministratore.
//
// Il segreto va inviato preferibilmente nell'header:
//     Authorization: Bearer <CRON_SECRET>
// L'header non finisce nei log di accesso, nella cronologia del browser né nel
// Referer, a differenza della query string. Per retrocompatibilità resta
// accettato anche ?secret=<...>, da considerarsi deprecato.
//
// Finché CRON_SECRET non è configurata su Vercel si continua ad accettare
// ADMIN_EMAIL, così il deploy non rompe le automazioni esistenti. Una volta
// impostata la variabile, il fallback smette di applicarsi.

/** Confronto a tempo costante: evita di rivelare il segreto un byte alla volta. */
function confrontoSicuro(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

/**
 * Verifica che la richiesta porti un segreto valido.
 * @returns true se autorizzata.
 */
export function richiestaAutorizzata(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET?.trim()
  const adminEmail = process.env.ADMIN_EMAIL?.trim()

  // Segreto atteso: CRON_SECRET se presente, altrimenti il vecchio ADMIN_EMAIL.
  const atteso = cronSecret || adminEmail
  if (!atteso) return false

  // 1) Authorization: Bearer <segreto> — modalità consigliata
  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const fornito = authHeader.slice(7).trim()
    if (fornito && confrontoSicuro(fornito, atteso)) return true
  }

  // 2) ?secret=<segreto> — deprecato, mantenuto per non rompere le automazioni
  const fornitoQuery = new URL(req.url).searchParams.get('secret')?.trim()
  if (fornitoQuery && confrontoSicuro(fornitoQuery, atteso)) return true

  return false
}
