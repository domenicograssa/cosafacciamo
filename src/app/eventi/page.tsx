import type { Metadata } from 'next'
import EventiList from '@/components/events/EventiList'
import { getEventiApprovati } from '@/lib/queries/eventi'
import { getCategorie } from '@/lib/queries/categorie'
import { getComuni } from '@/lib/queries/geo'
import { getLang } from '@/lib/i18n/getLang'

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang()
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
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function EventiPage({ searchParams }: Props) {
  const params = await searchParams
  const lang = await getLang()
  const [eventi, categorie, comuni] = await Promise.all([
    getEventiApprovati({ lang }),
    getCategorie(lang),
    getComuni(),
  ])

  const primo = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? ''

  return (
    <EventiList
      eventi={eventi}
      categorie={categorie}
      comuni={comuni}
      filtriIniziali={{
        testo: primo(params.q),
        comune: primo(params.comune),
        data: primo(params.data),
        soloGratuiti: primo(params.gratuiti) === 'true',
        categorie: primo(params.categoria) ? [primo(params.categoria)] : [],
      }}
    />
  )
}
