'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useLang } from '@/lib/i18n/LanguageContext'
import {
  iscriviti,
  bannerDaMostrare,
  installa,
  suIOS,
  chiediPiuTardi,
  nonChiedereMai,
} from '@/lib/pwa/installazione'

const TESTI = {
  it: {
    titolo: 'Installa l’app di moesco',
    testo: 'Eventi sempre a portata di mano, anche con poca rete.',
    installa: 'Installa',
    comeFare: 'Come si fa',
    piuTardi: 'Più tardi',
    mai: 'Non chiedere più',
    chiudi: 'Chiudi',
  },
  en: {
    titolo: 'Install the moesco app',
    testo: 'Events always at hand, even with a weak connection.',
    installa: 'Install',
    comeFare: 'How to',
    piuTardi: 'Later',
    mai: 'Don’t ask again',
    chiudi: 'Close',
  },
}

/**
 * Invito discreto a installare l'app, in fondo allo schermo.
 *
 * Regole di rispetto dell'utente (volute esplicitamente):
 *  - "Non chiedere più" lo disattiva per sempre su quel dispositivo;
 *  - "Più tardi" lo rimanda di due settimane;
 *  - non compare se l'app è già installata, né prima che l'utente abbia
 *    risposto al banner cookie (per non impilare due banner).
 */
export default function BannerInstallaApp() {
  const { lang, href } = useLang()
  const t = TESTI[lang]
  const pathname = usePathname()
  const [visibile, setVisibile] = useState(false)

  // Sulla pagina /app il banner sarebbe ridondante: lì c'è già il riquadro
  // di installazione, e due inviti sovrapposti danno l'idea di insistenza.
  const suPaginaApp = pathname === '/app' || pathname === '/en/app'

  useEffect(() => {
    const aggiorna = () => setVisibile(bannerDaMostrare())
    // Piccolo ritardo: comparire immediatamente all'apertura è invadente e
    // copre il contenuto proprio mentre l'utente inizia a leggere.
    const timer = setTimeout(aggiorna, 3000)
    const annulla = iscriviti(aggiorna)
    return () => { clearTimeout(timer); annulla() }
  }, [])

  if (!visibile || suPaginaApp) return null

  const ios = suIOS()

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 p-3 sm:p-4">
      <div className="mx-auto flex max-w-2xl items-center gap-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-lg sm:p-4">
        <Image
          src="/icon-192.png"
          alt=""
          width={44}
          height={44}
          className="hidden shrink-0 rounded-xl border border-gray-200 sm:block"
        />

        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-gray-900">{t.titolo}</p>
          <p className="truncate text-xs text-gray-500">{t.testo}</p>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
            <button
              onClick={() => { chiediPiuTardi(); setVisibile(false) }}
              className="text-xs font-medium text-gray-500 hover:text-gray-700"
            >
              {t.piuTardi}
            </button>
            <button
              onClick={() => { nonChiedereMai(); setVisibile(false) }}
              className="text-xs font-medium text-gray-400 underline hover:text-gray-600"
            >
              {t.mai}
            </button>
          </div>
        </div>

        {ios ? (
          // Su iPhone non esiste installazione automatica: si rimanda alle
          // istruzioni sulla pagina dedicata.
          <Link
            href={href('/app')}
            onClick={() => setVisibile(false)}
            className="shrink-0 rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-500"
          >
            {t.comeFare}
          </Link>
        ) : (
          <button
            onClick={async () => { await installa(); setVisibile(false) }}
            className="shrink-0 rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-500"
          >
            {t.installa}
          </button>
        )}
      </div>
    </div>
  )
}
