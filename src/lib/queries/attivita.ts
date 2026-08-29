import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Attivita } from '@/types'
import type { AttivitaConRelazioni } from '@/lib/supabase/types'

function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

function mapAttivita(row: AttivitaConRelazioni): Attivita {
  // Colonne aggiunte alla tabella dopo la generazione di AttivitaRow (vedi
  // pubblica.ts e admin/attivita/[slug]): lette qui con lo stesso pattern
  // "cast a Record" già usato in queries/eventi.ts per fonte_ricerca ecc.
  const r = row as unknown as Record<string, unknown>
  const org = r.organizzatori as { id: string; nome: string; slug: string } | null

  return {
    id: row.id,
    titolo: row.titolo,
    slug: row.slug,
    descrizioneBreve: row.descrizione_breve,
    descrizione: row.descrizione,
    quando: row.quando,
    target: row.target,
    gratuito: row.gratuito,
    prezzoMin: (r.prezzo_min as number | null) ?? null,
    prezzoMax: (r.prezzo_max as number | null) ?? null,
    durata: row.durata,
    livello: row.livello,
    sitoUfficiale: (r.sito_ufficiale as string | null) ?? null,
    emailContatto: (r.email_contatto as string | null) ?? null,
    telefonoContatto: (r.telefono_contatto as string | null) ?? null,
    urlPrenotazione: (r.url_prenotazione as string | null) ?? null,
    fonteUrl: row.fonte_url,
    immagineCopertura: row.immagine_copertina,
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
    organizzatore: org ? { id: org.id, nome: org.nome, slug: org.slug } : null,
  }
}

const ATTIVITA_SELECT = `
  *,
  geo_nodi(*),
  organizzatori(id, nome, slug),
  categorie:attivita_categorie(categorie(*))
`

function flattenCategorie(row: Record<string, unknown>): AttivitaConRelazioni {
  return {
    ...row,
    categorie: (row.categorie as Array<{ categorie: unknown }>)?.map(ac => ac.categorie) ?? [],
  } as AttivitaConRelazioni
}

// ─── Query pubbliche ────────────────────────────────────────────────────────

export async function getAttivita(opzioni?: {
  geoNodoId?: string       // filtra per comune specifico
  geoPath?: string         // filtra per path LIKE '/sicilia/trapani/alcamo/%'
  categoriaSlug?: string
  soloGratuite?: boolean
  limit?: number
}): Promise<Attivita[]> {
  const sb = createClient()

  let query = sb
    .from('attivita')
    .select(ATTIVITA_SELECT)
    .eq('stato', 'pubblicato')
    .order('titolo', { ascending: true })

  if (opzioni?.geoNodoId) {
    query = query.eq('geo_nodo_id', opzioni.geoNodoId)
  } else if (opzioni?.geoPath) {
    const { data: nodi } = await sb
      .from('geo_nodi')
      .select('id')
      .like('path', `${opzioni.geoPath}%`)
    const ids = (nodi as Array<{ id: string }> | null)?.map(n => n.id) ?? []
    if (ids.length) query = query.in('geo_nodo_id', ids)
  }

  if (opzioni?.soloGratuite) query = query.eq('gratuito', true)
  if (opzioni?.limit) query = query.limit(opzioni.limit)

  const { data, error } = await query
  if (error) { console.error('getAttivita:', error); return [] }

  return (data ?? []).map(r => mapAttivita(flattenCategorie(r as Record<string, unknown>)))
}

export async function getAttivitaBySlug(slug: string): Promise<Attivita | null> {
  const sb = createClient()

  const { data, error } = await sb
    .from('attivita')
    .select(ATTIVITA_SELECT)
    .eq('slug', slug)
    .eq('stato', 'pubblicato')
    .single()

  if (error || !data) return null
  return mapAttivita(flattenCategorie(data as Record<string, unknown>))
}

export async function getAttivitaCorrelate(attivitaId: string, categoriaIds: string[], limit = 4): Promise<Attivita[]> {
  const sb = createClient()

  const { data: attIds } = await sb
    .from('attivita_categorie')
    .select('attivita_id')
    .in('categoria_id', categoriaIds)
    .neq('attivita_id', attivitaId)
    .limit(limit * 2)

  if (!attIds?.length) return []
  const ids = [...new Set((attIds as Array<{ attivita_id: string }>).map(a => a.attivita_id))].slice(0, limit)

  const { data, error } = await sb
    .from('attivita')
    .select(ATTIVITA_SELECT)
    .in('id', ids)
    .eq('stato', 'pubblicato')

  if (error || !data) return []
  return data.map(r => mapAttivita(flattenCategorie(r as Record<string, unknown>)))
}
