'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const STORAGE_KEY = 'moesco_cookie_consent'

type ConsensoTipo = {
  tecnici: true       // sempre true, non modificabile
  analitici: boolean
  timestamp: number
}

function leggiConsenso(): ConsensoTipo | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function salvaConsenso(analitici: boolean) {
  const consenso: ConsensoTipo = { tecnici: true, analitici, timestamp: Date.now() }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(consenso))
  // Dispara un evento custom così altri componenti (es. Analytics) possono reagire
  window.dispatchEvent(new CustomEvent('moesco:cookie-consent', { detail: consenso }))
}

export default function CookieBanner() {
  const [visibile, setVisibile] = useState(false)
  const [mostraDettagli, setMostraDettagli] = useState(false)
  const [analitici, setAnalitici] = useState(false)

  useEffect(() => {
    // Mostra il banner solo se non c'è ancora una scelta registrata
    const consenso = leggiConsenso()
    if (!consenso) setVisibile(true)
  }, [])

  const accettaTutto = () => {
    salvaConsenso(true)
    setVisibile(false)
  }

  const rifiutaNonNecessari = () => {
    salvaConsenso(false)
    setVisibile(false)
  }

  const salvaPersonalizzato = () => {
    salvaConsenso(analitici)
    setVisibile(false)
  }

  if (!visibile) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Preferenze cookie"
      className="fixed bottom-0 left-0 right-0 z-[9999] bg-white border-t border-gray-200 shadow-2xl"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5">

        {!mostraDettagli ? (
          /* ── Vista compatta ── */
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 mb-0.5">
                Utilizziamo i cookie 🍪
              </p>
              <p className="text-xs text-gray-600 leading-relaxed">
                Usiamo cookie tecnici (necessari al funzionamento del sito) e, solo con il tuo consenso, cookie analitici per migliorare il servizio.
                Leggi la nostra{' '}
                <Link href="/cookie-policy" className="text-amber-600 underline hover:text-amber-700">
                  Cookie Policy
                </Link>{' '}
                e la{' '}
                <Link href="/privacy-policy" className="text-amber-600 underline hover:text-amber-700">
                  Privacy Policy
                </Link>.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={() => setMostraDettagli(true)}
                className="text-xs text-gray-500 hover:text-gray-700 underline px-2 py-1.5"
              >
                Personalizza
              </button>
              <button
                onClick={rifiutaNonNecessari}
                className="text-xs font-semibold border border-gray-300 hover:border-gray-500 text-gray-700 px-4 py-2 rounded-lg transition-colors"
              >
                Rifiuta non necessari
              </button>
              <button
                onClick={accettaTutto}
                className="text-xs font-bold bg-amber-400 hover:bg-amber-500 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Accetta tutto
              </button>
            </div>
          </div>
        ) : (
          /* ── Vista dettagliata (personalizza) ── */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-gray-900">Gestisci le preferenze sui cookie</p>
              <button
                onClick={() => setMostraDettagli(false)}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none"
                aria-label="Chiudi"
              >
                ×
              </button>
            </div>

            {/* Cookie tecnici */}
            <div className="flex items-start justify-between gap-4 bg-gray-50 rounded-xl p-4">
              <div>
                <p className="text-sm font-semibold text-gray-900">Cookie tecnici</p>
                <p className="text-xs text-gray-600 mt-0.5">
                  Necessari per il funzionamento del sito (autenticazione, preferenze). Non possono essere disabilitati.
                </p>
              </div>
              <div className="shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">
                  Sempre attivi
                </span>
              </div>
            </div>

            {/* Cookie analitici */}
            <div className="flex items-start justify-between gap-4 bg-gray-50 rounded-xl p-4">
              <div>
                <p className="text-sm font-semibold text-gray-900">Cookie analitici</p>
                <p className="text-xs text-gray-600 mt-0.5">
                  Ci aiutano a capire come gli utenti usano il sito (es. Google Analytics). I dati sono aggregati e anonimi.
                </p>
              </div>
              <button
                role="switch"
                aria-checked={analitici}
                onClick={() => setAnalitici(v => !v)}
                className={`shrink-0 mt-0.5 relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-1 ${analitici ? 'bg-amber-400' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${analitici ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
              <button
                onClick={rifiutaNonNecessari}
                className="text-xs font-semibold border border-gray-300 hover:border-gray-500 text-gray-700 px-4 py-2 rounded-lg transition-colors"
              >
                Rifiuta non necessari
              </button>
              <button
                onClick={salvaPersonalizzato}
                className="text-xs font-bold bg-amber-400 hover:bg-amber-500 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Salva preferenze
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Hook esportato per altri componenti che devono reagire al consenso
export function useCookieConsent() {
  const [consenso, setConsenso] = useState<ConsensoTipo | null>(null)

  useEffect(() => {
    setConsenso(leggiConsenso())
    const handler = (e: Event) => setConsenso((e as CustomEvent<ConsensoTipo>).detail)
    window.addEventListener('moesco:cookie-consent', handler)
    return () => window.removeEventListener('moesco:cookie-consent', handler)
  }, [])

  return consenso
}

// Componente per riaprire il banner (usato nel footer)
export function RiapriCookieBanner({ label = 'Gestisci preferenze cookie' }: { label?: string }) {
  const apri = () => {
    localStorage.removeItem('moesco_cookie_consent')
    window.location.reload()
  }
  return (
    <button onClick={apri} className="hover:text-amber-600 transition-colors">
      {label}
    </button>
  )
}
