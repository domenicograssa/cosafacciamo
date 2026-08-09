import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import { richiestaAutorizzata } from '@/lib/api-auth'

export const dynamic = 'force-dynamic'

// Endpoint usato dal task settimanale di ricerca automatica eventi (vedi
// scheduled task "Ricerca automatica eventi moesco"): riceve una lista di
// eventi candidati trovati via ricerca web, li inserisce SEMPRE con
// stato 'in_revisione' (mai pubblicati direttamente) sotto l'organizzatore
// tecnico 'ricerca-automatica-moesco', salvando la fonte in fonte_ricerca
// così chi approva in /admin/eventi può verificarla prima di pubblicare.
// Auth: segreto condiviso CRON_SECRET — vedi src/lib/api-auth.ts. Da inviare
// nell'header "Authorization: Bearer <CRON_SECRET>"; ?secret=<...> resta
// accettato solo per retrocompatibilità.

interface EventoCandidato {
  titolo: string
  descrizione: string
  descrizioneBreve?: string
  comuneSlug: string          // slug del geo_nodo (comune) — es. "marsala"
  dataInizio: string          // "YYYY-MM-DD"
  oraInizio?: string          // "HH:MM", default 20:00 se assente
  dataFine?: string           // "YYYY-MM-DD", opzionale
  oraFine?: string
  luogoNome?: string
  indirizzo?: string
  gratuito?: boolean
  prezzoMin?: number
  prezzoMax?: number
  sitoUfficiale?: string
  urlBiglietti?: string
  categorieSlugs?: string[]
  fonteRicerca: string        // URL della pagina da cui è stata trovata l'informazione — obbligatorio
}

function slugify(testo: string): string {
  return testo
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

// Offset di Roma per la data indicata (gestisce ora legale/solare) — stessa logica di pubblica.ts
function isoRoma(data: string, ora: string): string {
  const probe = new Date(`${data}T12:00:00Z`)
  const parti = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Rome',
    timeZoneName: 'longOffset',
  }).formatToParts(probe)
  const offset = parti.find(p => p.type === 'timeZoneName')?.value.replace('GMT', '') || '+01:00'
  return `${data}T${ora}:00${offset}`
}

interface EsitoCandidato {
  titolo: string
  ok: boolean
  slug?: string
  errore?: string
}

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

  // ── Organizzatore tecnico: deve esistere già (creato manualmente in precedenza) ──
  const { data: org, error: errOrg } = await sb
    .from('organizzatori').select('id').eq('slug', 'ricerca-automatica-moesco').maybeSingle()
  if (errOrg || !org) {
    return NextResponse.json({ ok: false, errore: 'Organizzatore "ricerca-automatica-moesco" non trovato. Crearlo prima di usare questo endpoint.' }, { status: 500 })
  }

  const risultati: EsitoCandidato[] = []
  let almenoUnoOk = false

  for (const c of candidati) {
    try {
      if (!c.titolo || !c.descrizione || !c.comuneSlug || !c.dataInizio || !c.fonteRicerca) {
        risultati.push({ titolo: c.titolo || '(senza titolo)', ok: false, errore: 'Campi obbligatori mancanti (titolo, descrizione, comuneSlug, dataInizio, fonteRicerca).' })
        continue
      }

      // ── Risoluzione comune → geo_nodo_id ──
      const { data: comune } = await sb
        .from('geo_nodi').select('id').eq('slug', c.comuneSlug).eq('tipo', 'comune').maybeSingle()
      if (!comune) {
        risultati.push({ titolo: c.titolo, ok: false, errore: `Comune con slug "${c.comuneSlug}" non trovato.` })
        continue
      }

      const oraInizio = c.oraInizio || '20:00'
      let slugEvento = `${slugify(c.titolo)}-${new Date(c.dataInizio).getFullYear()}`

      const inserisciEvento = async (slug: string) =>
        sb.from('eventi').insert({
          organizzatore_id: org.id,
          geo_nodo_id: comune.id,
          titolo: c.titolo,
          slug,
          descrizione: c.descrizione,
          descrizione_breve: c.descrizioneBreve?.trim() || c.descrizione.slice(0, 280),
          immagine_copertina: null,
          luogo_nome: c.luogoNome || null,
          indirizzo: c.indirizzo || null,
          data_inizio: isoRoma(c.dataInizio, oraInizio),
          data_fine: c.dataFine ? isoRoma(c.dataFine, c.oraFine || '23:59') : null,
          gratuito: c.gratuito ?? false,
          prezzo_min: !c.gratuito && c.prezzoMin != null ? c.prezzoMin : null,
          prezzo_max: !c.gratuito && c.prezzoMax != null ? c.prezzoMax : null,
          url_biglietti: c.urlBiglietti || null,
          sito_ufficiale: c.sitoUfficiale || null,
          fonte_ricerca: c.fonteRicerca,
          stato: 'in_revisione',
          pubblicato_il: null,
        }).select('id, slug').single()

      let { data: evento, error: errEvento } = await inserisciEvento(slugEvento)
      if (errEvento?.code === '23505') {
        slugEvento = `${slugEvento}-${Date.now().toString(36)}`
        ;({ data: evento, error: errEvento } = await inserisciEvento(slugEvento))
      }
      if (errEvento || !evento) {
        risultati.push({ titolo: c.titolo, ok: false, errore: `Errore inserimento: ${errEvento?.message || 'sconosciuto'}` })
        continue
      }

      // ── Categorie (facoltative) ──
      if (c.categorieSlugs?.length) {
        const { data: cats } = await sb.from('categorie').select('id').in('slug', c.categorieSlugs)
        if (cats?.length) {
          await sb.from('eventi_categorie').insert(cats.map(cat => ({ evento_id: evento.id, categoria_id: cat.id })))
        }
      }

      risultati.push({ titolo: c.titolo, ok: true, slug: evento.slug })
      almenoUnoOk = true
    } catch (e) {
      risultati.push({ titolo: c.titolo || '(senza titolo)', ok: false, errore: e instanceof Error ? e.message : 'Errore imprevisto.' })
    }
  }

  if (almenoUnoOk) {
    revalidatePath('/admin/eventi')
    revalidatePath('/admin')
  }

  return NextResponse.json({ ok: true, risultati })
}
