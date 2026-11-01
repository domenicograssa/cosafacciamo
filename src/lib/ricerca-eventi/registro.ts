import type { SupabaseClient } from '@supabase/supabase-js'

// ─── Registro delle ricerche automatiche ───
// Ogni chiamata a /api/cron/ricerca-eventi lascia una riga in
// ricerche_eventi_log (vedi registro-ricerche.sql), letta da
// /admin/registro-ricerche. I log di Vercel durano solo un'ora: senza questo
// registro non c'è modo di sapere se il cron gira e cosa trova.
// Un errore di scrittura non deve mai far fallire la ricerca: si logga e basta.

export interface VoceRegistro {
  origine: 'cron' | 'manuale'
  esito: 'ok' | 'errore' | 'nessun_comune'
  comune?: string | null
  gruppo?: number | null
  slot?: number | null
  motore?: string | null
  prova?: boolean
  ricerche_web?: number | null
  proposti?: number | null
  inseriti?: number | null
  scartati?: number | null
  durata_ms?: number | null
  errore?: string | null
  dettaglio?: unknown
}

export async function registraRicerca(sb: SupabaseClient, voce: VoceRegistro): Promise<void> {
  try {
    const { error } = await sb.from('ricerche_eventi_log').insert(voce as never)
    if (error) console.error('[ricerca-eventi] registro non scritto:', error.message)
  } catch (e) {
    console.error('[ricerca-eventi] registro non scritto:', e instanceof Error ? e.message : e)
  }
}
