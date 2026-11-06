import AttivitaList from '@/components/activities/AttivitaList'
import { getAttivita } from '@/lib/queries/attivita'
import { getCategorie } from '@/lib/queries/categorie'
import { getComuni } from '@/lib/queries/geo'
import { langDaParams } from '@/lib/i18n/getLang'

export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const lang = await langDaParams(params)
  return lang === 'en'
    ? {
        title: 'Experiences — moesco',
        description: 'Snorkeling, cooking classes, boat trips, excursions: experiences to live in and around the province of Trapani.',
      }
    : {
        title: 'Esperienze — moesco',
        description: 'Snorkeling, corsi di cucina, giri in barca, escursioni: le esperienze da vivere nella provincia di Trapani e dintorni.',
      }
}

export default async function CosaFarePage({ params }: { params: Promise<{ lang: string }> }) {
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
