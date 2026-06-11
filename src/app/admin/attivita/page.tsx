import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'
import { AzioniAttivita } from '@/components/admin/AzioniRevisione'

const STATI = [
  { key: 'tutti',      label: 'Tutte' },
  { key: 'bozza',      label: 'Da pubblicare' },
  { key: 'pubblicato', label: 'Pubblicate' },
  { key: 'archiviato', label: 'Archiviate' },
]

const BADGE: Record<string, string> = {
  pubblicato: 'bg-green-100 text-green-700',
  bozza:      'bg-amber-100 text-amber-700',
  archiviato: 'bg-gray-100 text-gray-500',
}

const LABEL: Record<string, string> = {
  pubblicato: 'Pubblicata',
  bozza:      'Da pubblicare',
  archiviato: 'Archiviata',
}

interface RigaAttivita {
  id: string
  titolo: string
  stato: string
  quando: string | null
  durata: string | null
  created_at: string
  geo_nodi: { nome: string } | null
  organizzatori: { nome: string; email: string | null } | null
}

export default async function AdminAttivitaPage({
  searchParams,
}: {
  searchParams: Promise<{ stato?: string }>
}) {
  const { stato } = await searchParams
  const filtro = stato && STATI.some(s => s.key === stato) ? stato : 'tutti'

  const sb = await createAdminClient()
  const { data, error } = await sb
    .from('attivita')
    .select('id, titolo, stato, quando, durata, created_at, geo_nodi(nome), organizzatori(nome, email)')
    .order('created_at', { ascending: false })
    .limit(300)

  if (error) console.error('AdminAttivitaPage:', error)
  const attivita = (data ?? []) as unknown as RigaAttivita[]

  const filtrate = filtro === 'tutti' ? attivita : attivita.filter(a => a.stato === filtro)
  const count = (s: string) => s === 'tutti' ? attivita.length : attivita.filter(a => a.stato === s).length

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-gray-900">Gestione attività / esperienze</h1>

      {/* Tab stati */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATI.map(s => (
          <Link
            key={s.key}
            href={s.key === 'tutti' ? '/admin/attivita' : `/admin/attivita?stato=${s.key}`}
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
        {filtrate.length === 0 ? (
          <div className="px-5 py-12 text-center text-gray-400 text-sm">Nessuna attività in questa categoria.</div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {filtrate.map(a => (
              <li key={a.id} className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-gray-900 truncate">{a.titolo}</p>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full shrink-0 ${BADGE[a.stato] ?? ''}`}>
                      {LABEL[a.stato] ?? a.stato}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {a.geo_nodi?.nome ?? '—'}
                    {a.quando ? ` · ${a.quando}` : ''}
                    {a.durata ? ` · ${a.durata}` : ''}
                  </p>
                  {a.organizzatori && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      da: {a.organizzatori.nome}{a.organizzatori.email ? ` · ${a.organizzatori.email}` : ''}
                    </p>
                  )}
                </div>
                <AzioniAttivita attivitaId={a.id} stato={a.stato} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
