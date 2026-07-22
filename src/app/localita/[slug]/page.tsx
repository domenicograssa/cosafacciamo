import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { getGeoNodoBySlug, getComuni } from '@/lib/queries/geo'
import { getEventiApprovati } from '@/lib/queries/eventi'
import { getAttivita } from '@/lib/queries/attivita'
import { getCategorie } from '@/lib/queries/categorie'
import EventiList from '@/components/events/EventiList'
import ActivityCard from '@/components/activities/ActivityCard'
import { COMUNE_IMMAGINI, COMUNE_SLIDES } from '@/data/comuni-immagini'
import HeroSlideshow from '@/components/localita/HeroSlideshow'
import { getLang } from '@/lib/i18n/getLang'
import { strings } from '@/lib/i18n/strings'

export const revalidate = 3600

export async function generateStaticParams() {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data } = await sb.from('geo_nodi').select('slug').eq('tipo', 'comune')
  return (data ?? []).map(n => ({ slug: n.slug }))
}

interface Props {
  params: Promise<{ slug: string }>
}

const COVER_COMUNI: Record<string, { immagine: string; descrizione: string; descrizioneEn: string; emoji: string }> = {
  // immagine: usa il fallback da COMUNE_IMMAGINI (Castello dei Conti di Modica, Wikimedia Commons)
  'alcamo':                  { immagine: '', descrizione: 'Borgo medievale alle pendici del Monte Bonifato, con il suo storico castello e i vigneti dell\'Alcamo DOC.', descrizioneEn: 'A medieval village on the slopes of Monte Bonifato, with its historic castle and the vineyards of Alcamo DOC.', emoji: '🏰' },
  // photo-1756990901059-90f464223f3f — "Coastal town with harbor at sunset" (Gabriele Merlino / Unsplash, castellammare del golfo)
  'castellammare-del-golfo': { immagine: 'https://images.unsplash.com/photo-1756990901059-90f464223f3f?w=1400&q=80', descrizione: 'Incantevole cittadina affacciata sul golfo omonimo, porta d\'accesso alla Riserva dello Zingaro.', descrizioneEn: 'A charming town overlooking the gulf that shares its name, gateway to the Zingaro Nature Reserve.', emoji: '⛵' },
  // photo-1730193488340-0af0fe404306 — "An aerial view of a beach and ocean" (Paul Sebastian Saliba / Unsplash, san vito lo capo)
  'san-vito-lo-capo':        { immagine: 'https://images.unsplash.com/photo-1730193488340-0af0fe404306?w=1400&q=80', descrizione: 'Famosa per la sua spiaggia di sabbia bianca e il Cous Cous Fest, una delle più belle mete balneari di Sicilia.', descrizioneEn: 'Famous for its white sand beach and the Cous Cous Fest, one of the most beautiful seaside destinations in Sicily.', emoji: '🏖️' },
  // photo-1677967062355-b951f29c66e8 — "the sun shines brightly behind the ruins of a temple" (Antonio Sessa / Unsplash, segesta sicily)
  'calatafimi-segesta':      { immagine: 'https://images.unsplash.com/photo-1677967062355-b951f29c66e8?w=1400&q=80', descrizione: 'Custode del Teatro Greco e del Tempio dorico di Segesta, tra i siti archeologici più suggestivi di Sicilia.', descrizioneEn: 'Home to the Greek Theatre and the Doric Temple of Segesta, among the most striking archaeological sites in Sicily.', emoji: '🏛️' },
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const lang = await getLang()
  const isEn = lang === 'en'
  const nodo = await getGeoNodoBySlug(slug)
  if (!nodo) return {}
  const canonicalUrl = isEn ? `https://www.moesco.it/en/localita/${slug}` : `https://www.moesco.it/localita/${slug}`
  const description = isEn
    ? `Discover events, festivals, concerts and things to do in ${nodo.nome}.`
    : slug === 'palermo'
    ? `Scopri eventi, sagre, concerti e cose da fare a Palermo.`
    : `Scopri eventi, sagre, concerti e cose da fare a ${nodo.nome}, in provincia di Trapani.`
  const title = isEn ? `Events in ${nodo.nome}` : `Eventi a ${nodo.nome}`
  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: { 'it': `https://www.moesco.it/localita/${slug}`, 'en': `https://www.moesco.it/en/localita/${slug}` },
    },
    openGraph: {
      title: `${title} — Moesco`,
      description,
      url: canonicalUrl,
      type: 'website',
    },
  }
}

export default async function LocalitaPage({ params }: Props) {
  const { slug } = await params
  const lang = await getLang()
  const t = strings[lang]
  const [nodo, tuttiComuni, categorie] = await Promise.all([
    getGeoNodoBySlug(slug),
    getComuni(),
    getCategorie(lang),
  ])
  if (!nodo) notFound()

  const [eventiLocali, attivitaLocali] = await Promise.all([
    getEventiApprovati({ geoPath: nodo.path, lang }),
    getAttivita({ geoNodoId: nodo.id }),
  ])
  const altriComuni = tuttiComuni.filter(c => c.slug !== slug)
  const info = COVER_COMUNI[slug] ?? { immagine: '', descrizione: '', descrizioneEn: '', emoji: '📍' }
  const descrizioneInfo = lang === 'en' && info.descrizioneEn ? info.descrizioneEn : info.descrizione

  // Priorità: COMUNE_SLIDES (più foto) → COVER_COMUNI/COMUNE_IMMAGINI (1 foto) → nessuna foto
  const slides = (() => {
    if (COMUNE_SLIDES[slug]?.length) return COMUNE_SLIDES[slug]
    const fallbackUrl = info.immagine || COMUNE_IMMAGINI[slug]?.url || ''
    if (!fallbackUrl) return []
    const fallbackFoto = COMUNE_IMMAGINI[slug]
    return [{
      url: fallbackUrl,
      alt: fallbackFoto?.alt ?? `${nodo.nome}`,
      credito: fallbackFoto?.credito ?? '',
      creditoUrl: fallbackFoto?.creditoUrl,
    }]
  })()

  return (
    <>
      <section className="relative h-64 sm:h-80 flex items-end bg-gray-800 overflow-hidden">
        {/* Slideshow o sfondo statico */}
        {slides.length > 0 ? (
          <HeroSlideshow slides={slides} />
        ) : null}

        {/* Gradiente overlay sempre presente */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10 pointer-events-none" />

        <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-8">
          <nav className="flex items-center gap-2 text-xs text-white/60 mb-3">
            <Link href={lang === 'en' ? '/en' : '/'} className="hover:text-white">{t.event.breadcrumbHome}</Link>
            <span>›</span>
            <Link href={lang === 'en' ? '/en/localita' : '/localita'} className="hover:text-white">{t.nav.locations}</Link>
            <span>›</span>
            <span className="text-white">{nodo.nome}</span>
          </nav>
          <div className="flex items-end gap-4">
            <span className="text-5xl">{info.emoji}</span>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white">{nodo.nome}</h1>
              <p className="text-white/70 text-sm mt-1 max-w-xl">{descrizioneInfo}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 grid grid-cols-4 gap-2">
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-extrabold text-amber-500">{eventiLocali.length}</p>
            <p className="text-[10px] sm:text-xs text-gray-500">{t.localita.events}</p>
          </div>
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-extrabold text-blue-500">{attivitaLocali.length}</p>
            <p className="text-[10px] sm:text-xs text-gray-500">{t.localita.activities}</p>
          </div>
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-extrabold text-green-500">{eventiLocali.filter(e => e.gratuito).length}</p>
            <p className="text-[10px] sm:text-xs text-gray-500">{t.localita.free}</p>
          </div>
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-extrabold text-purple-500">
              {new Set(eventiLocali.flatMap(e => e.categorie.map(c => c.slug))).size}
            </p>
            <p className="text-[10px] sm:text-xs text-gray-500">{t.localita.categories}</p>
          </div>
        </div>
      </section>

      <EventiList
        eventi={eventiLocali}
        categorie={categorie}
        comuni={[nodo]}
        titoloIniziale={`${t.localita.eventsIn} ${nodo.nome}`}
      />

      {/* Sezione attività permanenti */}
      {attivitaLocali.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-gray-900">{t.localita.whatToDoIn} {nodo.nome}</h2>
            <Link
              href={`${lang === 'en' ? '/en' : ''}/cosa-fare?comune=${nodo.slug}`}
              className="text-sm text-amber-600 font-semibold hover:underline"
            >
              {t.localita.seeAll}
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {attivitaLocali.slice(0, 8).map(a => (
              <ActivityCard key={a.id} attivita={a} />
            ))}
          </div>
        </section>
      )}

      {altriComuni.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <h2 className="text-lg font-bold text-gray-900 mb-4">{t.localita.exploreOther}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {altriComuni.map(c => {
              const ci = COVER_COMUNI[c.slug]
              const ciDescrizione = lang === 'en' && ci?.descrizioneEn ? ci.descrizioneEn : ci?.descrizione
              return (
                <Link key={c.id} href={`${lang === 'en' ? '/en' : ''}/localita/${c.slug}`} className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow group">
                  <span className="text-3xl">{ci?.emoji ?? '📍'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 group-hover:text-amber-600 transition-colors">{c.nome}</p>
                    <p className="text-xs text-gray-500 truncate">{ciDescrizione ?? ''}</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )
            })}
          </div>
        </section>
      )}
    </>
  )
}
