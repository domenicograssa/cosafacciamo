import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Evento } from '@/types'
import type { EventoConRelazioni } from '@/lib/supabase/types'

// Client plain senza cookie — funziona sia in SSR che in static generation
function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Mappa da riga DB → tipo frontend
function mapEvento(row: EventoConRelazioni): Evento {
  return {
    id: row.id,
    titolo: row.titolo,
    slug: row.slug,
    descrizioneBreve: row.descrizione_breve,
    descrizione: (row as Record<string, unknown>).descrizione as string | null ?? null,
    immagineCopertura: row.immagine_copertina,
    // Mostra solo immagini caricate dagli organizzatori sul nostro storage
    // (diritti dichiarati in fase di pubblicazione) — mai URL esterni non verificati
    mediaAssetUrl: row.immagine_copertina?.includes('/storage/v1/object/public/eventi-immagini/')
      ? row.immagine_copertina
      : null,
    mediaAssetAlt: null,
    luogoNome: row.luogo_nome,
    indirizzo: row.indirizzo,
    lat: row.lat,
    lng: row.lng,
    dataInizio: row.data_inizio,
    dataFine: row.data_fine,
    tuttoIlGiorno: row.tutto_il_giorno,
    gratuito: row.gratuito,
    prezzoMin: row.prezzo_min,
    prezzoMax: row.prezzo_max,
    urlBiglietti: row.url_biglietti,
    sitoUfficiale: (row as Record<string, unknown>).sito_ufficiale as string | null ?? null,
    emailContatto: (row as Record<string, unknown>).email_contatto as string | null ?? null,
    telefonoContatto: (row as Record<string, unknown>).telefono_contatto as string | null ?? null,
    urlPrenotazione: (row as Record<string, unknown>).url_prenotazione as string | null ?? null,
    stato: row.stato,
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
      nome: c.nome,
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

  return (data ?? []).map(r => mapEvento(flattenCategorie(r as Record<string, unknown>)))
}

// Eventi per la homepage: prima quelli di oggi e in corso, poi i prossimi giorni
// in ordine di data; gli eventi già passati finiscono in coda (solo se c'è spazio).
export async function getEventiHome(limit = 10): Promise<Evento[]> {
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

  const risultato = (futuri ?? []).map(r => mapEvento(flattenCategorie(r as Record<string, unknown>)))

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
      risultato.push(...(passati ?? []).map(r => mapEvento(flattenCategorie(r as Record<string, unknown>))))
    }
  }

  return risultato
}

export async function getEventoBySlug(slug: string): Promise<Evento | null> {
  const sb = createClient()

  const { data, error } = await sb
    .from('eventi')
    .select(EVENTO_SELECT)
    .eq('slug', slug)
    .eq('stato', 'approvato')
    .single()

  if (error || !data) return null
  return mapEvento(flattenCategorie(data as Record<string, unknown>))
}

export async function getEventiCorrelati(eventoId: string, categoriaIds: string[], limit = 4): Promise<Evento[]> {
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
  return data.map(r => mapEvento(flattenCategorie(r as Record<string, unknown>)))
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
