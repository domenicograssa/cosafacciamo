import { cookies } from 'next/headers'
import type { Lang } from './strings'

// Legge la lingua attiva lato server dal cookie impostato dal middleware
// (vedi src/middleware.ts) — 'it' di default se assente/non valido.
export async function getLang(): Promise<Lang> {
  const store = await cookies()
  const v = store.get('moesco_lang_v2')?.value
  return v === 'en' ? 'en' : 'it'
}
