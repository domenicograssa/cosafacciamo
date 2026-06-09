import AttivitaList from '@/components/activities/AttivitaList'
import { getAttivita } from '@/lib/queries/attivita'
import { getCategorie } from '@/lib/queries/categorie'
import { getComuni } from '@/lib/queries/geo'

export const revalidate = 3600

export const metadata = {
  title: 'Cosa fare — cosafacciamo',
  description: 'Scopri le migliori attività permanenti ad Alcamo, Castellammare del Golfo, San Vito Lo Capo e in tutta la provincia di Trapani.',
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
