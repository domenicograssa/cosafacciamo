import EventiList from '@/components/events/EventiList'
import { getEventiApprovati } from '@/lib/queries/eventi'
import { getCategorie } from '@/lib/queries/categorie'
import { getComuni } from '@/lib/queries/geo'

export const metadata = {
  title: 'Eventi — moesco',
  description: 'Tutti gli eventi ad Alcamo, Castellammare del Golfo, San Vito Lo Capo e dintorni.',
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
