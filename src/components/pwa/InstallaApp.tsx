'use client'

import { useEffect, useState } from 'react'
import { useLang } from '@/lib/i18n/LanguageContext'

// Evento non standard (solo Chromium) che il browser emette quando il sito è
// installabile: intercettandolo possiamo mostrare un pulsante nostro invece di
// lasciare l'installazione nascosta nel menu del browser.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const TESTI = {
  it: {
    titolo: 'Installa moesco sul telefono',
    sottotitolo: 'Aggiungi il portale alla schermata home: si apre a schermo intero, come un’app.',
    installa: 'Installa app',
    giaInstallata: 'App già installata su questo dispositivo ✓',
    istruzioniIos: 'Su iPhone e iPad: tocca il pulsante Condividi in basso, poi «Aggiungi a Home».',
    istruzioniAltro: 'Apri questa pagina dal browser del telefono per installare l’app.',
  },
  en: {
    titolo: 'Install moesco on your phone',
    sottotitolo: 'Add the portal to your home screen: it opens full screen, like an app.',
    installa: 'Install app',
    giaInstallata: 'App already installed on this device ✓',
    istruzioniIos: 'On iPhone and iPad: tap the Share button, then “Add to Home Screen”.',
    istruzioniAltro: 'Open this page from your phone’s browser to install the app.',
  },
}

export default function InstallaApp() {
  const { lang } = useLang()
  const t = TESTI[lang]

  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [installata, setInstallata] = useState(false)
  const [iOS, setIOS] = useState(false)

  useEffect(() => {
    // display-mode: standalone significa che stiamo già girando come app.
    if (window.matchMedia('(display-mode: standalone)').matches) setInstallata(true)

    setIOS(/iphone|ipad|ipod/i.test(navigator.userAgent))

    const onPrompt = (e: Event) => {
      // Va bloccato il mini-banner automatico di Chrome, altrimenti compare
      // due volte (il suo e il nostro).
      e.preventDefault()
      setPrompt(e as BeforeInstallPromptEvent)
    }
    const onInstallata = () => { setInstallata(true); setPrompt(null) }

    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstallata)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstallata)
    }
  }, [])

  if (installata) {
    return <p className="text-sm font-semibold text-green-700">{t.giaInstallata}</p>
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900">{t.titolo}</h2>
      <p className="mt-1 text-sm text-gray-600">{t.sottotitolo}</p>

      {prompt ? (
        <button
          onClick={async () => {
            await prompt.prompt()
            const scelta = await prompt.userChoice
            if (scelta.outcome === 'accepted') setInstallata(true)
            setPrompt(null)
          }}
          className="mt-4 rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-500"
        >
          {t.installa}
        </button>
      ) : (
        // Safari/iOS non espone beforeinstallprompt: lì l'unica via è spiegare
        // il gesto manuale, altrimenti l'utente iPhone resta senza istruzioni.
        <p className="mt-4 text-sm text-gray-500">{iOS ? t.istruzioniIos : t.istruzioniAltro}</p>
      )}
    </div>
  )
}
