'use client'

import Script from 'next/script'
import { useCookieConsent } from '@/components/ui/CookieBanner'

const GA_MEASUREMENT_ID = 'G-FF8FCVMKSZ'

// Carica Google Analytics (gtag.js) solo se l'utente ha prestato consenso
// ai cookie analitici tramite il CookieBanner. Reagisce in tempo reale
// alle modifiche di consenso (evento 'moesco:cookie-consent'), senza
// richiedere il reload della pagina.
export default function Analytics() {
  const consenso = useCookieConsent()

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
