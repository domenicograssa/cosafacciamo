export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'
import { getComuni } from '@/lib/queries/geo'
import { getCategorie } from '@/lib/queries/categorie'
import FiltriEventiAdmin, { type RigaEventoAdmin } from '@/components/admin/FiltriEventiAdmin'

const STATI = [
  { key: 'tutti',        label: 'Tutti' },
  { key: 'in_revisione', label: 'In revisione' },
  { key: 'approvato',    label: 'Approvati' },
  { key: 'rifiutato',    label: 'Rifiutati' },
  { key: 'sospeso',      label: 'Sospesi' },
]

export default async function AdminEventiPage({
  searchParams,
}: {
  searchParams: Promise<{ stato?: string }>
}) {
  const { stato } = await searchParams
  const filtro = stato && STATI.some(s => s.key === stato) ? stato : 'tutti'

  const sb = await createAdminClient()
  const [{ data, error }, comuni, categorie] = await Promise.all([
    sb
      .from('eventi')
      .select('id, slug, titolo, stato, data_inizio, created_at, geo_nodi(nome, slug), organizzatori(nome), categorie:eventi_categorie(categorie(nome, slug))')
      .order('created_at', { ascending: false })
      .limit(300),
    getComuni(),
    getCategorie(),
  ])

  if (error) console.error('AdminEventiPage:', error)

  // Appiattisce eventi_categorie → categorie e normalizza le relazioni singole
  const eventi = ((data ?? []) as unknown as Array<Record<string, unknown>>).map(row => ({
    ...row,
    geo_nodi: row.geo_nodi ?? null,
    organizzatori: row.organizzatori ?? null,
    categorie: ((row.categorie as Array<{ categorie: { nome: string; slug: string } }>) ?? [])
      .map(ec => ec.categorie)
      .filter(Boolean),
  })) as unknown as RigaEventoAdmin[]

  const filtrati = filtro === 'tutti' ? eventi : eventi.filter(e => e.stato === filtro)
  const count = (s: string) => s === 'tutti' ? eventi.length : eventi.filter(e => e.stato === s).length

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-gray-900">Gestione eventi</h1>

      {/* Tab stati */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATI.map(s => (
          <Link
            key={s.key}
            href={s.key === 'tutti' ? '/admin/eventi' : `/admin/eventi?stato=${s.key}`}
            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              filtro === s.key ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s.label} <span className="opacity-60">({count(s.key)})</span>
          </Link>
        ))}
      </div>

      {/* Ricerca + filtri città/categoria + lista */}
      <FiltriEventiAdmin
        eventi={filtrati}
        comuni={comuni.map(c => ({ nome: c.nome, slug: c.slug }))}
        categorie={categorie.map(c => ({ nome: c.nome, slug: c.slug }))}
      />
    </div>
  )
}
