'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { formatData, formatOra, normalizzaTesto } from '@/lib/utils'

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

export interface RigaEventoAdmin {
  id: string
  slug: string
  titolo: string
  stato: string
  data_inizio: string
  created_at: string
  geo_nodi: { nome: string; slug: string } | null
  organizzatori: { nome: string } | null
  categorie: { nome: string; slug: string }[]
}

interface ComuneOpzione { nome: string; slug: string }
interface CategoriaOpzione { nome: string; slug: string }

interface Props {
  eventi: RigaEventoAdmin[]
  comuni: ComuneOpzione[]
  categorie: CategoriaOpzione[]
}

export default function FiltriEventiAdmin({ eventi, comuni, categorie }: Props) {
  const [testo, setTesto] = useState('')
  const [citta, setCitta] = useState('')
  const [categoria, setCategoria] = useState('')

  // Solo le città/categorie che compaiono davvero tra gli eventi caricati
  const cittaDisponibili = useMemo(() => {
    const slugPresenti = new Set(eventi.map(e => e.geo_nodi?.slug).filter(Boolean))
    return comuni.filter(c => slugPresenti.has(c.slug))
  }, [eventi, comuni])

  const categorieDisponibili = useMemo(() => {
    const slugPresenti = new Set(eventi.flatMap(e => e.categorie.map(c => c.slug)))
    return categorie.filter(c => slugPresenti.has(c.slug))
  }, [eventi, categorie])

  const eventiFiltrati = useMemo(() => {
    return eventi.filter(e => {
      if (citta && e.geo_nodi?.slug !== citta) return false
      if (categoria && !e.categorie.some(c => c.slug === categoria)) return false
      if (testo) {
        const q = normalizzaTesto(testo)
        const campi = [e.titolo, e.geo_nodi?.nome ?? '', e.organizzatori?.nome ?? '']
        if (!campi.some(campo => normalizzaTesto(campo).includes(q))) return false
      }
      return true
    })
  }, [eventi, testo, citta, categoria])

  const haFiltriAttivi = !!testo || !!citta || !!categoria
  const resetFiltri = () => { setTesto(''); setCitta(''); setCategoria('') }

  return (
    <div className="space-y-4">
      {/* Barra filtri */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="search"
          value={testo}
          onChange={e => setTesto(e.target.value)}
          placeholder="Cerca per titolo, città o organizzatore…"
          className="flex-1 text-sm bg-white border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-amber-400 placeholder-gray-400"
        />
        <select
          value={citta}
          onChange={e => setCitta(e.target.value)}
          className="text-sm bg-white border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-amber-400 min-w-[160px]"
        >
          <option value="">Tutte le città</option>
          {cittaDisponibili.map(c => (
            <option key={c.slug} value={c.slug}>{c.nome}</option>
          ))}
        </select>
        <select
          value={categoria}
          onChange={e => setCategoria(e.target.value)}
          className="text-sm bg-white border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-amber-400 min-w-[160px]"
        >
          <option value="">Tutte le categorie</option>
          {categorieDisponibili.map(c => (
            <option key={c.slug} value={c.slug}>{c.nome}</option>
          ))}
        </select>
        {haFiltriAttivi && (
          <button
            onClick={resetFiltri}
            className="text-sm text-red-500 font-semibold px-4 py-2.5 border border-red-200 rounded-xl hover:bg-red-50 transition-colors whitespace-nowrap"
          >
            Rimuovi filtri
          </button>
        )}
      </div>

      <p className="text-xs text-gray-500">
        {eventiFiltrati.length} {eventiFiltrati.length === 1 ? 'evento' : 'eventi'}
        {haFiltriAttivi ? ` su ${eventi.length}` : ''}
      </p>

      {/* Lista */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {eventiFiltrati.length === 0 ? (
          <div className="px-5 py-12 text-center text-gray-400 text-sm">Nessun evento trovato con questi filtri.</div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {eventiFiltrati.map(e => (
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
