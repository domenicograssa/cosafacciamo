'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { inviaMessaggio } from '@/app/actions/messaggi'

const TIPI = [
  { value: 'messaggio',      label: 'Messaggio generico' },
  { value: 'segnalazione',   label: 'Segnalazione contenuto' },
  { value: 'richiesta_gdpr', label: 'Richiesta privacy (GDPR)' },
  { value: 'collaborazione', label: 'Proposta di collaborazione' },
]

const inputCls =
  'w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-300'

export default function ModuloContatti() {
  const [pending, startTransition] = useTransition()
  const [esito, setEsito] = useState<'inviato' | string | null>(null)
  const [tipo, setTipo] = useState('messaggio')

  const invia = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    setEsito(null)
    startTransition(async () => {
      const res = await inviaMessaggio(fd)
      if (res.ok) {
        setEsito('inviato')
        form.reset()
        setTipo('messaggio')
      } else {
        setEsito(res.errore ?? 'Errore nell\'invio. Riprova.')
      }
    })
  }

  if (esito === 'inviato') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
        <div className="text-3xl mb-2">✅</div>
        <p className="font-bold text-green-800">Messaggio inviato!</p>
        <p className="text-sm text-green-700 mt-1">
          Grazie per averci scritto. Ti risponderemo all&apos;indirizzo email indicato il prima possibile.
        </p>
        <button
          onClick={() => setEsito(null)}
          className="mt-4 text-sm font-semibold text-green-700 underline hover:no-underline"
        >
          Invia un altro messaggio
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={invia} className="space-y-4">

      {/* Honeypot anti-spam: invisibile agli utenti */}
      <input
        type="text"
        name="sitoweb"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="ct-nome" className="block text-sm font-semibold text-gray-700 mb-1.5">
            Nome e cognome <span className="text-red-500">*</span>
          </label>
          <input id="ct-nome" name="nome" type="text" required maxLength={200} className={inputCls} placeholder="Il tuo nome" />
        </div>
        <div>
          <label htmlFor="ct-email" className="block text-sm font-semibold text-gray-700 mb-1.5">
            Email <span className="text-red-500">*</span>
          </label>
          <input id="ct-email" name="email" type="email" required maxLength={200} className={inputCls} placeholder="nome@esempio.it" />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="ct-tipo" className="block text-sm font-semibold text-gray-700 mb-1.5">
            Motivo del contatto
          </label>
          <select
            id="ct-tipo"
            name="tipo"
            value={tipo}
            onChange={e => setTipo(e.target.value)}
            className={inputCls}
          >
            {TIPI.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="ct-oggetto" className="block text-sm font-semibold text-gray-700 mb-1.5">
            Oggetto
          </label>
          <input id="ct-oggetto" name="oggetto" type="text" maxLength={200} className={inputCls} placeholder="Di cosa si tratta?" />
        </div>
      </div>

      {tipo === 'segnalazione' && (
        <div>
          <label htmlFor="ct-url" className="block text-sm font-semibold text-gray-700 mb-1.5">
            Link della pagina da segnalare
          </label>
          <input id="ct-url" name="urlPagina" type="url" maxLength={500} className={inputCls} placeholder="https://cosafacciamo.vercel.app/eventi/…" />
        </div>
      )}

      <div>
        <label htmlFor="ct-messaggio" className="block text-sm font-semibold text-gray-700 mb-1.5">
          Messaggio <span className="text-red-500">*</span>
        </label>
        <textarea
          id="ct-messaggio"
          name="messaggio"
          required
          rows={6}
          maxLength={4000}
          className={inputCls}
          placeholder="Scrivi qui il tuo messaggio…"
        />
      </div>

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          name="accettaPrivacy"
          value="true"
          required
          className="mt-1 w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-400"
        />
        <span className="text-xs text-gray-600 leading-relaxed">
          Ho letto l&apos;<Link href="/privacy-policy" className="text-amber-600 underline hover:no-underline">informativa privacy</Link> e
          acconsento al trattamento dei dati inseriti al solo fine di ricevere una risposta. <span className="text-red-500">*</span>
        </span>
      </label>

      {esito && esito !== 'inviato' && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{esito}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors"
      >
        {pending ? 'Invio in corso…' : 'Invia messaggio'}
      </button>
    </form>
  )
}
