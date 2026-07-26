'use client'

import { useState, useTransition } from 'react'
import { traduciEventiMancanti } from '@/app/actions/eventi'

// Bottone per l'admin: traduce in blocco (via Claude API) tutti gli eventi
// approvati che non hanno ancora titolo_en/descrizione_en, così la versione
// inglese del sito smette di mostrare il fallback in italiano.
export default function TraduciMancantiBtn() {
  const [pending, startTransition] = useTransition()
  const [esito, setEsito] = useState<string | null>(null)

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          setEsito(null)
          startTransition(async () => {
            try {
              const r = await traduciEventiMancanti()
              if (r.totale === 0) {
                setEsito('Nessun evento da tradurre: sono già tutti a posto.')
              } else {
                setEsito(
                  `Tradotti ${r.tradotti}/${r.totale}.` +
                  (r.falliti.length > 0 ? ` Falliti: ${r.falliti.join(', ')}` : '')
                )
              }
            } catch (e) {
              setEsito(e instanceof Error ? e.message : 'Errore imprevisto')
            }
          })
        }}
        className="shrink-0 px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {pending ? 'Traduzione in corso…' : '🌐 Traduci eventi mancanti (EN)'}
      </button>
      {esito && <p className="text-xs text-gray-500 max-w-xs text-right">{esito}</p>}
    </div>
  )
}
