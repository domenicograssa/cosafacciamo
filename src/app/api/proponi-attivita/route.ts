import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import { richiestaAutorizzata } from '@/lib/api-auth'

export const dynamic = 'force-dynamic'

// Endpoint gemello di /api/proponi-eventi (vedi quel file per il contesto
// generale), ma per la tabella 'attivita': esperienze concrete, verificabili
// e organizzate (corsi, laboratori ricorrenti, escursioni con un vero
// operatore) — non i consigli turistici "senza tempo" già presenti nel
// catalogo editoriale seedato a parte. Ogni candidato richiede una fonte
// (fonte_url) e viene inserito SEMPRE con stato 'bozza' (mai pubblicato
// direttamente) sotto l'organizzatore tecnico 'ricerca-automatica-moesco',
// da rivedere e pubblicare a mano in /admin/attivita.
// Auth: stessa di /api/proponi-eventi — vedi src/lib/api-auth.ts.

interface AttivitaCandidata {
  titolo: string
  descrizione: string
  descrizioneBreve?: string
  comuneSlug: string          // slug del geo_nodo (comune) — es. "san-vito-lo-capo"
  quando: string              // testo libero: "dal 27 agosto al 17 settembre 2026", "tutti i sabati", ecc. — obbligatorio
  durata?: string             // es. "2 ore", "mezza giornata"
  livello?: 'facile' | 'medio' | 'esperto'
  target?: string             // es. "Famiglie", "Adulti"
  gratuito?: boolean
  prezzoMin?: number
  prezzoMax?: number
  sitoUfficiale?: string
  urlPrenotazione?: string
  emailContatto?: string
  telefonoContatto?: string
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

  let body: { attivita?: AttivitaCandidata[] }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, errore: 'JSON non valido.' }, { status: 400 })
  }

  const candidati = body.attivita
  if (!Array.isArray(candidati) || candidati.length === 0) {
    return NextResponse.json({ ok: false, errore: 'Nessuna attività fornita (campo "attivita" mancante o vuoto).' }, { status: 400 })
  }

  const sb = await createAdminClient()

  // ── Organizzatore tecnico: lo stesso già usato per gli eventi automatici ──
  const { data: org, error: errOrg } = await sb
    .from('organizzatori').select('id').eq('slug', 'ricerca-automatica-moesco').maybeSingle()
  if (errOrg || !org) {
    return NextResponse.json({ ok: false, errore: 'Organizzatore "ricerca-automatica-moesco" non trovato. Crearlo prima di usare questo endpoint.' }, { status: 500 })
  }

  const risultati: EsitoCandidato[] = []
  let almenoUnoOk = false

  for (const c of candidati) {
    try {
      if (!c.titolo || !c.descrizione || !c.comuneSlug || !c.quando || !c.fonteRicerca) {
        risultati.push({ titolo: c.titolo || '(senza titolo)', ok: false, errore: 'Campi obbligatori mancanti (titolo, descrizione, comuneSlug, quando, fonteRicerca).' })
        continue
      }

      // ── Risoluzione comune → geo_nodo_id ──
      const { data: comune } = await sb
        .from('geo_nodi').select('id').eq('slug', c.comuneSlug).eq('tipo', 'comune').maybeSingle()
      if (!comune) {
        risultati.push({ titolo: c.titolo, ok: false, errore: `Comune con slug "${c.comuneSlug}" non trovato.` })
        continue
      }

      let slugAtt = slugify(c.titolo)

      const inserisciAttivita = async (slug: string) =>
        sb.from('attivita').insert({
          organizzatore_id: org.id,
          geo_nodo_id: comune.id,
          titolo: c.titolo,
          slug,
          descrizione: c.descrizione,
          descrizione_breve: c.descrizioneBreve?.trim() || c.descrizione.slice(0, 280),
          immagine_copertina: null,
          quando: c.quando,
          durata: c.durata || null,
          livello: c.livello || null,
          target: c.target || null,
          gratuito: c.gratuito ?? false,
          prezzo_min: !c.gratuito && c.prezzoMin != null ? c.prezzoMin : null,
          prezzo_max: !c.gratuito && c.prezzoMax != null ? c.prezzoMax : null,
          sito_ufficiale: c.sitoUfficiale || null,
          url_prenotazione: c.urlPrenotazione || null,
          email_contatto: c.emailContatto || null,
          telefono_contatto: c.telefonoContatto || null,
          fonte_url: c.fonteRicerca,
          stato: 'bozza',
        }).select('id, slug').single()

      let { data: attivita, error: errAttivita } = await inserisciAttivita(slugAtt)
      if (errAttivita?.code === '23505') {
        slugAtt = `${slugAtt}-${Date.now().toString(36)}`
        ;({ data: attivita, error: errAttivita } = await inserisciAttivita(slugAtt))
      }
      if (errAttivita || !attivita) {
        risultati.push({ titolo: c.titolo, ok: false, errore: `Errore inserimento: ${errAttivita?.message || 'sconosciuto'}` })
        continue
      }

      // ── Categorie (facoltative) ──
      if (c.categorieSlugs?.length) {
        const { data: cats } = await sb.from('categorie').select('id').in('slug', c.categorieSlugs)
        if (cats?.length) {
          await sb.from('attivita_categorie').insert(cats.map(cat => ({ attivita_id: attivita.id, categoria_id: cat.id })))
        }
      }

      risultati.push({ titolo: c.titolo, ok: true, slug: attivita.slug })
      almenoUnoOk = true
    } catch (e) {
      risultati.push({ titolo: c.titolo || '(senza titolo)', ok: false, errore: e instanceof Error ? e.message : 'Errore imprevisto.' })
    }
  }

  if (almenoUnoOk) {
    revalidatePath('/admin/attivita')
    revalidatePath('/admin')
  }

  return NextResponse.json({ ok: true, risultati })
}
