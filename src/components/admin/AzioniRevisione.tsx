'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { aggiornaStatoEvento, aggiornaStatoAttivita, aggiornaStatoOrganizzatore, togglePubblicazioneDiretta, aggiornaImmagineAttivita, caricaImmagineAttivita } from '@/app/actions/admin'

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

// Campo rapido per impostare/correggere l'immagine di copertina di
// un'attività (URL diretto). Non esiste ancora un form di modifica completo
// per le attività come per gli eventi: questo copre il bisogno minimo di
// poter aggiungere una foto pertinente prima di pubblicare.
export function ModificaImmagineAttivita({
  attivitaId,
  urlAttuale,
}: {
  attivitaId: string
  urlAttuale: string | null
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [url, setUrl] = useState(urlAttuale ?? '')
  const [errore, setErrore] = useState<string | null>(null)
  const [salvato, setSalvato] = useState(false)

  const salva = () => {
    setErrore(null)
    setSalvato(false)
    startTransition(async () => {
      const res = await aggiornaImmagineAttivita(attivitaId, url)
      if (!res.ok) { setErrore(res.errore ?? 'Errore'); return }
      setSalvato(true)
      router.refresh()
    })
  }

  const [caricamento, startCaricamento] = useTransition()

  const caricaFile = (fileList: FileList | null) => {
    const file = fileList?.[0]
    if (!file) return
    setErrore(null)
    setSalvato(false)
    const fd = new FormData()
    fd.set('immagine', file)
    startCaricamento(async () => {
      const res = await caricaImmagineAttivita(attivitaId, fd)
      if (!res.ok) { setErrore(res.errore ?? 'Errore'); return }
      if (res.url) setUrl(res.url)
      setSalvato(true)
      router.refresh()
    })
  }

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide">
        Immagine di copertina
      </label>
      <div className="flex flex-wrap gap-2">
        <input
          type="url"
          value={url}
          onChange={e => { setUrl(e.target.value); setSalvato(false) }}
          placeholder="https://images.unsplash.com/…"
          className="flex-1 min-w-[240px] rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
        />
        <button
          onClick={salva}
          disabled={pending}
          className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors"
        >
          Salva URL
        </button>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400">oppure carica un file (JPG, PNG, WebP, SVG — max 4 MB):</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/svg+xml"
          onChange={e => caricaFile(e.target.files)}
          disabled={caricamento}
          className="text-xs"
        />
      </div>
      {(pending || caricamento) && <p className="text-xs text-gray-400">Salvataggio…</p>}
      {salvato && !pending && !caricamento && <p className="text-xs text-green-600">Immagine salvata.</p>}
      {errore && <p className="text-xs text-red-600">{errore}</p>}
    </div>
  )
}

// Bottoni per organizzatore
export function AzioniOrganizzatore({ organizzatoreId, stato }: { organizzatoreId: string; stato: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [mostraNota, setMostraNota] = useState(false)
  const [nota, setNota] = useState('')
  const [errore, setErrore] = useState<string | null>(null)

  const esegui = (nuovoStato: 'approvato' | 'sospeso' | 'rifiutato', notaRifiuto?: string) => {
    setErrore(null)
    startTransition(async () => {
      const res = await aggiornaStatoOrganizzatore(organizzatoreId, nuovoStato)
      if (!res.ok) { setErrore(res.errore ?? 'Errore'); return }
      setMostraNota(false)
      router.refresh()
    })
  }

  return (
    <div className="space-y-3">
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
        {stato !== 'rifiutato' && (
          <button
            onClick={() => setMostraNota(v => !v)}
            disabled={pending}
            className="bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-700 font-bold px-4 py-2 rounded-xl text-xs border border-red-200 transition-colors"
          >
            ❌ Rifiuta
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
            placeholder="Es: dati incompleti, organizzatore non identificabile…"
          />
          <button
            onClick={() => esegui('rifiutato', nota)}
            disabled={pending}
            className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-lg text-xs transition-colors"
          >
            Conferma rifiuto
          </button>
        </div>
      )}

      {errore && <p className="text-xs text-red-600">{errore}</p>}
    </div>
  )
}

// Toggle "pubblica senza approvazione" per organizzatori fidati
export function TogglePubblicazioneDiretta({
  organizzatoreId,
  valore,
}: {
  organizzatoreId: string
  valore: boolean
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [attuale, setAttuale] = useState(valore)
  const [errore, setErrore] = useState<string | null>(null)

  const cambia = () => {
    const nuovoValore = !attuale
    setAttuale(nuovoValore)
    setErrore(null)
    startTransition(async () => {
      const res = await togglePubblicazioneDiretta(organizzatoreId, nuovoValore)
      if (!res.ok) {
        setAttuale(!nuovoValore) // ripristina
        setErrore(res.errore ?? 'Errore')
      } else {
        router.refresh()
      }
    })
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={cambia}
        disabled={pending}
        title={attuale ? 'Pubblica direttamente (clicca per disattivare)' : 'Richiede approvazione (clicca per fidarti)'}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${
          attuale ? 'bg-green-500' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            attuale ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </button>
      <span className={`text-xs font-medium ${attuale ? 'text-green-700' : 'text-gray-400'}`}>
        {attuale ? 'Fidato' : 'Revisione'}
      </span>
      {errore && <span className="text-xs text-red-600">{errore}</span>}
    </div>
  )
}
