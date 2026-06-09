'use client'

import { useState } from 'react'
import { ORGANIZZATORI_MOCK, type Organizzatore } from '@/data/mock-admin'

const STATI_ORG: { key: Organizzatore['stato'] | 'tutti'; label: string }[] = [
  { key: 'tutti',     label: 'Tutti' },
  { key: 'in_attesa', label: 'In attesa' },
  { key: 'approvato', label: 'Approvati' },
  { key: 'sospeso',   label: 'Sospesi' },
  { key: 'rifiutato', label: 'Rifiutati' },
]

const BADGE: Record<string, string> = {
  approvato:  'bg-green-100 text-green-700',
  in_attesa:  'bg-amber-100 text-amber-700',
  sospeso:    'bg-orange-100 text-orange-700',
  rifiutato:  'bg-red-100 text-red-700',
}

const LABEL: Record<string, string> = {
  approvato:  'Approvato',
  in_attesa:  'In attesa',
  sospeso:    'Sospeso',
  rifiutato:  'Rifiutato',
}

export default function AdminOrganizzatoriPage() {
  const [filtro, setFiltro] = useState<Organizzatore['stato'] | 'tutti'>('tutti')
  const [stati, setStati] = useState<Record<string, Organizzatore['stato']>>(
    Object.fromEntries(ORGANIZZATORI_MOCK.map(o => [o.id, o.stato]))
  )
  const [orgSelezionato, setOrgSelezionato] = useState<Organizzatore | null>(null)
  const [azione, setAzione] = useState<'approva' | 'rifiuta' | 'sospendi' | null>(null)

  const lista = ORGANIZZATORI_MOCK.filter(o =>
    filtro === 'tutti' || stati[o.id] === filtro
  )

  const eseguiAzione = (id: string) => {
    if (azione === 'approva') setStati(s => ({ ...s, [id]: 'approvato' }))
    if (azione === 'rifiuta') setStati(s => ({ ...s, [id]: 'rifiutato' }))
    if (azione === 'sospendi') setStati(s => ({ ...s, [id]: 'sospeso' }))
    setOrgSelezionato(null)
    setAzione(null)
  }

  const countPerStato = (s: Organizzatore['stato'] | 'tutti') =>
    s === 'tutti'
      ? ORGANIZZATORI_MOCK.length
      : ORGANIZZATORI_MOCK.filter(o => stati[o.id] === s).length

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-gray-900">Gestione organizzatori</h1>

      {/* Tab */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATI_ORG.map(s => (
          <button
            key={s.key}
            onClick={() => setFiltro(s.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors border-2 ${
              filtro === s.key
                ? 'bg-gray-900 text-white border-transparent'
                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
            }`}
          >
            {s.label}
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${filtro === s.key ? 'bg-white/20' : 'bg-gray-100 text-gray-600'}`}>
              {countPerStato(s.key)}
            </span>
          </button>
        ))}
      </div>

      {/* Griglia organizzatori */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {lista.map(org => {
          const statoAttuale = stati[org.id]
          return (
            <div key={org.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">

              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-lg shrink-0">
                    {org.nome.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 text-sm leading-tight truncate">{org.nome}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{org.email}</p>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full shrink-0 ${BADGE[statoAttuale]}`}>
                  {LABEL[statoAttuale]}
                </span>
              </div>

              {/* Info */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-gray-400 font-semibold uppercase tracking-wide">Registrato</p>
                  <p className="text-gray-700 mt-0.5">
                    {new Date(org.createdAt).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 font-semibold uppercase tracking-wide">Eventi</p>
                  <p className="text-gray-700 mt-0.5">{org.eventiCount} pubblicati</p>
                </div>
                {org.telefono && (
                  <div className="col-span-2">
                    <p className="text-gray-400 font-semibold uppercase tracking-wide">Telefono</p>
                    <p className="text-gray-700 mt-0.5">{org.telefono}</p>
                  </div>
                )}
                {org.sitoWeb && (
                  <div className="col-span-2">
                    <a href={org.sitoWeb} target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline truncate block">
                      {org.sitoWeb.replace('https://', '')}
                    </a>
                  </div>
                )}
              </div>

              {/* Azioni */}
              <div className="flex gap-2">
                {statoAttuale === 'in_attesa' && (
                  <>
                    <button
                      onClick={() => { setOrgSelezionato(org); setAzione('approva') }}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-2 rounded-xl transition-colors"
                    >
                      ✅ Approva
                    </button>
                    <button
                      onClick={() => { setOrgSelezionato(org); setAzione('rifiuta') }}
                      className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold py-2 rounded-xl border border-red-200 transition-colors"
                    >
                      ❌ Rifiuta
                    </button>
                  </>
                )}
                {statoAttuale === 'approvato' && (
                  <button
                    onClick={() => { setOrgSelezionato(org); setAzione('sospendi') }}
                    className="flex-1 bg-orange-50 hover:bg-orange-100 text-orange-600 text-xs font-bold py-2 rounded-xl border border-orange-200 transition-colors"
                  >
                    ⏸ Sospendi
                  </button>
                )}
                {(statoAttuale === 'sospeso' || statoAttuale === 'rifiutato') && (
                  <button
                    onClick={() => { setStati(s => ({ ...s, [org.id]: 'approvato' })) }}
                    className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-bold py-2 rounded-xl border border-green-200 transition-colors"
                  >
                    ↩ Riattiva
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Dialog conferma */}
      {orgSelezionato && azione && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => { setOrgSelezionato(null); setAzione(null) }} />
          <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4 space-y-4">
            <h3 className="font-bold text-gray-900 text-lg">
              {azione === 'approva' ? '✅ Approva organizzatore' :
               azione === 'rifiuta' ? '❌ Rifiuta organizzatore' :
               '⏸ Sospendi organizzatore'}
            </h3>
            <p className="text-sm text-gray-600">
              {azione === 'approva'
                ? `Vuoi approvare "${orgSelezionato.nome}"? Potrà pubblicare eventi sul portale.`
                : azione === 'rifiuta'
                ? `Vuoi rifiutare "${orgSelezionato.nome}"? Non potrà pubblicare eventi.`
                : `Vuoi sospendere "${orgSelezionato.nome}"? I suoi eventi non saranno più visibili.`}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setOrgSelezionato(null); setAzione(null) }}
                className="flex-1 border-2 border-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl hover:bg-gray-50 text-sm transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={() => eseguiAzione(orgSelezionato.id)}
                className={`flex-1 font-bold py-2.5 rounded-xl text-sm text-white transition-colors ${
                  azione === 'approva' ? 'bg-green-500 hover:bg-green-600' :
                  azione === 'rifiuta' ? 'bg-red-500 hover:bg-red-600' :
                  'bg-orange-500 hover:bg-orange-600'
                }`}
              >
                Conferma
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
