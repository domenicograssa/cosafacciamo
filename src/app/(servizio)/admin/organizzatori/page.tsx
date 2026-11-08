export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'
import { formatData } from '@/lib/utils'
import { AzioniOrganizzatore, TogglePubblicazioneDiretta } from '@/components/admin/AzioniRevisione'

const STATI = [
  { key: 'tutti',     label: 'Tutti' },
  { key: 'in_attesa', label: 'In attesa' },
  { key: 'approvato', label: 'Approvati' },
  { key: 'sospeso',   label: 'Sospesi' },
  { key: 'rifiutato', label: 'Rifiutati' },
]

const BADGE: Record<string, string> = {
  approvato: 'bg-green-100 text-green-700',
  in_attesa: 'bg-amber-100 text-amber-700',
  sospeso:   'bg-orange-100 text-orange-700',
  rifiutato: 'bg-red-100 text-red-700',
}

const LABEL: Record<string, string> = {
  approvato: 'Approvato',
  in_attesa: 'In attesa',
  sospeso:   'Sospeso',
  rifiutato: 'Rifiutato',
}

interface RigaOrganizzatore {
  id: string
  nome: string
  slug: string
  email: string | null
  telefono: string | null
  sito_web: string | null
  stato: string
  pubblicazione_diretta: boolean
  created_at: string
}

export default async function AdminOrganizzatoriPage({
  searchParams,
}: {
  searchParams: Promise<{ stato?: string }>
}) {
  const { stato } = await searchParams
  const filtro = stato && STATI.some(s => s.key === stato) ? stato : 'tutti'

  const sb = await createAdminClient()
  const { data, error } = await sb
    .from('organizzatori')
    .select('id, nome, slug, email, telefono, sito_web, stato, pubblicazione_diretta, created_at')
    .order('created_at', { ascending: false })
    .limit(300)

  if (error) console.error('AdminOrganizzatoriPage:', error)
  const organizzatori = (data ?? []) as RigaOrganizzatore[]

  const filtrati = filtro === 'tutti' ? organizzatori : organizzatori.filter(o => o.stato === filtro)
  const count = (s: string) => s === 'tutti' ? organizzatori.length : organizzatori.filter(o => o.stato === s).length

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-gray-900">Organizzatori</h1>

      {/* Tab stati */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATI.map(s => (
          <Link
            key={s.key}
            href={s.key === 'tutti' ? '/admin/organizzatori' : `/admin/organizzatori?stato=${s.key}`}
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
          <div className="px-5 py-12 text-center text-gray-400 text-sm">Nessun organizzatore in questa categoria.</div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {filtrati.map(o => (
              <li key={o.id} className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/organizzatori/${o.slug}`}
                      className="font-semibold text-sm text-gray-900 hover:text-amber-600 truncate"
                    >
                      {o.nome}
                    </Link>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full shrink-0 ${BADGE[o.stato] ?? ''}`}>
                      {LABEL[o.stato] ?? o.stato}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 break-words">
                    {[o.email, o.telefono, o.sito_web].filter(Boolean).join(' · ') || '—'}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">Registrato il {formatData(o.created_at)}</p>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <TogglePubblicazioneDiretta
                    organizzatoreId={o.id}
                    valore={o.pubblicazione_diretta}
                  />
                  <Link
                    href={`/admin/organizzatori/${o.slug}`}
                    className="text-xs text-amber-600 hover:underline shrink-0"
                  >
                    Scheda →
                  </Link>
                  <AzioniOrganizzatore organizzatoreId={o.id} stato={o.stato} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
