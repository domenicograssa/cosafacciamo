import HomepageClient from '@/components/home/HomepageClient'
import { getEventiHome } from '@/lib/queries/eventi'
import { getCategorie } from '@/lib/queries/categorie'
import { getComuni } from '@/lib/queries/geo'

export const revalidate = 300 // ricarica ogni 5 minuti

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
