export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'
import { formatData, formatOra } from '@/lib/utils'

const STATI = [
  { key: 'tutti',        label: 'Tutti' },
  { key: 'in_revisione', label: 'In revisione' },
  { key: 'approvato',    label: 'Approvati' },
  { key: 'rifiutato',    label: 'Rifiutati' },
  { key: 'sospeso',      label: 'Sospesi' },
]

const BADGE: Record<string, string> = {
  approvato:    'bg-green-100 text-green-700',
  in_revisione: 'bg-amber-100 text-amber-700',
  rifiutato:    'bg-red-100 text-red-700',
  sospeso:      'bg-orange-100 text-orange-700',
  bozza:        'bg-gray-100 text-gray-600',
  scaduto:      'bg-gray-100 text-gray-400',
}

const LABEL: Record<string, string> = {
  approvato:    'Approvato',
  in_revisione: 'In revisione',
  rifiutato:    'Rifiutato',
  sospeso:      'Sospeso',
  bozza:        'Bozza',
  scaduto:      'Scaduto',
}

interface RigaEvento {
  id: string
  slug: string
  titolo: string
  stato: string
  data_inizio: string
  created_at: string
  geo_nodi: { nome: string } | null
  organizzatori: { nome: string } | null
}

export default async function AdminEventiPage({
  searchParams,
}: {
  searchParams: Promise<{ stato?: string }>
}) {
  const { stato } = await searchParams
  const filtro = stato && STATI.some(s => s.key === stato) ? stato : 'tutti'

  const sb = await createAdminClient()
  const { data, error } = await sb
    .from('eventi')
    .select('id, slug, titolo, stato, data_inizio, created_at, geo_nodi(nome), organizzatori(nome)')
    .order('created_at', { ascending: false })
    .limit(300)

  if (error) console.error('AdminEventiPage:', error)
  const eventi = (data ?? []) as unknown as RigaEvento[]

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

      {/* Lista */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filtrati.length === 0 ? (
          <div className="px-5 py-12 text-center text-gray-400 text-sm">Nessun evento in questa categoria.</div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {filtrati.map(e => (
              <li key={e.id}>
                <Link href={`/admin/eventi/${e.slug}`} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">{e.titolo}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {e.geo_nodi?.nome ?? '—'} · {formatData(e.data_inizio)} {formatOra(e.data_inizio)}
                      {e.organizzatori?.nome ? ` · da: ${e.organizzatori.nome}` : ''}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${BADGE[e.stato] ?? 'bg-gray-100 text-gray-600'}`}>
                    {LABEL[e.stato] ?? e.stato}
                  </span>
                  <span className="text-xs text-amber-600 font-semibold shrink-0">
                    {e.stato === 'in_revisione' ? 'Revisiona →' : 'Dettaglio →'}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
