import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Categoria } from '@/types'
import type { Database } from '@/lib/supabase/types'

function createClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

type CategoriaDB = Database['public']['Tables']['categorie']['Row']

function mapCategoria(row: CategoriaDB): Categoria {
  return {
    id: row.id,
    nome: row.nome,
    slug: row.slug,
    icona: row.icona ?? '',
    colore: row.colore ?? '#6366F1',
    ordinamento: row.ordinamento,
  }
}

export async function getCategorie(): Promise<Categoria[]> {
  const sb = createClient()
  const { data, error } = await sb
    .from('categorie')
    .select('*')
    .eq('attiva', true)
    .order('ordinamento')
  if (error) { console.error('getCategorie:', error); return [] }
  return (data ?? []).map(mapCategoria)
}
