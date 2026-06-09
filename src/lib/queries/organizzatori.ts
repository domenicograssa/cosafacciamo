import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database, StatoOrg } from '@/lib/supabase/types'

function createClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

type OrganizzatoreDB = Database['public']['Tables']['organizzatori']['Row']

export async function getOrganizzatori(stato?: StatoOrg | 'tutti'): Promise<OrganizzatoreDB[]> {
  const sb = createClient()
  let query = sb.from('organizzatori').select('*').order('created_at', { ascending: false })
  if (stato && stato !== 'tutti') query = query.eq('stato', stato)
  const { data, error } = await query
  if (error) { console.error('getOrganizzatori:', error); return [] }
  return data ?? []
}

export async function getOrganizzatoreById(id: string): Promise<OrganizzatoreDB | null> {
  const sb = createClient()
  const { data, error } = await sb.from('organizzatori').select('*').eq('id', id).single()
  if (error || !data) return null
  return data
}
