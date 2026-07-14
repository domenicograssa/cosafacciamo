'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { formatData, normalizzaTesto } from '@/lib/utils'
import { impostaInEvidenza, salvaTestoArticolo } from '@/app/actions/admin'

interface RigaEvento {
  id: string
  slug: string
  titolo: string
  data_inizio: string
  data_fine: string | null
  in_evidenza: boolean
  in_evidenza_scade_il: string | null
  testo_articolo: string | null
  descrizione: string | null
  geo_nodi: { nome: string; slug: string } | null
}

const SLOT = 3

export default function GestioneInEvidenza({ eventi: eventiIniziali }: { eventi: RigaEvento[] }) {
  const [eventi, setEventi] = useState(eventiIniziali)
  const [testo, setTesto] = useState('')
  const [salvandoId, setSalvandoId] = useState<string | null>(null)
  const [espansoId, setEspansoId] = useState<string | null>(null)
  const [bozzaTesto, setBozzaTesto] = useState<Record<string, string>>({})
  const [errore, setErrore] = useState('')

  // Stessa logica di getEventiInEvidenza: pinnati per primi (già ordinati per
  // data_inizio dalla query), poi riempimento automatico coi prossimi eventi.
  const anteprima = useMemo(() => {
    const pinnati = eventi.filter(e => e.in_evidenza).slice(0, SLOT)
    const spazio = SLOT - pinnati.length
    const auto = spazio > 0
      ? eventi.filter(e => !e.in_evidenza).slice(0, spazio)
      : []
    return [
      ...pinnati.map(e => ({ evento: e, automatico: false })),
      ...auto.map(e => ({ evento: e, automatico: true })),
    ]
  }, [eventi])

  const pinnatiCount = eventi.filter(e => e.in_evidenza).length

  const eventiFiltrati = useMemo(() => {
    if (!testo) return eventi
    const q = normalizzaTesto(testo)
    return eventi.filter(e => {
      const campi = [e.titolo, e.geo_nodi?.nome ?? '']
      return campi.some(campo => normalizzaTesto(campo).includes(q))
    })
  }, [eventi, testo])

  const toggle = async (id: string, valore: boolean) => {
    setErrore('')
    const scadenzaOttimistica = valore
      ? new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
      : null
    setEventi(prev => prev.map(e => e.id === id ? { ...e, in_evidenza: valore, in_evidenza_scade_il: scadenzaOttimistica } : e))
    const esito = await impostaInEvidenza(id, valore)
    if (!esito.ok) {
      setErrore(esito.errore ?? 'Errore imprevisto.')
      setEventi(prev => prev.map(e => e.id === id ? { ...e, in_evidenza: !valore, in_evidenza_scade_il: null } : e))
    }
  }

  const apriTesto = (evento: RigaEvento) => {
    setEspansoId(prev => prev === evento.id ? null : evento.id)
    setBozzaTesto(prev => ({ ...prev, [evento.id]: prev[evento.id] ?? evento.testo_articolo ?? '' }))
  }

  const salvaTesto = async (id: string) => {
    setSalvandoId(id)
    setErrore('')
    const valore = bozzaTesto[id] ?? ''
    const esito = await salvaTestoArticolo(id, valore)
    setSalvandoId(null)
    if (!esito.ok) {
      setErrore(esito.errore ?? 'Errore imprevisto.')
    } else {
      setEventi(prev => prev.map(e => e.id === id ? { ...e, testo_articolo: valore.trim() || null } : e))
      setEspansoId(null)
    }
  }

  return (
    <div className="space-y-8">

      {/* Anteprima homepage */}
      <div>
        <h2 className="font-bold text-gray-900 mb-1">Anteprima homepage</h2>
        <p className="text-xs text-gray-500 mb-3">
          {pinnatiCount}/{SLOT} posti scelti manualmente
          {pinnatiCount < SLOT && ` · ${SLOT - pinnatiCount} riempit${SLOT - pinnatiCount === 1 ? 'o' : 'i'} in automatico`}
        </p>
        <div className="grid sm:grid-cols-3 gap-4">
          {anteprima.length === 0 && (
            <p className="text-sm text-gray-400 col-span-3">Nessun evento disponibile al momento.</p>
          )}
          {anteprima.map(({ evento, automatico }) => (
            <div key={evento.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-2">
              <span className={`inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                automatico ? 'bg-gray-100 text-gray-500' : 'bg-amber-100 text-amber-700'
              }`}>
                {automatico ? 'Automatico' : 'Scelto manualmente'}
              </span>
              <p className="font-semibold text-sm text-gray-900 line-clamp-2">{evento.titolo}</p>
              <p className="text-xs text-gray-500">{evento.geo_nodi?.nome ?? '—'} · {formatData(evento.data_inizio)}</p>
              {!automatico && evento.in_evidenza_scade_il && (
                <p className="text-[11px] text-amber-600">Scade il {formatData(evento.in_evidenza_scade_il)}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {errore && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">{errore}</p>
      )}

      {/* Lista eventi con toggle */}
      <div>
        <h2 className="font-bold text-gray-900 mb-3">Tutti gli eventi in programma</h2>
        <input
          type="search"
          value={testo}
          onChange={e => setTesto(e.target.value)}
          placeholder="Cerca per titolo o città…"
          className="w-full text-sm bg-white border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-amber-400 placeholder-gray-400 mb-3"
        />
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {eventiFiltrati.length === 0 ? (
            <div className="px-5 py-12 text-center text-gray-400 text-sm">Nessun evento trovato.</div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {eventiFiltrati.map(e => (
                <li key={e.id} className="px-5 py-4">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => toggle(e.id, !e.in_evidenza)}
                      role="switch"
                      aria-checked={e.in_evidenza}
                      className={`shrink-0 w-11 h-6 rounded-full relative transition-colors ${
                        e.in_evidenza ? 'bg-amber-400' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                        e.in_evidenza ? 'translate-x-[22px]' : 'translate-x-0.5'
                      }`} />
                    </button>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">{e.titolo}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {e.geo_nodi?.nome ?? '—'} · {formatData(e.data_inizio)}
                        {e.in_evidenza && e.in_evidenza_scade_il && (
                          <span className="text-amber-600"> · scade il {formatData(e.in_evidenza_scade_il)}</span>
                        )}
                      </p>
                    </div>

                    <button
                      onClick={() => apriTesto(e)}
                      className="text-xs text-amber-600 font-semibold hover:underline shrink-0"
                    >
                      {e.testo_articolo ? '✏️ Testo articolo' : '+ Testo articolo'}
                    </button>

                    <Link href={`/admin/eventi/${e.slug}`} className="text-xs text-gray-400 hover:text-gray-600 shrink-0">
                      Dettaglio →
                    </Link>
                  </div>

                  {espansoId === e.id && (
                    <div className="mt-3 pl-[60px] space-y-2">
                      <textarea
                        value={bozzaTesto[e.id] ?? ''}
                        onChange={ev => setBozzaTesto(prev => ({ ...prev, [e.id]: ev.target.value }))}
                        rows={4}
                        placeholder="Se lasci vuoto, in homepage viene mostrata la descrizione completa dell'evento."
                        className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-amber-400 resize-y"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => salvaTesto(e.id)}
                          disabled={salvandoId === e.id}
                          className="bg-amber-400 hover:bg-amber-500 disabled:opacity-60 text-white font-bold px-4 py-2 rounded-xl transition-colors text-xs"
                        >
                          {salvandoId === e.id ? 'Salvataggio…' : 'Salva testo'}
                        </button>
                        <button
                          onClick={() => setEspansoId(null)}
                          className="border border-gray-200 hover:border-gray-400 text-gray-700 font-semibold px-4 py-2 rounded-xl transition-colors text-xs"
                        >
                          Annulla
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
