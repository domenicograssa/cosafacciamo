'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { eliminaEventoOrganizzatore } from '@/app/actions/eventi'

export default function EliminaEventoBtn({ eventoId, titolo }: { eventoId: string; titolo: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [conferma, setConferma] = useState(false)
  const [errore, setErrore] = useState('')

  const elimina = () => {
    startTransition(async () => {
      const res = await eliminaEventoOrganizzatore(eventoId)
      if (!res.ok) {
        setErrore(res.errore ?? 'Errore durante l\'eliminazione.')
        setConferma(false)
      } else {
        router.refresh()
      }
    })
  }

  if (conferma) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-red-700 font-medium">Eliminare &ldquo;{titolo}&rdquo;?</span>
        <button
          onClick={elimina}
          disabled={pending}
          className="text-xs bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold px-3 py-1 rounded-lg transition-colors"
        >
          {pending ? 'Eliminazione…' : 'Sì, elimina'}
        </button>
        <button
          onClick={() => setConferma(false)}
          disabled={pending}
          className="text-xs text-gray-500 hover:text-gray-700 font-medium px-2 py-1"
        >
          Annulla
        </button>
        {errore && <span className="text-xs text-red-600">{errore}</span>}
      </div>
    )
  }

  return (
    <button
      onClick={() => setConferma(true)}
      className="text-xs text-red-500 hover:text-red-700 font-semibold transition-colors"
    >
      Elimina
    </button>
  )
}
