'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatData, formatOra, formatPrezzo } from '@/lib/utils'
import { AzioniEvento } from '@/components/admin/AzioniRevisione'

export interface EventoDaApprovare {
  id: string
  slug: string
  titolo: string
  comune: string | null
  luogo: string | null
  indirizzo: string | null
  dataInizio: string
  dataFine: string | null
  tuttoIlGiorno: boolean
  gratuito: boolean
  prezzoMin: number | null
  prezzoMax: number | null
  descrizioneBreve: string | null
  descrizione: string | null
  fonte: string | null
  daRicercaAutomatica: boolean
  organizzatore: string | null
  categorie: string[]
  passato: boolean
  doppioni: Array<{ titolo: string; slug: string; approvato: boolean }>
}

function quando(e: EventoDaApprovare): string {
  const giorno = (d: string) => formatData(d, { weekday: 'long', day: 'numeric', month: 'long' })
  const stessoGiorno = e.dataFine && e.dataFine.slice(0, 10) === e.dataInizio.slice(0, 10)
  if (e.dataFine && !stessoGiorno) return `dal ${giorno(e.dataInizio)} al ${giorno(e.dataFine)}`
  return e.tuttoIlGiorno ? giorno(e.dataInizio) : `${giorno(e.dataInizio)}, ore ${formatOra(e.dataInizio)}`
}

function dominio(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, '') } catch { return url }
}

export default function SchedaDaApprovare({ evento: e }: { evento: EventoDaApprovare }) {
  const [aperta, setAperta] = useState(false)
  const breve = e.descrizioneBreve || e.descrizione?.slice(0, 280) || ''
  // Il comune si aggiunge solo se non compare già nel luogo o nell'indirizzo.
  const giaNominato = !!e.comune && [e.luogo, e.indirizzo].some(t => t?.toLowerCase().includes(e.comune!.toLowerCase()))
  const dove = [e.luogo, e.indirizzo, giaNominato ? null : e.comune].filter(Boolean).join(' · ')

  return (
    <article className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
      {/* Avvisi */}
      {(e.passato || e.doppioni.length > 0) && (
        <div className="space-y-2">
          {e.passato && (
            <p className="text-sm bg-gray-100 text-gray-700 rounded-lg px-3 py-2">
              ⌛ <strong>Evento già passato</strong>: conviene rifiutarlo.
            </p>
          )}
          {e.doppioni.length > 0 && (
            <div className="text-sm bg-amber-50 text-amber-800 border border-amber-200 rounded-lg px-3 py-2">
              ⚠️ <strong>Possibile doppione</strong> di:
              <ul className="mt-1 space-y-0.5">
                {e.doppioni.map(d => (
                  <li key={d.slug}>
                    <Link href={`/admin/eventi/${d.slug}`} target="_blank" className="underline">{d.titolo}</Link>
                    <span className="text-amber-600"> ({d.approvato ? 'già sul sito' : 'anche questo in attesa'})</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Quando, cosa, dove */}
      <div>
        <p className="text-sm font-semibold text-amber-600 first-letter:uppercase">📅 {quando(e)}</p>
        <h2 className="text-lg font-extrabold text-gray-900 mt-1 leading-snug">{e.titolo}</h2>
        {dove && <p className="text-sm text-gray-600 mt-1">📍 {dove}</p>}
        <p className="text-sm text-gray-600 mt-0.5">
          💶 {formatPrezzo(e.prezzoMin, e.prezzoMax, e.gratuito)}
          {e.categorie.length > 0 && <span className="text-gray-400"> · {e.categorie.join(', ')}</span>}
        </p>
      </div>

      {/* Descrizione: breve, con "Leggi tutto" */}
      {(breve || e.descrizione) && (
        <div className="text-sm text-gray-700 leading-relaxed">
          <p className="whitespace-pre-line">{aperta ? e.descrizione : breve}</p>
          {e.descrizione && e.descrizione.length > breve.length && (
            <button onClick={() => setAperta(v => !v)} className="text-amber-600 font-semibold text-xs mt-1 hover:underline">
              {aperta ? 'Mostra meno' : 'Leggi tutta la descrizione'}
            </button>
          )}
        </div>
      )}

      {/* Fonte da controllare */}
      <div className="text-sm">
        {e.fonte ? (
          <a href={e.fonte} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-700 font-semibold hover:underline">
            🔗 Controlla la fonte ({dominio(e.fonte)}) ↗
          </a>
        ) : (
          <span className="text-gray-400">Nessuna fonte indicata</span>
        )}
        <span className="text-gray-400 text-xs block mt-0.5">
          {e.daRicercaAutomatica ? 'Trovato dalla ricerca automatica' : `Inviato da ${e.organizzatore ?? 'organizzatore'}`}
        </span>
      </div>

      {/* Azioni */}
      <div className="border-t border-gray-100 pt-4 flex flex-wrap items-start justify-between gap-3">
        <AzioniEvento eventoId={e.id} stato="in_revisione" />
        <Link
          href={`/admin/eventi/${e.slug}/modifica`}
          className="text-xs font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
        >
          ✏️ Modifica prima di approvare
        </Link>
      </div>
    </article>
  )
}
