import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Evento } from '@/types'
import type { EventoConRelazioni } from '@/lib/supabase/types'
import { risolviOrarioEvento } from '@/lib/utils'
import type { Lang } from '@/lib/i18n/strings'

// Sceglie il testo tradotto se presente e la lingua è 'en', altrimenti
// l'originale italiano (mai una stringa vuota per una traduzione mancante).
function testoLocalizzato(it: string, en: string | null | undefined, lang: Lang): string {
  return lang === 'en' && en?.trim() ? en : it
}
function testoLocalizzatoNullable(it: string | null, en: string | null | undefined, lang: Lang): string | null {
  return lang === 'en' && en?.trim() ? en : it
}

// Client plain senza cookie — funziona sia in SSR che in static generation
function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Mappa da riga DB → tipo frontend
function mapEvento(row: EventoConRelazioni, lang: Lang = 'it'): Evento {
  const r = row as Record<string, unknown>
  const oraInizio = r.ora_inizio as string | null | undefined
  const { dataInizio, dataFine } = risolviOrarioEvento(row.data_inizio, row.data_fine, oraInizio)
  return {
    id: row.id,
    titolo: testoLocalizzato(row.titolo, r.titolo_en as string | null, lang),
    slug: row.slug,
    descrizioneBreve: testoLocalizzatoNullable(row.descrizione_breve, r.descrizione_breve_en as string | null, lang),
    descrizione: testoLocalizzatoNullable((r.descrizione as string | null) ?? null, r.descrizione_en as string | null, lang),
    immagineCopertura: row.immagine_copertina,
    // Mostra solo immagini caricate dagli organizzatori sul nostro storage
    // (diritti dichiarati in fase di pubblicazione) oppure immagini redazionali
    // verificate e committate in public/eventi/ — mai URL esterni non verificati
    mediaAssetUrl:
      row.immagine_copertina?.includes('/storage/v1/object/public/eventi-immagini/') ||
      row.immagine_copertina?.startsWith('/eventi/')
        ? row.immagine_copertina
        : null,
    mediaAssetAlt: null,
    luogoNome: testoLocalizzatoNullable(row.luogo_nome, r.luogo_nome_en as string | null, lang),
    indirizzo: row.indirizzo,
    lat: row.lat,
    lng: row.lng,
    dataInizio,
    dataFine,
    tuttoIlGiorno: row.tutto_il_giorno,
    gratuito: row.gratuito,
    prezzoMin: row.prezzo_min,
    prezzoMax: row.prezzo_max,
    prezzoTesto: (row as Record<string, unknown>).prezzo as string | null ?? null,
    urlBiglietti: row.url_biglietti,
    sitoUfficiale: (row as Record<string, unknown>).sito_ufficiale as string | null ?? null,
    emailContatto: (row as Record<string, unknown>).email_contatto as string | null ?? null,
    telefonoContatto: (row as Record<string, unknown>).telefono_contatto as string | null ?? null,
    urlPrenotazione: (row as Record<string, unknown>).url_prenotazione as string | null ?? null,
    stato: row.stato,
    // Valorizzato solo sugli eventi individuati dalla procedura di ricerca
    // automatica: serve a dichiarare pubblicamente la fonte dell'informazione
    // (trasparenza sui contenuti di origine automatizzata).
    fonteRicerca: (row as Record<string, unknown>).fonte_ricerca as string | null ?? null,
    inEvidenza: (row as Record<string, unknown>).in_evidenza as boolean ?? false,
    testoArticolo: (row as Record<string, unknown>).testo_articolo as string | null ?? null,
    geoNodo: {
      id: row.geo_nodi.id,
      parentId: row.geo_nodi.parent_id,
      tipo: row.geo_nodi.tipo,
      nome: row.geo_nodi.nome,
      slug: row.geo_nodi.slug,
      path: row.geo_nodi.path,
    },
    categorie: row.categorie.map(c => ({
      id: c.id,
      nome: testoLocalizzato(c.nome, (c as unknown as Record<string, unknown>).nome_en as string | null, lang),
      slug: c.slug,
      icona: c.icona ?? '',
      colore: c.colore ?? '#6366F1',
      ordinamento: c.ordinamento,
    })),
    organizzatore: {
      id: row.organizzatori.id,
      nome: row.organizzatori.nome,
      slug: row.organizzatori.slug,
      logoUrl: row.organizzatori.logo_url,
    },
  }
}

const EVENTO_SELECT = `
  *,
  geo_nodi(*),
  organizzatori(id, nome, slug, logo_url),
  categorie:eventi_categorie(categorie(*))
`

// Semplifica la struttura annidata eventi_categorie → categorie
function flattenCategorie(row: Record<string, unknown>): EventoConRelazioni {
  return {
    ...row,
    categorie: (row.categorie as Array<{ categorie: unknown }>)?.map(ec => ec.categorie) ?? [],
  } as EventoConRelazioni
}

// ─── Query pubbliche ────────────────────────────────────────────────────────

export async function getEventiApprovati(opzioni?: {
  geoPath?: string       // filtra per path LIKE '/sicilia/trapani/alcamo/%'
  categoriaSlug?: string
  soloGratuiti?: boolean
  data?: string          // 'YYYY-MM-DD'
  limit?: number
  includiPassati?: boolean // default false
  lang?: Lang
}): Promise<Evento[]> {
  const sb = createClient()

  // Inizio della giornata corrente (Europe/Rome → UTC offset gestito lato DB)
  const oggi = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Rome' })
  const inizioOggi = `${oggi}T00:00:00`

  let query = sb
    .from('eventi')
    .select(EVENTO_SELECT)
    .eq('stato', 'approvato')
    .order('data_inizio', { ascending: true })

  // Escludi eventi già conclusi, salvo richiesta esplicita
  if (!opzioni?.includiPassati) {
    // Mostra se: data_fine >= oggi  OPPURE  (data_fine null E data_inizio >= oggi)
    query = query.or(`data_fine.gte.${inizioOggi},and(data_fine.is.null,data_inizio.gte.${inizioOggi})`)
  }

  if (opzioni?.geoPath) {
    // Ottieni prima tutti gli id dei nodi sotto quel path
    const { data: nodi } = await sb
      .from('geo_nodi')
      .select('id')
      .like('path', `${opzioni.geoPath}%`)
    const ids = nodi?.map(n => n.id) ?? []
    if (ids.length) query = query.in('geo_nodo_id', ids)
  }

  if (opzioni?.soloGratuiti) query = query.eq('gratuito', true)

  if (opzioni?.data) {
    const inizioGiorno = `${opzioni.data}T00:00:00`
    const fineGiorno   = `${opzioni.data}T23:59:59`
    query = query.gte('data_inizio', inizioGiorno).lte('data_inizio', fineGiorno)
  }

  if (opzioni?.limit) query = query.limit(opzioni.limit)

  const { data, error } = await query
  if (error) { console.error('getEventiApprovati:', error); return [] }

  const lang = opzioni?.lang ?? 'it'
  return (data ?? []).map(r => mapEvento(flattenCategorie(r as Record<string, unknown>), lang))
}

// Eventi per la homepage: prima quelli di oggi e in corso, poi i prossimi giorni
// in ordine di data; gli eventi già passati finiscono in coda (solo se c'è spazio).
export async function getEventiHome(limit = 10, lang: Lang = 'it'): Promise<Evento[]> {
  const sb = createClient()

  // Inizio della giornata corrente in Europe/Rome (il server gira in UTC)
  const oggi = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Rome' }) // YYYY-MM-DD
  const inizioOggi = `${oggi}T00:00:00`

  // 1) Eventi non ancora conclusi: iniziano oggi o in futuro, oppure sono in corso
  //    (data_fine non ancora passata). Ordinati dal più vicino nel tempo.
  const { data: futuri, error: errFuturi } = await sb
    .from('eventi')
    .select(EVENTO_SELECT)
    .eq('stato', 'approvato')
    .or(`data_inizio.gte.${inizioOggi},data_fine.gte.${inizioOggi}`)
    .order('data_inizio', { ascending: true })
    .limit(limit)

  if (errFuturi) { console.error('getEventiHome (futuri):', errFuturi); return [] }

  const risultato = (futuri ?? []).map(r => mapEvento(flattenCategorie(r as Record<string, unknown>), lang))

  // Ordina: 1) eventi che iniziano oggi, 2) eventi in corso (iniziati prima ma non
  // ancora finiti, es. mostre — quelli che finiscono prima in cima), 3) prossimi giorni
  const gruppo = (e: Evento) => {
    const giorno = new Date(e.dataInizio).toLocaleDateString('sv-SE', { timeZone: 'Europe/Rome' })
    if (giorno === oggi) return 0
    if (giorno < oggi) return 1
    return 2
  }
  risultato.sort((a, b) => {
    const ga = gruppo(a), gb = gruppo(b)
    if (ga !== gb) return ga - gb
    if (ga === 1) return new Date(a.dataFine ?? a.dataInizio).getTime() - new Date(b.dataFine ?? b.dataInizio).getTime()
    return new Date(a.dataInizio).getTime() - new Date(b.dataInizio).getTime()
  })

  // 2) Se resta spazio, accoda gli eventi passati (i più recenti per primi)
  const spazio = limit - risultato.length
  if (spazio > 0) {
    const { data: passati, error: errPassati } = await sb
      .from('eventi')
      .select(EVENTO_SELECT)
      .eq('stato', 'approvato')
      .lt('data_inizio', inizioOggi)
      .or(`data_fine.lt.${inizioOggi},data_fine.is.null`)
      .order('data_inizio', { ascending: false })
      .limit(spazio)

    if (errPassati) {
      console.error('getEventiHome (passati):', errPassati)
    } else {
      risultato.push(...(passati ?? []).map(r => mapEvento(flattenCategorie(r as Record<string, unknown>), lang)))
    }
  }

  return risultato
}

// Eventi "in primo piano" per la sezione articoli della homepage: fino a 3 eventi.
// Priorità agli eventi marcati manualmente `in_evidenza` in admin (ordinati per
// data più vicina); gli slot restanti vengono riempiti in automatico con i
// prossimi eventi approvati in ordine di data, così la selezione ruota da sola
// settimana dopo settimana man mano che gli eventi passano.
//
// Ogni volta che un evento viene messo in evidenza (da admin) riceve anche una
// scadenza automatica a 2 giorni (`in_evidenza_scade_il`, vedi app/actions/admin.ts).
// Qui filtriamo via i pin scaduti: tornano così ad essere trattati come eventi
// normali e il posto libero viene rioccupato dal riempimento automatico —
// questo garantisce che la vetrina "in primo piano" cambi almeno ogni 2 giorni
// anche senza intervento manuale, pur restando modificabile a mano in ogni momento.
export async function getEventiInEvidenza(limit = 3, lang: Lang = 'it'): Promise<Evento[]> {
  const sb = createClient()

  const oggi = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Rome' })
  const inizioOggi = `${oggi}T00:00:00`
  const adesso = new Date().toISOString()

  const { data: pinnati, error: errPinnati } = await sb
    .from('eventi')
    .select(EVENTO_SELECT)
    .eq('stato', 'approvato')
    .eq('in_evidenza', true)
    .or(`in_evidenza_scade_il.is.null,in_evidenza_scade_il.gt.${adesso}`)
    .or(`data_inizio.gte.${inizioOggi},data_fine.gte.${inizioOggi}`)
    .order('data_inizio', { ascending: true })
    .limit(limit)

  if (errPinnati) { console.error('getEventiInEvidenza (pinnati):', errPinnati); return [] }

  const risultato = (pinnati ?? []).map(r => mapEvento(flattenCategorie(r as Record<string, unknown>), lang))

  const spazio = limit - risultato.length
  if (spazio > 0) {
    const idsEsclusi = risultato.map(e => e.id)
    // Solo eventi non ancora iniziati, ordinati per data più vicina: il
    // riempimento automatico deve mostrare ciò che sta per succedere, non
    // eventi/mostre partiti mesi fa che restano "aperti" (data_fine lontana)
    // e che altrimenti scavalcherebbero in ordinamento i prossimi eventi
    // veri e propri (data_inizio più vecchia = ordinati per primi).
    const queryAuto = sb
      .from('eventi')
      .select(EVENTO_SELECT)
      .eq('stato', 'approvato')
      .gte('data_inizio', inizioOggi)
      .order('data_inizio', { ascending: true })
      // Si pesca più largo del necessario: fra i candidati si sceglie poi in
      // base alla ricchezza del testo (vedi sotto).
      .limit(spazio + idsEsclusi.length + 25)

    const { data: auto, error: errAuto } = await queryAuto
    if (errAuto) {
      console.error('getEventiInEvidenza (auto):', errAuto)
    } else {
      const candidati = (auto ?? [])
        .map(r => mapEvento(flattenCategorie(r as Record<string, unknown>), lang))
        .filter(e => !idsEsclusi.includes(e.id))

      // "In primo piano" è una vetrina redazionale: la card mostra un estratto
      // di quattro righe, quindi un evento con due frasi ci fa una figura
      // magra. Prima venivano presi i primi tre per data, qualunque testo
      // avessero; ora si privilegiano quelli con una descrizione sostanziosa,
      // restando comunque fra gli eventi imminenti.
      const testoDi = (e: Evento) => (e.testoArticolo?.trim() || e.descrizione?.trim() || '')
      const SOGLIA_TESTO = 260   // circa quattro righe piene nella card

      const raccontabili = candidati.filter(e => testoDi(e).length >= SOGLIA_TESTO)
      const scarni = candidati.filter(e => testoDi(e).length < SOGLIA_TESTO)

      // Se gli eventi ben descritti non bastano a riempire la vetrina si
      // completa con gli altri, i più corposi per primi: meglio una card
      // scarna che uno spazio vuoto.
      scarni.sort((a, b) => testoDi(b).length - testoDi(a).length)

      risultato.push(...[...raccontabili, ...scarni].slice(0, spazio))
    }
  }

  return risultato
}

export async function getEventoBySlug(slug: string, lang: Lang = 'it'): Promise<Evento | null> {
  const sb = createClient()

  const { data, error } = await sb
    .from('eventi')
    .select(EVENTO_SELECT)
    .eq('slug', slug)
    .eq('stato', 'approvato')
    .single()

  if (error || !data) return null
  return mapEvento(flattenCategorie(data as Record<string, unknown>), lang)
}

/**
 * Cerca un evento fra i suoi indirizzi passati.
 * Serve quando un evento viene rinominato in admin: lo slug si aggiorna per
 * rispecchiare il nuovo titolo, ma i link già condivisi (post Facebook,
 * messaggi, risultati Google) puntano ancora a quello vecchio. Invece di un
 * 404, la pagina risponde con un redirect permanente al nuovo indirizzo.
 * Restituisce solo lo slug attuale: alla pagina serve unicamente sapere dove
 * mandare l'utente.
 */
export async function getSlugAttualeDaSlugStorico(slug: string): Promise<string | null> {
  const sb = createClient()

  const { data, error } = await sb
    .from('eventi')
    .select('slug')
    .contains('slug_precedenti', [slug])
    .eq('stato', 'approvato')
    .limit(1)
    .maybeSingle()

  if (error || !data) return null
  return (data as { slug: string }).slug
}

export async function getEventiCorrelati(eventoId: string, categoriaIds: string[], limit = 4, lang: Lang = 'it'): Promise<Evento[]> {
  const sb = createClient()

  const { data: eventiIds } = await sb
    .from('eventi_categorie')
    .select('evento_id')
    .in('categoria_id', categoriaIds)
    .neq('evento_id', eventoId)
    .limit(limit * 2)

  if (!eventiIds?.length) return []
  const ids = [...new Set(eventiIds.map(e => e.evento_id))].slice(0, limit)

  const { data, error } = await sb
    .from('eventi')
    .select(EVENTO_SELECT)
    .in('id', ids)
    .eq('stato', 'approvato')

  if (error || !data) return []
  return data.map(r => mapEvento(flattenCategorie(r as Record<string, unknown>), lang))
}

// ─── Query admin ────────────────────────────────────────────────────────────

export async function getEventiAdmin(stato?: string): Promise<EventoConRelazioni[]> {
  const sb = createClient()

  let query = sb
    .from('eventi')
    .select(EVENTO_SELECT)
    .order('created_at', { ascending: false })

  if (stato && stato !== 'tutti') query = query.eq('stato', stato)

  const { data, error } = await query
  if (error) { console.error('getEventiAdmin:', error); return [] }

  return (data ?? []).map(r => flattenCategorie(r as Record<string, unknown>))
}

export async function getEventoAdminBySlug(slug: string): Promise<EventoConRelazioni | null> {
  const sb = createClient()

  const { data, error } = await sb
    .from('eventi')
    .select(EVENTO_SELECT)
    .eq('slug', slug)
    .single()

  if (error || !data) return null
  return flattenCategorie(data as Record<string, unknown>)
}
