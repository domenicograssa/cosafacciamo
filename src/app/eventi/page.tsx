import EventiList from '@/components/events/EventiList'
import { getEventiApprovati } from '@/lib/queries/eventi'
import { getCategorie } from '@/lib/queries/categorie'
import { getComuni } from '@/lib/queries/geo'

export const metadata = {
  title: 'Eventi in provincia di Trapani',
  description: 'Trova eventi aggiornati in provincia di Trapani: concerti, sagre, festival, spettacoli, cinema, teatro e appuntamenti per il tempo libero.',
  alternates: { canonical: 'https://www.moesco.it/eventi' },
  openGraph: {
    title: 'Eventi in provincia di Trapani — Moesco',
    description: 'Trova eventi aggiornati in provincia di Trapani: concerti, sagre, festival, spettacoli, cinema, teatro e appuntamenti per il tempo libero.',
    url: 'https://www.moesco.it/eventi',
    type: 'website',
  },
}

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function EventiPage({ searchParams }: Props) {
  const params = await searchParams
  const [eventi, categorie, comuni] = await Promise.all([
    getEventiApprovati(),
    getCategorie(),
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
