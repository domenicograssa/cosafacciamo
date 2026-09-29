import type { createAdminClient } from '@/lib/supabase/server'

// Logica condivisa di inserimento degli eventi proposti dalla ricerca
// automatica. Usata da:
//  - /api/proponi-eventi       (POST esterno, con segreto condiviso)
//  - /api/cron/ricerca-eventi  (cron di Vercel che cerca gli eventi con Claude)
// Gli eventi finiscono SEMPRE con stato 'in_revisione' sotto l'organizzatore
// tecnico 'ricerca-automatica-moesco', con la fonte salvata in fonte_ricerca.

type AdminClient = Awaited<ReturnType<typeof createAdminClient>>

export interface EventoCandidato {
  titolo: string
  descrizione: string
  descrizioneBreve?: string
  comuneSlug: string          // slug del geo_nodo (comune), es. "marsala"
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
  fonteRicerca: string        // URL della pagina da cui è stata presa l'informazione (obbligatorio)
}

export interface EsitoCandidato {
  titolo: string
  ok: boolean
  slug?: string
  errore?: string
}

export function slugify(testo: string): string {
  return testo
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

// Offset di Roma per la data indicata (gestisce ora legale/solare), stessa logica di pubblica.ts
export function isoRoma(data: string, ora: string): string {
  const probe = new Date(`${data}T12:00:00Z`)
  const parti = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Rome',
    timeZoneName: 'longOffset',
  }).formatToParts(probe)
  const offset = parti.find(p => p.type === 'timeZoneName')?.value.replace('GMT', '') || '+01:00'
  return `${data}T${ora}:00${offset}`
}

/**
 * Inserisce i candidati in coda di revisione.
 * Lancia un errore solo se manca l'organizzatore tecnico; gli errori sui
 * singoli eventi finiscono nell'esito di ciascuno.
 */
export async function inserisciCandidati(
  sb: AdminClient,
  candidati: EventoCandidato[],
): Promise<{ risultati: EsitoCandidato[]; almenoUnoOk: boolean }> {
  const { data: orgRaw, error: errOrg } = await sb
    .from('organizzatori').select('id').eq('slug', 'ricerca-automatica-moesco').maybeSingle()
  const org = orgRaw as { id: string } | null
  if (errOrg || !org) {
    throw new Error('Organizzatore "ricerca-automatica-moesco" non trovato. Crearlo prima di usare questo endpoint.')
  }

  const risultati: EsitoCandidato[] = []
  let almenoUnoOk = false

  for (const c of candidati) {
    try {
      if (!c.titolo || !c.descrizione || !c.comuneSlug || !c.dataInizio || !c.fonteRicerca) {
        risultati.push({ titolo: c.titolo || '(senza titolo)', ok: false, errore: 'Campi obbligatori mancanti (titolo, descrizione, comuneSlug, dataInizio, fonteRicerca).' })
        continue
      }

      // ── Risoluzione comune → geo_nodo_id (sempre tipo=comune: "trapani" esiste anche come provincia) ──
      const { data: comuneRaw } = await sb
        .from('geo_nodi').select('id').eq('slug', c.comuneSlug).eq('tipo', 'comune').maybeSingle()
      const comune = comuneRaw as { id: string } | null
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
        } as never).select('id, slug').single()

      let { data: evento, error: errEvento } = await inserisciEvento(slugEvento)
      if (errEvento?.code === '23505') {
        slugEvento = `${slugEvento}-${Date.now().toString(36)}`
        ;({ data: evento, error: errEvento } = await inserisciEvento(slugEvento))
      }
      if (errEvento || !evento) {
        risultati.push({ titolo: c.titolo, ok: false, errore: `Errore inserimento: ${errEvento?.message || 'sconosciuto'}` })
        continue
      }
      const ev = evento as { id: string; slug: string }

      // ── Categorie (facoltative) ──
      if (c.categorieSlugs?.length) {
        const { data: cats } = await sb.from('categorie').select('id').in('slug', c.categorieSlugs)
        if (cats?.length) {
          await sb.from('eventi_categorie').insert((cats as Array<{ id: string }>).map(cat => ({ evento_id: ev.id, categoria_id: cat.id })) as never)
        }
      }

      risultati.push({ titolo: c.titolo, ok: true, slug: ev.slug })
      almenoUnoOk = true
    } catch (e) {
      risultati.push({ titolo: c.titolo || '(senza titolo)', ok: false, errore: e instanceof Error ? e.message : 'Errore imprevisto.' })
    }
  }

  return { risultati, almenoUnoOk }
}
