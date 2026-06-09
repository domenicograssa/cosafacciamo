import { createClient } from '@/lib/supabase/server'
import type { GeoNodo } from '@/types'
import type { Database } from '@/lib/supabase/types'

type GeoNodoDB = Database['public']['Tables']['geo_nodi']['Row']

function mapGeoNodo(row: GeoNodoDB): GeoNodo {
  return {
    id: row.id,
    parentId: row.parent_id,
    tipo: row.tipo,
    nome: row.nome,
    slug: row.slug,
    path: row.path,
  }
}

export async function getComuni(): Promise<GeoNodo[]> {
  const sb = await createClient()
  const { data, error } = await sb
    .from('geo_nodi')
    .select('*')
    .eq('tipo', 'comune')
    .eq('attivo', true)
    .order('nome')
  if (error) { console.error('getComuni:', error); return [] }
  return (data ?? []).map(mapGeoNodo)
}

export async function getGeoNodoBySlug(slug: string): Promise<GeoNodo | null> {
  const sb = await createClient()
  const { data, error } = await sb
    .from('geo_nodi')
    .select('*')
    .eq('slug', slug)
    .eq('tipo', 'comune')   // evita collisione con la provincia Trapani (stesso slug)
    .single()
  if (error || !data) return null
  return mapGeoNodo(data)
}

export async function getGeoNodiFigli(parentPath: string): Promise<GeoNodo[]> {
  const sb = await createClient()
  const { data, error } = await sb
    .from('geo_nodi')
    .select('*')
    .like('path', `${parentPath}%`)
    .neq('path', parentPath)
    .eq('attivo', true)
  if (error) { console.error('getGeoNodiFigli:', error); return [] }
  return (data ?? []).map(mapGeoNodo)
}
