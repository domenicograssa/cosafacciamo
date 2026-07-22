import type { Metadata } from 'next'
import HomepageClient from '@/components/home/HomepageClient'
import { getEventiHome, getEventiInEvidenza } from '@/lib/queries/eventi'
import { getCategorie } from '@/lib/queries/categorie'
import { getComuni } from '@/lib/queries/geo'
import { getLang } from '@/lib/i18n/getLang'

export const revalidate = 300 // ricarica ogni 5 minuti

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang()
  const isEn = lang === 'en'
  const title = isEn
    ? 'Moesco — Events, festivals, concerts and things to do around Trapani, Sicily'
    : 'Moesco — Eventi, sagre, concerti e cose da fare in provincia di Trapani e dintorni'
  const description = isEn
    ? 'Discover events, festivals, concerts, theatre and markets happening today and in the coming days around the province of Trapani, Sicily.'
    : 'Scopri eventi, sagre, concerti, festival, teatro, mercatini e cose da fare oggi e nei prossimi giorni in provincia di Trapani e dintorni.'
  const url = isEn ? 'https://www.moesco.it/en' : 'https://www.moesco.it'

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: { 'it': 'https://www.moesco.it', 'en': 'https://www.moesco.it/en' },
    },
    openGraph: { title, description, url, type: 'website' },
  }
}

export default async function Homepage() {
  const lang = await getLang()
  const [eventiOggi, categorie, comuni, articoliInEvidenza] = await Promise.all([
    getEventiHome(10, lang),
    getCategorie(lang),
    getComuni(),
    getEventiInEvidenza(3, lang),
  ])

  return (
    <HomepageClient
      eventiOggi={eventiOggi}
      categorie={categorie}
      comuni={comuni}
      articoliInEvidenza={articoliInEvidenza}
    />
  )
}
