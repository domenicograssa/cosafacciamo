import AttivitaList from '@/components/activities/AttivitaList'
import { getAttivita } from '@/lib/queries/attivita'
import { getCategorie } from '@/lib/queries/categorie'
import { getComuni } from '@/lib/queries/geo'

export const revalidate = 3600

export const metadata = {
  title: 'Esperienze — moesco',
  description: 'Snorkeling, corsi di cucina, giri in barca, escursioni: le esperienze da vivere nella provincia di Trapani.',
}

export default async function CosaFarePage() {
  const [attivita, categorie, comuni] = await Promise.all([
    getAttivita(),
    getCategorie(),
    getComuni(),
  ])

  return (
    <AttivitaList
      attivita={attivita}
      categorie={categorie}
      comuni={comuni}
    />
  )
}
