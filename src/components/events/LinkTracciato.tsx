'use client'

// Link esterno (biglietti, sito ufficiale, ecc.) che manda un evento GA4
// prima di aprire la pagina — sono le azioni più vicine a una "conversione"
// per un portale di eventi, da marcare come eventi chiave in GA4 una volta
// che iniziano a comparire nei report (Amministrazione → Eventi).
import { tracciaEventoGA } from '@/lib/analytics/traccia'

interface LinkTracciatoProps {
  href: string
  evento: string
  parametri?: Record<string, unknown>
  className?: string
  children: React.ReactNode
}

export default function LinkTracciato({ href, evento, parametri, className, children }: LinkTracciatoProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => tracciaEventoGA(evento, parametri)}
    >
      {children}
    </a>
  )
}
