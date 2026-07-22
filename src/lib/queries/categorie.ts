import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Categoria } from '@/types'
import type { Database } from '@/lib/supabase/types'
import type { Lang } from '@/lib/i18n/strings'

function createClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

type CategoriaDB = Database['public']['Tables']['categorie']['Row']

function mapCategoria(row: CategoriaDB, lang: Lang = 'it'): Categoria {
  const nomeEn = (row as unknown as Record<string, unknown>).nome_en as string | null | undefined
  return {
    id: row.id,
    nome: lang === 'en' && nomeEn?.trim() ? nomeEn : row.nome,
    slug: row.slug,
    icona: row.icona ?? '',
    colore: row.colore ?? '#6366F1',
    ordinamento: row.ordinamento,
  }
}

export async function getCategorie(lang: Lang = 'it'): Promise<Categoria[]> {
  const sb = createClient()
  const { data, error } = await sb
    .from('categorie')
    .select('*')
    .eq('attiva', true)
    .order('ordinamento')
  if (error) { console.error('getCategorie:', error); return [] }
  return (data ?? []).map(r => mapCategoria(r, lang))
}
