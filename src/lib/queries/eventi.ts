import { createClient } from '@/lib/supabase/server'
import type { Evento } from '@/types'
import type { EventoConRelazioni } from '@/lib/supabase/types'

// Mappa da riga DB → tipo frontend
function mapEvento(row: EventoConRelazioni): Evento {
  return {
    id: row.id,
    titolo: row.titolo,
    slug: row.slug,
    descrizioneBreve: row.descrizione_breve,
    immagineCopertura: row.immagine_copertina,
    mediaAssetUrl: null,   // popolato solo quando media_assets ha immagini autorizzate
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
}): Promise<Evento[]> {
  const sb = await createClient()

  let query = sb
    .from('eventi')
    .select(EVENTO_SELECT)
    .eq('stato', 'approvato')
    .order('data_inizio', { ascending: true })

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

export async function getEventoBySlug(slug: string): Promise<Evento | null> {
  const sb = await createClient()

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
  const sb = await createClient()

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
  const sb = await createClient()

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
  const sb = await createClient()

  const { data, error } = await sb
    .from('eventi')
    .select(EVENTO_SELECT)
    .eq('slug', slug)
    .single()

  if (error || !data) return null
  return flattenCategorie(data as Record<string, unknown>)
}
