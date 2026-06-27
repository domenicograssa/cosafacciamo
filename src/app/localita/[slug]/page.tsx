import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { getGeoNodoBySlug, getComuni } from '@/lib/queries/geo'
import { getEventiApprovati } from '@/lib/queries/eventi'
import { getAttivita } from '@/lib/queries/attivita'
import { getCategorie } from '@/lib/queries/categorie'
import EventiList from '@/components/events/EventiList'
import ActivityCard from '@/components/activities/ActivityCard'
import { COMUNE_IMMAGINI } from '@/data/comuni-immagini'

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

const COVER_COMUNI: Record<string, { immagine: string; descrizione: string; emoji: string }> = {
  // immagine: usa il fallback da COMUNE_IMMAGINI (Castello dei Conti di Modica, Wikimedia Commons)
  'alcamo':                  { immagine: '', descrizione: 'Borgo medievale alle pendici del Monte Bonifato, con il suo storico castello e i vigneti dell\'Alcamo DOC.', emoji: '🏰' },
  // photo-1756990901059-90f464223f3f — "Coastal town with harbor at sunset" (Gabriele Merlino / Unsplash, castellammare del golfo)
  'castellammare-del-golfo': { immagine: 'https://images.unsplash.com/photo-1756990901059-90f464223f3f?w=1400&q=80', descrizione: 'Incantevole cittadina affacciata sul golfo omonimo, porta d\'accesso alla Riserva dello Zingaro.', emoji: '⛵' },
  // photo-1730193488340-0af0fe404306 — "An aerial view of a beach and ocean" (Paul Sebastian Saliba / Unsplash, san vito lo capo)
  'san-vito-lo-capo':        { immagine: 'https://images.unsplash.com/photo-1730193488340-0af0fe404306?w=1400&q=80', descrizione: 'Famosa per la sua spiaggia di sabbia bianca e il Cous Cous Fest, una delle più belle mete balneari di Sicilia.', emoji: '🏖️' },
  // photo-1677967062355-b951f29c66e8 — "the sun shines brightly behind the ruins of a temple" (Antonio Sessa / Unsplash, segesta sicily)
  'calatafimi-segesta':      { immagine: 'https://images.unsplash.com/photo-1677967062355-b951f29c66e8?w=1400&q=80', descrizione: 'Custode del Teatro Greco e del Tempio dorico di Segesta, tra i siti archeologici più suggestivi di Sicilia.', emoji: '🏛️' },
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const nodo = await getGeoNodoBySlug(slug)
  if (!nodo) return {}
  const canonicalUrl = `https://www.moesco.it/localita/${slug}`
  const description = `Scopri eventi, sagre, concerti e cose da fare a ${nodo.nome}, in provincia di Trapani.`
  return {
    title: `Eventi a ${nodo.nome}`,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `Eventi a ${nodo.nome} — Moesco`,
      description,
      url: canonicalUrl,
      type: 'website',
    },
  }
}

export default async function LocalitaPage({ params }: Props) {
  const { slug } = await params
  const [nodo, tuttiComuni, categorie] = await Promise.all([
    getGeoNodoBySlug(slug),
    getComuni(),
    getCategorie(),
  ])
  if (!nodo) notFound()

  const [eventiLocali, attivitaLocali] = await Promise.all([
    getEventiApprovati({ geoPath: nodo.path }),
    getAttivita({ geoNodoId: nodo.id }),
  ])
  const altriComuni = tuttiComuni.filter(c => c.slug !== slug)
  const info = COVER_COMUNI[slug] ?? { immagine: '', descrizione: '', emoji: '📍' }
  const fotoComune = COMUNE_IMMAGINI[slug]
  const heroImmagine = info.immagine || fotoComune?.url || ''

  return (
    <>
      <section
        className="relative h-64 sm:h-80 flex items-end bg-gray-800 overflow-hidden"
        style={heroImmagine ? { backgroundImage: `url(${heroImmagine})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        {!info.immagine && fotoComune && (
          <a
            href={fotoComune.creditoUrl ?? '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-2 right-3 z-10 text-[10px] text-white/60 hover:text-white/90"
          >
            Foto: {fotoComune.credito}
          </a>
        )}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-8">
          <nav className="flex items-center gap-2 text-xs text-white/60 mb-3">
            <Link href="/" className="hover:text-white">Home</Link>
            <span>›</span>
            <Link href="/localita" className="hover:text-white">Località</Link>
            <span>›</span>
            <span className="text-white">{nodo.nome}</span>
          </nav>
          <div className="flex items-end gap-4">
            <span className="text-5xl">{info.emoji}</span>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white">{nodo.nome}</h1>
              <p className="text-white/70 text-sm mt-1 max-w-xl">{info.descrizione}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 grid grid-cols-4 gap-2">
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-extrabold text-amber-500">{eventiLocali.length}</p>
            <p className="text-[10px] sm:text-xs text-gray-500">eventi</p>
          </div>
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-extrabold text-blue-500">{attivitaLocali.length}</p>
            <p className="text-[10px] sm:text-xs text-gray-500">attività</p>
          </div>
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-extrabold text-green-500">{eventiLocali.filter(e => e.gratuito).length}</p>
            <p className="text-[10px] sm:text-xs text-gray-500">gratuiti</p>
          </div>
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-extrabold text-purple-500">
              {new Set(eventiLocali.flatMap(e => e.categorie.map(c => c.slug))).size}
            </p>
            <p className="text-[10px] sm:text-xs text-gray-500">categorie</p>
          </div>
        </div>
      </section>

      <EventiList
        eventi={eventiLocali}
        categorie={categorie}
        comuni={[nodo]}
        titoloIniziale={`Eventi a ${nodo.nome}`}
      />

      {/* Sezione attività permanenti */}
      {attivitaLocali.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-gray-900">Cosa fare a {nodo.nome}</h2>
            <Link
              href={`/cosa-fare?comune=${nodo.slug}`}
              className="text-sm text-amber-600 font-semibold hover:underline"
            >
              Vedi tutte →
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
          <h2 className="text-lg font-bold text-gray-900 mb-4">Esplora altre località</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {altriComuni.map(c => {
              const ci = COVER_COMUNI[c.slug]
              return (
                <Link key={c.id} href={`/localita/${c.slug}`} className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow group">
                  <span className="text-3xl">{ci?.emoji ?? '📍'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 group-hover:text-amber-600 transition-colors">{c.nome}</p>
                    <p className="text-xs text-gray-500 truncate">{ci?.descrizione ?? ''}</p>
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
