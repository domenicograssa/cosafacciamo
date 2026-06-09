import HomepageClient from '@/components/home/HomepageClient'
import { getEventiApprovati } from '@/lib/queries/eventi'
import { getCategorie } from '@/lib/queries/categorie'
import { getComuni } from '@/lib/queries/geo'

export const revalidate = 300 // ricarica ogni 5 minuti

export default async function Homepage() {
  const [eventiOggi, categorie, comuni] = await Promise.all([
    getEventiApprovati({ limit: 10 }),
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
