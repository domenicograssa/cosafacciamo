import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { richiestaAutorizzata } from '@/lib/api-auth'
import { aggiornaStatoEventoCore } from '@/lib/eventi-stato'

export const dynamic = 'force-dynamic'

// Endpoint di servizio per cambiare stato a uno o più eventi senza passare
// dal login admin — pensato per l'automazione che revisiona/approva le
// proposte inserite da /api/proponi-eventi (vedi quella route per il
// contesto). Usa lo stesso nucleo (lib/eventi-stato.ts) del pannello admin,
// quindi stesso comportamento: aggiorna stato/note/date, promuove
// l'organizzatore se era in attesa, invia le email, invalida la cache ISR.
//
// Richiede esplicitamente l'elenco degli eventi da toccare (niente
// scorciatoia "tutti in_revisione"): un ID sbagliato o una lista incompleta
// è un errore di chi chiama, ma non si rischia mai di toccare eventi non
// previsti.
//
// Auth: stesso segreto condiviso di /api/proponi-eventi — vedi
// src/lib/api-auth.ts. Header "Authorization: Bearer <CRON_SECRET>"
// preferito, "?secret=<...>" accettato solo per retrocompatibilità.

interface VoceRichiesta {
  id: string
  stato: 'approvato' | 'rifiutato' | 'sospeso'
  nota?: string
}

interface EsitoVoce {
  id: string
  ok: boolean
  errore?: string
}

export async function POST(req: NextRequest) {
  if (!richiestaAutorizzata(req)) {
    return NextResponse.json({ ok: false, errore: 'Non autorizzato.' }, { status: 401 })
  }

  let body: { eventi?: VoceRichiesta[] }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, errore: 'JSON non valido.' }, { status: 400 })
  }

  const voci = body.eventi
  if (!Array.isArray(voci) || voci.length === 0) {
    return NextResponse.json({ ok: false, errore: 'Nessun evento fornito (campo "eventi" mancante o vuoto).' }, { status: 400 })
  }

  const statiValidi = new Set(['approvato', 'rifiutato', 'sospeso'])
  const risultati: EsitoVoce[] = []
  let almenoUnoOk = false

  for (const v of voci) {
    if (!v.id || !statiValidi.has(v.stato)) {
      risultati.push({ id: v.id || '(mancante)', ok: false, errore: 'Campi obbligatori mancanti o non validi (id, stato).' })
      continue
    }
    const esito = await aggiornaStatoEventoCore(v.id, v.stato, v.nota)
    risultati.push({ id: v.id, ok: esito.ok, errore: esito.errore })
    if (esito.ok) almenoUnoOk = true
  }

  if (almenoUnoOk) {
    revalidatePath('/admin/eventi')
    revalidatePath('/admin')
  }

  return NextResponse.json({ ok: true, risultati })
}
