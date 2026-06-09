import EventiList from '@/components/events/EventiList'
import { getEventiApprovati } from '@/lib/queries/eventi'
import { getCategorie } from '@/lib/queries/categorie'
import { getComuni } from '@/lib/queries/geo'

export const revalidate = 300

export const metadata = {
  title: 'Eventi — cosafacciamo',
  description: 'Tutti gli eventi ad Alcamo, Castellammare del Golfo, San Vito Lo Capo e dintorni.',
}

export default async function EventiPage() {
  const [eventi, categorie, comuni] = await Promise.all([
    getEventiApprovati(),
    getCategorie(),
    getComuni(),
  ])

  return (
    <EventiList
      eventi={eventi}
      categorie={categorie}
      comuni={comuni}
    />
  )
}
