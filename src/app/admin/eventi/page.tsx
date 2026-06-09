'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { EVENTI_ADMIN_MOCK } from '@/data/mock-admin'
import { formatData, formatOra } from '@/lib/utils'
import type { StatoEvento } from '@/types'

const STATI: { key: StatoEvento | 'tutti'; label: string; colore: string }[] = [
  { key: 'tutti',        label: 'Tutti',        colore: 'bg-gray-100 text-gray-700' },
  { key: 'in_revisione', label: 'In revisione', colore: 'bg-amber-100 text-amber-700' },
  { key: 'approvato',    label: 'Approvati',    colore: 'bg-green-100 text-green-700' },
  { key: 'rifiutato',    label: 'Rifiutati',    colore: 'bg-red-100 text-red-700' },
  { key: 'sospeso',      label: 'Sospesi',      colore: 'bg-orange-100 text-orange-700' },
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

export default function AdminEventiPage() {
  const [filtroStato, setFiltroStato] = useState<StatoEvento | 'tutti'>('tutti')
  const [ricerca, setRicerca] = useState('')

  const eventiFiltrati = EVENTI_ADMIN_MOCK.filter(e => {
    if (filtroStato !== 'tutti' && e.stato !== filtroStato) return false
    if (ricerca && !e.titolo.toLowerCase().includes(ricerca.toLowerCase())) return false
    return true
  })

  const countPerStato = (s: StatoEvento | 'tutti') =>
    s === 'tutti'
      ? EVENTI_ADMIN_MOCK.length
      : EVENTI_ADMIN_MOCK.filter(e => e.stato === s).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-gray-900">Gestione eventi</h1>
      </div>

      {/* Tab stati */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATI.map(s => (
          <button
            key={s.key}
            onClick={() => setFiltroStato(s.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors border-2 ${
              filtroStato === s.key
                ? `${s.colore} border-transparent`
                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
            }`}
          >
            {s.label}
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${filtroStato === s.key ? 'bg-white/50' : 'bg-gray-100 text-gray-600'}`}>
              {countPerStato(s.key)}
            </span>
          </button>
        ))}
      </div>

      {/* Barra ricerca */}
      <div className="relative">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={ricerca}
          onChange={e => setRicerca(e.target.value)}
          placeholder="Cerca per titolo..."
          className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-400 bg-white"
        />
      </div>

      {/* Tabella */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {eventiFiltrati.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <p className="text-3xl mb-2">📭</p>
            <p className="text-sm">Nessun evento trovato</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left bg-gray-50">
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Evento</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Organizzatore</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Data</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Comune</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Stato</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {eventiFiltrati.map(e => (
                  <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                          {e.immagineCopertura ? (
                            <Image src={e.immagineCopertura} alt="" width={40} height={40} className="object-cover w-full h-full" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-lg">
                              {e.categorie[0]?.icona ?? '🎉'}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 max-w-[200px] truncate">{e.titolo}</p>
                          {e.categorie[0] && (
                            <span className="text-xs text-white px-2 py-0.5 rounded-full" style={{ backgroundColor: e.categorie[0].colore }}>
                              {e.categorie[0].nome}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-600 max-w-[140px] truncate">{e.organizzatore.nome}</td>
                    <td className="px-5 py-4 text-gray-600 whitespace-nowrap">
                      {formatData(e.dataInizio)}<br />
                      <span className="text-xs text-gray-400">{formatOra(e.dataInizio)}</span>
                    </td>
                    <td className="px-5 py-4 text-gray-600">{e.geoNodo.nome}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${BADGE[e.stato] ?? ''}`}>
                        {LABEL[e.stato] ?? e.stato}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/eventi/${e.slug}`}
                        className="text-amber-600 hover:underline text-xs font-semibold whitespace-nowrap"
                      >
                        {e.stato === 'in_revisione' ? 'Revisiona →' : 'Dettaglio →'}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
