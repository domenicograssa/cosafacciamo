'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { aggiornaStatoMessaggio } from '@/app/actions/messaggi'

export function AzioniMessaggio({ messaggioId, stato, email, oggetto }: {
  messaggioId: string
  stato: string
  email: string
  oggetto: string | null
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [errore, setErrore] = useState<string | null>(null)

  const esegui = (nuovoStato: 'nuovo' | 'letto' | 'archiviato') => {
    setErrore(null)
    startTransition(async () => {
      const res = await aggiornaStatoMessaggio(messaggioId, nuovoStato)
      if (!res.ok) { setErrore(res.errore ?? 'Errore'); return }
      router.refresh()
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <a
        href={`mailto:${email}?subject=${encodeURIComponent(`Re: ${oggetto || 'il tuo messaggio su moesco'}`)}`}
        className="bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold px-4 py-2 rounded-xl text-xs border border-amber-200 transition-colors"
      >
        ✉️ Rispondi
      </a>
      {stato === 'nuovo' && (
        <button
          onClick={() => esegui('letto')}
          disabled={pending}
          className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors"
        >
          ✅ Segna come letto
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
      {stato === 'archiviato' && (
        <button
          onClick={() => esegui('letto')}
          disabled={pending}
          className="bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 font-bold px-4 py-2 rounded-xl text-xs border border-gray-200 transition-colors"
        >
          ↩️ Ripristina
        </button>
      )}
      {pending && <span className="text-xs text-gray-400">Salvataggio…</span>}
      {errore && <span className="text-xs text-red-600">{errore}</span>}
    </div>
  )
}
