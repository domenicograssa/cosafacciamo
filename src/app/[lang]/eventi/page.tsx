import type { Metadata } from 'next'
import EventiList from '@/components/events/EventiList'
import { getEventiApprovati } from '@/lib/queries/eventi'
import { getCategorie } from '@/lib/queries/categorie'
import { getComuni } from '@/lib/queries/geo'
import { langDaParams } from '@/lib/i18n/getLang'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = await langDaParams(params)
  const isEn = lang === 'en'
  const title = isEn
    ? 'Events around the province of Trapani'
    : 'Eventi in provincia di Trapani e dintorni'
  const description = isEn
    ? 'Find up-to-date events around the province of Trapani: concerts, festivals, shows, cinema, theatre and things to do in your free time.'
    : 'Trova eventi aggiornati in provincia di Trapani e dintorni: concerti, sagre, festival, spettacoli, cinema, teatro e appuntamenti per il tempo libero.'
  const url = isEn ? 'https://www.moesco.it/en/eventi' : 'https://www.moesco.it/eventi'

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: { 'it': 'https://www.moesco.it/eventi', 'en': 'https://www.moesco.it/en/eventi' },
    },
    openGraph: { title: `${title} — Moesco`, description, url, type: 'website' },
  }
}

interface Props {
  params: Promise<{ lang: string }>
}

// Pagina statica, rigenerata al massimo una volta l'ora (come le schede).
// I filtri dell'indirizzo (?comune=…, ?q=… dalla ricerca in homepage) li
// legge EventiList nel browser: leggerli qui renderebbe la pagina dinamica.
export const revalidate = 3600

export default async function EventiPage({ params }: Props) {
  const lang = await langDaParams(params)
  const [eventi, categorie, comuni] = await Promise.all([
    getEventiApprovati({ lang }),
    getCategorie(lang),
    getComuni(),
  ])

  return (
    <EventiList
      eventi={eventi}
      categorie={categorie}
      comuni={comuni}
      leggiFiltriDaUrl
    />
  )
}
