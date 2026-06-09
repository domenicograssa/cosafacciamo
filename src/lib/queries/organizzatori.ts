import { createClient } from '@/lib/supabase/server'
import type { Database, StatoOrg } from '@/lib/supabase/types'

type OrganizzatoreDB = Database['public']['Tables']['organizzatori']['Row']

export async function getOrganizzatori(stato?: StatoOrg | 'tutti'): Promise<OrganizzatoreDB[]> {
  const sb = await createClient()
  let query = sb.from('organizzatori').select('*').order('created_at', { ascending: false })
  if (stato && stato !== 'tutti') query = query.eq('stato', stato)
  const { data, error } = await query
  if (error) { console.error('getOrganizzatori:', error); return [] }
  return data ?? []
}

export async function getOrganizzatoreById(id: string): Promise<OrganizzatoreDB | null> {
  const sb = await createClient()
  const { data, error } = await sb.from('organizzatori').select('*').eq('id', id).single()
  if (error || !data) return null
  return data
}
