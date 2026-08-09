// Nome dell'header interno con cui il middleware comunica la lingua ai Server
// Component. Sta in un file suo, senza dipendenze, perché lo importano sia il
// middleware (edge runtime) sia getLang() (server): importarlo da uno dei due
// trascinerebbe nell'altro codice non compatibile.
export const LANG_HEADER = 'x-moesco-lang'

import type { Lang } from './strings'

/**
 * Prefissa un percorso interno con /en quando la lingua attiva è l'inglese.
 * Va usata per OGNI link interno: da quando la lingua vive solo nell'indirizzo
 * (niente più cookie con redirect automatico), un href scritto a mano come
 * "/eventi" farebbe uscire l'utente inglese dalla sezione inglese.
 */
export function localizzaPath(path: string, lang: Lang): string {
  if (lang !== 'en') return path
  if (!path.startsWith('/')) return path
  if (path === '/en' || path.startsWith('/en/')) return path
  return path === '/' ? '/en' : `/en${path}`
}
