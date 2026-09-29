import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import { richiestaAutorizzata } from '@/lib/api-auth'
import { inserisciCandidati, type EventoCandidato } from '@/lib/eventi-proposti'

export const dynamic = 'force-dynamic'

// Riceve una lista di eventi candidati (trovati via ricerca web) e li inserisce
// SEMPRE con stato 'in_revisione' (mai pubblicati direttamente) sotto
// l'organizzatore tecnico 'ricerca-automatica-moesco', salvando la fonte in
// fonte_ricerca così chi approva in /admin/eventi può verificarla.
// La logica di inserimento è in src/lib/eventi-proposti.ts, condivisa con il
// cron /api/cron/ricerca-eventi.
// Auth: segreto condiviso CRON_SECRET, vedi src/lib/api-auth.ts. Da inviare
// nell'header "Authorization: Bearer <CRON_SECRET>"; ?secret=<...> resta
// accettato solo per retrocompatibilità.

export async function POST(req: NextRequest) {
  if (!richiestaAutorizzata(req)) {
    return NextResponse.json({ ok: false, errore: 'Non autorizzato.' }, { status: 401 })
  }

  let body: { eventi?: EventoCandidato[] }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, errore: 'JSON non valido.' }, { status: 400 })
  }

  const candidati = body.eventi
  if (!Array.isArray(candidati) || candidati.length === 0) {
    return NextResponse.json({ ok: false, errore: 'Nessun evento fornito (campo "eventi" mancante o vuoto).' }, { status: 400 })
  }

  const sb = await createAdminClient()

  try {
    const { risultati, almenoUnoOk } = await inserisciCandidati(sb, candidati)
    if (almenoUnoOk) {
      revalidatePath('/admin/eventi')
      revalidatePath('/admin')
    }
    return NextResponse.json({ ok: true, risultati })
  } catch (e) {
    return NextResponse.json({ ok: false, errore: e instanceof Error ? e.message : 'Errore imprevisto.' }, { status: 500 })
  }
}
