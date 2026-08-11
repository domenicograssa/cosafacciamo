'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { useCookieConsent } from '@/components/ui/CookieBanner'

const GA_MEASUREMENT_ID = 'G-FF8FCVMKSZ'

// Aree di lavoro interne: non sono il sito visto dal pubblico e le loro
// visite non dicono nulla su come vanno gli eventi.
const AREE_INTERNE = ['/admin', '/dashboard', '/accedi']

// Carica Google Analytics (gtag.js) solo se l'utente ha prestato consenso
// ai cookie analitici tramite il CookieBanner. Reagisce in tempo reale
// alle modifiche di consenso (evento 'moesco:cookie-consent'), senza
// richiedere il reload della pagina.
//
// ESCLUSIONE DELLE PAGINE INTERNE (11/8/2026): nel report GA dei 28 giorni al
// 10/8/2026 la pagina più vista dell'intero sito risultava «Admin — moesco»,
// con 577 visualizzazioni su circa 1.050 totali e 708 dei 2.000 eventi
// registrati. Erano le sessioni di lavoro sul pannello di amministrazione:
// più della metà delle statistiche misurava chi gestisce il sito invece di
// chi lo visita, falsando pagine più lette, durata media e conteggio eventi.
// Qui il tracciamento viene semplicemente non caricato su quelle pagine.
//
// NB: questo esclude le aree riservate, non le visite del gestore alle pagine
// pubbliche. Per quelle serve la regola «traffico interno» in GA4
// (Amministrazione → Flussi di dati → Impostazioni tag → Definisci traffico
// interno, con il proprio indirizzo IP).
export default function Analytics() {
  const consenso = useCookieConsent()
  const pathname = usePathname()

  const interna = AREE_INTERNE.some(p => pathname === p || pathname.startsWith(p + '/'))
  if (interna) return null

  if (!consenso?.analitici) return null

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  )
}
