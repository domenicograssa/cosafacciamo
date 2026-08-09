'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import { useLang } from '@/lib/i18n/LanguageContext'
import {
  iscriviti,
  promptDisponibile,
  inModalitaApp,
  suIOS,
  installa,
  invitoDisattivato,
  riattivaInvito,
} from '@/lib/pwa/installazione'

const TESTI = {
  it: {
    titolo: 'Installa moesco sul telefono',
    sottotitolo: 'Aggiungi il portale alla schermata home: si apre a schermo intero, come un’app.',
    installa: 'Installa app',
    installaIos: 'Come installarla su iPhone',
    giaInstallata: '✓ App già installata su questo dispositivo',
    apriDaTelefono:
      'Stai usando un computer: l’installazione ha senso su telefono o tablet. Apri www.moesco.it/app dal browser del dispositivo per installarla.',
    istruzioniIos:
      'Tocca il pulsante Condividi (il quadrato con la freccia verso l’alto) in fondo allo schermo, scorri e scegli «Aggiungi a Home», poi conferma con «Aggiungi».',
    nonRichiesto: 'Il tuo browser non offre l’installazione automatica: puoi comunque aggiungere il sito alla schermata home dal menu del browser.',
    invitoSpento: 'Hai scelto di non ricevere più l’invito a installare l’app.',
    riattiva: 'Mostra di nuovo l’invito',
  },
  en: {
    titolo: 'Install moesco on your phone',
    sottotitolo: 'Add the portal to your home screen: it opens full screen, like an app.',
    installa: 'Install app',
    installaIos: 'How to install it on iPhone',
    giaInstallata: '✓ App already installed on this device',
    apriDaTelefono:
      'You are on a computer: installing makes sense on a phone or tablet. Open www.moesco.it/app from your device browser to install it.',
    istruzioniIos:
      'Tap the Share button (the square with an arrow pointing up) at the bottom of the screen, scroll and choose “Add to Home Screen”, then confirm with “Add”.',
    nonRichiesto: 'Your browser does not offer automatic installation, but you can still add the site to your home screen from the browser menu.',
    invitoSpento: 'You chose not to see the install invitation any more.',
    riattiva: 'Show the invitation again',
  },
}

// Si sottoscrive al modulo condiviso: così il componente reagisce anche se
// l'evento beforeinstallprompt è arrivato PRIMA che venisse montato.
function usaStatoInstallazione() {
  return useSyncExternalStore(
    iscriviti,
    () => `${promptDisponibile()}|${inModalitaApp()}|${invitoDisattivato()}`,
    () => 'false|false|false' // valore lato server: nessun accesso a window
  )
}

export default function InstallaApp() {
  const { lang } = useLang()
  const t = TESTI[lang]
  usaStatoInstallazione()

  // Evita il mismatch di hydration: al primo render lato client mostriamo lo
  // stesso markup del server, poi rileggiamo lo stato reale del dispositivo.
  const [montato, setMontato] = useState(false)
  useEffect(() => setMontato(true), [])

  const [mostraIstruzioni, setMostraIstruzioni] = useState(false)

  if (!montato) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">{t.titolo}</h2>
        <p className="mt-1 text-sm text-gray-600">{t.sottotitolo}</p>
      </div>
    )
  }

  if (inModalitaApp()) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
        <p className="font-semibold text-green-800">{t.giaInstallata}</p>
      </div>
    )
  }

  const nativo = promptDisponibile()
  const ios = suIOS()
  const desktop = !ios && !/android|mobile|tablet/i.test(navigator.userAgent)

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900">{t.titolo}</h2>
      <p className="mt-1 text-sm text-gray-600">{t.sottotitolo}</p>

      {/* Il pulsante c'è SEMPRE. Se il browser offre l'installazione nativa la
          lancia; altrimenti apre le istruzioni manuali. Prima il pulsante
          compariva solo col prompt nativo disponibile e su molti dispositivi
          non si vedeva affatto. */}
      <button
        onClick={async () => {
          if (nativo) {
            const esito = await installa()
            if (esito === null) setMostraIstruzioni(true)
          } else {
            setMostraIstruzioni((v) => !v)
          }
        }}
        className="mt-4 rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-500"
      >
        {nativo ? t.installa : ios ? t.installaIos : t.installa}
      </button>

      {mostraIstruzioni && !nativo && (
        <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-gray-700">
          {ios ? t.istruzioniIos : desktop ? t.apriDaTelefono : t.nonRichiesto}
        </p>
      )}

      {invitoDisattivato() && (
        <p className="mt-4 border-t border-gray-100 pt-3 text-xs text-gray-500">
          {t.invitoSpento}{' '}
          <button onClick={riattivaInvito} className="font-semibold text-amber-600 underline hover:text-amber-700">
            {t.riattiva}
          </button>
        </p>
      )}
    </div>
  )
}
