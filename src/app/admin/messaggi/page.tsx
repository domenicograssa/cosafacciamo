export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'
import { formatData, formatOra } from '@/lib/utils'
import { AzioniMessaggio } from '@/components/admin/AzioniMessaggio'

const STATI = [
  { key: 'tutti',      label: 'Tutti' },
  { key: 'nuovo',      label: 'Nuovi' },
  { key: 'letto',      label: 'Letti' },
  { key: 'archiviato', label: 'Archiviati' },
]

const BADGE: Record<string, string> = {
  nuovo:      'bg-amber-100 text-amber-700',
  letto:      'bg-green-100 text-green-700',
  archiviato: 'bg-gray-100 text-gray-500',
}

const LABEL: Record<string, string> = {
  nuovo: 'Nuovo', letto: 'Letto', archiviato: 'Archiviato',
}

const TIPO_LABEL: Record<string, string> = {
  messaggio:      '💬 Messaggio',
  segnalazione:   '🚩 Segnalazione',
  richiesta_gdpr: '🔒 Richiesta GDPR',
  collaborazione: '🤝 Collaborazione',
}

interface Messaggio {
  id: string
  nome: string
  email: string
  tipo: string
  oggetto: string | null
  messaggio: string
  url_pagina: string | null
  stato: string
  created_at: string
}

export default async function AdminMessaggiPage({
  searchParams,
}: {
  searchParams: Promise<{ stato?: string }>
}) {
  const { stato } = await searchParams
  const filtro = stato && STATI.some(s => s.key === stato) ? stato : 'tutti'

  const sb = await createAdminClient()
  const { data, error } = await sb
    .from('messaggi')
    .select('id, nome, email, tipo, oggetto, messaggio, url_pagina, stato, created_at')
    .order('created_at', { ascending: false })
    .limit(300)

  // Se la tabella non esiste ancora, mostriamo le istruzioni invece di un errore
  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Messaggi dei visitatori</h1>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <p className="font-bold text-amber-800">Tabella non ancora creata</p>
          <p className="text-sm text-amber-700 mt-2">
            Esegui il file <code className="bg-amber-100 px-1.5 py-0.5 rounded">messaggi-migration.sql</code> nel
            SQL Editor di Supabase (Dashboard → SQL Editor) per attivare questa sezione.
          </p>
          <p className="text-xs text-amber-600 mt-3">Dettaglio tecnico: {error.message}</p>
        </div>
      </div>
    )
  }

  const messaggi = (data ?? []) as Messaggio[]
  const filtrati = filtro === 'tutti' ? messaggi : messaggi.filter(m => m.stato === filtro)
  const count = (s: string) => s === 'tutti' ? messaggi.length : messaggi.filter(m => m.stato === s).length

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-gray-900">Messaggi dei visitatori</h1>

      {/* Tab stati */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATI.map(s => (
          <Link
            key={s.key}
            href={s.key === 'tutti' ? '/admin/messaggi' : `/admin/messaggi?stato=${s.key}`}
            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              filtro === s.key ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s.label} <span className="opacity-60">({count(s.key)})</span>
          </Link>
        ))}
      </div>

      {/* Lista */}
      {filtrati.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-12 text-center text-gray-400 text-sm">
          Nessun messaggio in questa categoria.
        </div>
      ) : (
        <div className="space-y-4">
          {filtrati.map(m => (
            <div key={m.id} className={`bg-white rounded-2xl border shadow-sm p-5 ${m.stato === 'nuovo' ? 'border-amber-200' : 'border-gray-100'}`}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-gray-500">{TIPO_LABEL[m.tipo] ?? m.tipo}</span>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${BADGE[m.stato] ?? ''}`}>
                  {LABEL[m.stato] ?? m.stato}
                </span>
                <span className="text-xs text-gray-400 ml-auto">
                  {formatData(m.created_at)} {formatOra(m.created_at)}
                </span>
              </div>

              <p className="font-bold text-sm text-gray-900 mt-2">
                {m.oggetto || '(senza oggetto)'}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                da: {m.nome} · <a href={`mailto:${m.email}`} className="text-amber-600 hover:underline">{m.email}</a>
              </p>
              {m.url_pagina && (
                <p className="text-xs text-gray-500 mt-0.5 break-all">
                  pagina segnalata: <a href={m.url_pagina} target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">{m.url_pagina}</a>
                </p>
              )}

              <p className="text-sm text-gray-700 mt-3 leading-relaxed whitespace-pre-line bg-gray-50 rounded-xl p-4">
                {m.messaggio}
              </p>

              <div className="mt-4">
                <AzioniMessaggio messaggioId={m.id} stato={m.stato} email={m.email} oggetto={m.oggetto} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
