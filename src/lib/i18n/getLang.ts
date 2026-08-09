import { headers } from 'next/headers'
import type { Lang } from './strings'
import { LANG_HEADER } from './lang-header'

// Legge la lingua attiva lato server dall'header interno impostato dal
// middleware sul rewrite di /en/* (vedi src/middleware.ts).
//
// NB: si legge un HEADER, non un cookie. Il cookie di lingua è stato rimosso
// il 9/8/2026 perché rendeva la lingua "appiccicosa" per un anno sull'intero
// sito, indipendentemente dall'indirizzo aperto — vedi la nota estesa in
// middleware.ts. Con l'header, la lingua dipende solo dall'URL richiesto:
// /en/... è inglese, tutto il resto è italiano.
export async function getLang(): Promise<Lang> {
  const h = await headers()
  return h.get(LANG_HEADER) === 'en' ? 'en' : 'it'
}
