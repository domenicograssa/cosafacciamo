'use client'

import { useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import EventCard from './EventCard'
import { Evento, Categoria, GeoNodo } from '@/types'
import CategoryChip, { icona } from '@/components/ui/CategoryChip'
import ComuneCombobox from '@/components/ui/ComuneCombobox'
import { normalizzaTesto } from '@/lib/utils'

interface FiltriState {
  testo: string
  categorie: string[]
  comune: string
  soloGratuiti: boolean
  data: string
}

interface EventiListProps {
  eventi: Evento[]
  categorie: Categoria[]
  comuni: GeoNodo[]
  titoloIniziale?: string
}

export default function EventiList({ eventi, categorie, comuni, titoloIniziale }: EventiListProps) {
  // Inizializza i filtri dai parametri URL (es. ricerca dalla homepage: /eventi?comune=...&q=...)
  const searchParams = useSearchParams()
  const [filtri, setFiltri] = useState<FiltriState>(() => ({
    testo: searchParams.get('q') ?? '',
    categorie: searchParams.get('categoria') ? [searchParams.get('categoria')!] : [],
    comune: searchParams.get('comune') ?? '',
    soloGratuiti: searchParams.get('gratuiti') === 'true',
    data: searchParams.get('data') ?? '',
  }))
  const [filtroaperto, setFiltroAperto] = useState(false)

  const eventiFiltrati = useMemo(() => {
    return eventi.filter(e => {
      if (filtri.testo) {
        const q = normalizzaTesto(filtri.testo)
        const campi = [e.titolo, e.descrizioneBreve ?? '', e.luogoNome ?? '', e.geoNodo.nome]
        if (!campi.some(campo => normalizzaTesto(campo).includes(q))) return false
      }
      if (filtri.categorie.length > 0 && !e.categorie.some(c => filtri.categorie.includes(c.slug))) return false
      if (filtri.comune && e.geoNodo.slug !== filtri.comune) return false
      if (filtri.soloGratuiti && !e.gratuito) return false
      if (filtri.data) {
        const dataEvento = new Date(e.dataInizio).toISOString().split('T')[0]
        if (dataEvento !== filtri.data) return false
      }
      return true
    })
  }, [eventi, filtri])

  const toggleCategoria = (slug: string) => {
    setFiltri(prev => ({
      ...prev,
      categorie: prev.categorie.includes(slug)
        ? prev.categorie.filter(c => c !== slug)
        : [...prev.categorie, slug],
    }))
  }

  const resetFiltri = () => setFiltri({ testo: '', categorie: [], comune: '', soloGratuiti: false, data: '' })
  const haFiltriAttivi = !!filtri.testo || filtri.categorie.length > 0 || !!filtri.comune || filtri.soloGratuiti || !!filtri.data

  const PannelloFiltri = () => (
    <div className="space-y-6">
      {/* Comune */}
      <div>
        <p className="text-sm font-semibold text-gray-900 mb-3">Località</p>
        <ComuneCombobox
          comuni={comuni}
          value={filtri.comune}
          onChange={v => setFiltri(p => ({ ...p, comune: v }))}
          placeholder="Tutte le località — cerca…"
        />
      </div>

      {/* Data */}
      <div>
        <p className="text-sm font-semibold text-gray-900 mb-3">Data</p>
        <input
          type="date"
          value={filtri.data}
          onChange={e => setFiltri(p => ({ ...p, data: e.target.value }))}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-amber-400"
        />
      </div>

      {/* Gratuiti */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => setFiltri(p => ({ ...p, soloGratuiti: !p.soloGratuiti }))}
            className={`w-10 h-6 rounded-full transition-colors ${filtri.soloGratuiti ? 'bg-amber-400' : 'bg-gray-200'} relative`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${filtri.soloGratuiti ? 'translate-x-5' : 'translate-x-1'}`} />
          </div>
          <span className="text-sm font-medium text-gray-700">Solo eventi gratuiti</span>
        </label>
      </div>

      {/* Categorie */}
      <div>
        <p className="text-sm font-semibold text-gray-900 mb-3">Categoria</p>
        <div className="flex flex-wrap gap-2">
          {categorie.map(cat => (
            <button
              key={cat.id}
              onClick={() => toggleCategoria(cat.slug)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border-2 transition-all ${
                filtri.categorie.includes(cat.slug)
                  ? 'text-white border-transparent'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
              style={filtri.categorie.includes(cat.slug) ? { backgroundColor: cat.colore, borderColor: cat.colore } : {}}
            >
              <span>{icona(cat.icona)}</span>
              <span>{cat.nome}</span>
            </button>
          ))}
        </div>
      </div>

      {haFiltriAttivi && (
        <button
          onClick={resetFiltri}
          className="w-full text-sm text-red-500 font-semibold py-2 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
        >
          Rimuovi filtri
        </button>
      )}
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {titoloIniziale ?? 'Tutti gli eventi'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {eventiFiltrati.length} {eventiFiltrati.length === 1 ? 'evento trovato' : 'eventi trovati'}
          </p>
        </div>

        {/* Bottone filtri mobile */}
        <button
          onClick={() => setFiltroAperto(true)}
          className="lg:hidden flex items-center gap-2 text-sm font-semibold bg-white border border-gray-200 px-4 py-2 rounded-xl shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
          </svg>
          Filtri
          {haFiltriAttivi && <span className="w-2 h-2 rounded-full bg-amber-400" />}
        </button>
      </div>

      {/* Barra di ricerca */}
      <div className="relative mb-6">
        <svg className="w-5 h-5 text-amber-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="search"
          value={filtri.testo}
          onChange={e => setFiltri(p => ({ ...p, testo: e.target.value }))}
          placeholder="Cerca un evento, un luogo o un comune…"
          className="w-full text-sm bg-white border border-gray-200 rounded-2xl pl-11 pr-4 py-3.5 shadow-sm outline-none focus:ring-2 focus:ring-amber-400 placeholder-gray-400"
        />
        {filtri.testo && (
          <button
            onClick={() => setFiltri(p => ({ ...p, testo: '' }))}
            aria-label="Cancella ricerca"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="flex gap-8">

        {/* Sidebar filtri desktop */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-24">
            <div className="flex items-center justify-between mb-5">
              <p className="font-bold text-gray-900">Filtri</p>
              {haFiltriAttivi && (
                <button onClick={resetFiltri} className="text-xs text-amber-600 font-semibold hover:underline">
                  Rimuovi tutti
                </button>
              )}
            </div>
            {PannelloFiltri()}
          </div>
        </aside>

        {/* Griglia eventi */}
        <div className="flex-1 min-w-0">
          {eventiFiltrati.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {eventiFiltrati.map(evento => (
                <EventCard key={evento.id} evento={evento} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="text-5xl mb-4">🔍</div>
              <p className="font-semibold text-gray-900">Nessun evento trovato</p>
              <p className="text-sm text-gray-500 mt-1">Prova a modificare i filtri</p>
              <button onClick={resetFiltri} className="mt-4 text-sm text-amber-600 font-semibold hover:underline">
                Rimuovi filtri
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Drawer filtri mobile */}
      {filtroaperto && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setFiltroAperto(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <p className="font-bold text-gray-900 text-lg">Filtri</p>
              <button onClick={() => setFiltroAperto(false)} className="p-2 text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {PannelloFiltri()}
            <button
              onClick={() => setFiltroAperto(false)}
              className="w-full mt-6 bg-amber-400 hover:bg-amber-500 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Mostra {eventiFiltrati.length} eventi
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
