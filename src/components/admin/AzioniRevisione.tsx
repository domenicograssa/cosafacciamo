'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { aggiornaStatoEvento, aggiornaStatoAttivita, aggiornaStatoOrganizzatore } from '@/app/actions/admin'

// Bottoni Approva / Rifiuta per un evento (con nota facoltativa per il rifiuto)
export function AzioniEvento({ eventoId, stato }: { eventoId: string; stato: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [mostraNota, setMostraNota] = useState(false)
  const [nota, setNota] = useState('')
  const [errore, setErrore] = useState<string | null>(null)

  const esegui = (nuovoStato: 'approvato' | 'rifiutato' | 'sospeso', notaRifiuto?: string) => {
    setErrore(null)
    startTransition(async () => {
      const res = await aggiornaStatoEvento(eventoId, nuovoStato, notaRifiuto)
      if (!res.ok) { setErrore(res.errore ?? 'Errore'); return }
      setMostraNota(false)
      router.refresh()
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {stato !== 'approvato' && (
          <button
            onClick={() => esegui('approvato')}
            disabled={pending}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
          >
            ✅ Approva
          </button>
        )}
        {stato !== 'rifiutato' && (
          <button
            onClick={() => setMostraNota(v => !v)}
            disabled={pending}
            className="bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-700 font-bold px-5 py-2.5 rounded-xl text-sm border border-red-200 transition-colors"
          >
            ❌ Rifiuta
          </button>
        )}
        {stato === 'approvato' && (
          <button
            onClick={() => esegui('sospeso')}
            disabled={pending}
            className="bg-orange-50 hover:bg-orange-100 disabled:opacity-50 text-orange-700 font-bold px-5 py-2.5 rounded-xl text-sm border border-orange-200 transition-colors"
          >
            ⏸ Sospendi
          </button>
        )}
        {pending && <span className="text-sm text-gray-400 self-center">Salvataggio…</span>}
      </div>

      {mostraNota && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 space-y-3">
          <label className="block text-sm font-semibold text-red-800">
            Motivo del rifiuto (facoltativo)
          </label>
          <textarea
            value={nota}
            onChange={e => setNota(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-red-200 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
            placeholder="Es: immagine senza diritti, informazioni incomplete…"
          />
          <button
            onClick={() => esegui('rifiutato', nota)}
            disabled={pending}
            className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Conferma rifiuto
          </button>
        </div>
      )}

      {errore && <p className="text-sm text-red-600">{errore}</p>}
    </div>
  )
}

// Bottoni Pubblica / Archivia per un'attività
export function AzioniAttivita({ attivitaId, stato }: { attivitaId: string; stato: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [errore, setErrore] = useState<string | null>(null)

  const esegui = (nuovoStato: 'pubblicato' | 'archiviato') => {
    setErrore(null)
    startTransition(async () => {
      const res = await aggiornaStatoAttivita(attivitaId, nuovoStato)
      if (!res.ok) { setErrore(res.errore ?? 'Errore'); return }
      router.refresh()
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {stato !== 'pubblicato' && (
        <button
          onClick={() => esegui('pubblicato')}
          disabled={pending}
          className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors"
        >
          ✅ Pubblica
        </button>
      )}
      {stato !== 'archiviato' && (
        <button
          onClick={() => esegui('archiviato')}
          disabled={pending}
          className="bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 font-bold px-4 py-2 rounded-xl text-xs border border-gray-200 transition-colors"
        >
          📦 Archivia
        </button>
      )}
      {pending && <span className="text-xs text-gray-400">Salvataggio…</span>}
      {errore && <span className="text-xs text-red-600">{errore}</span>}
    </div>
  )
}

// Bottoni per organizzatore
export function AzioniOrganizzatore({ organizzatoreId, stato }: { organizzatoreId: string; stato: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [errore, setErrore] = useState<string | null>(null)

  const esegui = (nuovoStato: 'approvato' | 'sospeso' | 'rifiutato') => {
    setErrore(null)
    startTransition(async () => {
      const res = await aggiornaStatoOrganizzatore(organizzatoreId, nuovoStato)
      if (!res.ok) { setErrore(res.errore ?? 'Errore'); return }
      router.refresh()
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {stato !== 'approvato' && (
        <button
          onClick={() => esegui('approvato')}
          disabled={pending}
          className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors"
        >
          ✅ Approva
        </button>
      )}
      {stato === 'approvato' && (
        <button
          onClick={() => esegui('sospeso')}
          disabled={pending}
          className="bg-orange-50 hover:bg-orange-100 disabled:opacity-50 text-orange-700 font-bold px-4 py-2 rounded-xl text-xs border border-orange-200 transition-colors"
        >
          ⏸ Sospendi
        </button>
      )}
      {pending && <span className="text-xs text-gray-400">Salvataggio…</span>}
      {errore && <span className="text-xs text-red-600">{errore}</span>}
    </div>
  )
}
