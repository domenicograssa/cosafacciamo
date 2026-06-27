import type { Metadata } from 'next'
import HomepageClient from '@/components/home/HomepageClient'
import { getEventiHome } from '@/lib/queries/eventi'
import { getCategorie } from '@/lib/queries/categorie'
import { getComuni } from '@/lib/queries/geo'

export const revalidate = 300 // ricarica ogni 5 minuti

export const metadata: Metadata = {
  title: 'Moesco — Eventi, sagre, concerti e cose da fare in provincia di Trapani',
  description: 'Scopri eventi, sagre, concerti, festival, teatro, mercatini e cose da fare oggi e nei prossimi giorni in provincia di Trapani.',
  alternates: { canonical: 'https://www.moesco.it' },
  openGraph: {
    title: 'Moesco — Eventi in provincia di Trapani',
    description: 'Scopri eventi, sagre, concerti, festival, teatro, mercatini e cose da fare oggi e nei prossimi giorni in provincia di Trapani.',
    url: 'https://www.moesco.it',
    type: 'website',
  },
}

export default async function Homepage() {
  const [eventiOggi, categorie, comuni] = await Promise.all([
    getEventiHome(10),
    getCategorie(),
    getComuni(),
  ])

  return (
    <HomepageClient
      eventiOggi={eventiOggi}
      categorie={categorie}
      comuni={comuni}
    />
  )
}
