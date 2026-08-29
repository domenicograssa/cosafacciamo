import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { getAttivitaBySlug, getAttivitaCorrelate } from '@/lib/queries/attivita'
import ActivityCard from '@/components/activities/ActivityCard'
import ImmagineEvento from '@/components/ui/ImmagineEvento'
import ShareButtons from '@/components/events/ShareButtons'
import { formatPrezzo } from '@/lib/utils'
import { getLang } from '@/lib/i18n/getLang'
import { strings, nomeCategoria } from '@/lib/i18n/strings'

const SITE_URL = 'https://www.moesco.it'

export const revalidate = 3600

// Pre-builda tutte le pagine attività al deploy, come per gli eventi
export async function generateStaticParams() {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data } = await sb
    .from('attivita')
    .select('slug')
    .eq('stato', 'pubblicato')
  return (data ?? []).map(a => ({ slug: a.slug }))
}

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const attivita = await getAttivitaBySlug(slug)
  if (!attivita) return {}

  const lang = await getLang()
  const canonicalUrl = lang === 'en' ? `${SITE_URL}/en/cosa-fare/${slug}` : `${SITE_URL}/cosa-fare/${slug}`
  const descrizioneFallback = lang === 'en'
    ? `${attivita.titolo} in ${attivita.geoNodo.nome}. Find all the details on moesco.`
    : `${attivita.titolo} a ${attivita.geoNodo.nome}. Scopri tutti i dettagli su moesco.`

  return {
    title: `${attivita.titolo} — ${attivita.geoNodo.nome}`,
    description: attivita.descrizioneBreve ?? descrizioneFallback,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'it': `${SITE_URL}/cosa-fare/${slug}`,
        'en': `${SITE_URL}/en/cosa-fare/${slug}`,
      },
    },
    openGraph: {
      title: `${attivita.titolo} — ${attivita.geoNodo.nome}`,
      description: attivita.descrizioneBreve ?? descrizioneFallback,
      url: canonicalUrl,
      type: 'article',
      ...(attivita.immagineCopertura ? { images: [{ url: attivita.immagineCopertura, width: 1200, height: 630, alt: attivita.titolo }] } : {}),
    },
  }
}

export default async function DettaglioAttivita({ params }: Props) {
  const { slug } = await params
  const lang = await getLang()
  const t = strings[lang]
  const attivita = await getAttivitaBySlug(slug)
  if (!attivita) notFound()

  const categoriaIds = attivita.categorie.map(c => c.id)
  const correlate = await getAttivitaCorrelate(attivita.id, categoriaIds, 4)
  const prezzo = formatPrezzo(attivita.prezzoMin, attivita.prezzoMax, attivita.gratuito, null, lang)
  const paginaUrl = lang === 'en' ? `${SITE_URL}/en/cosa-fare/${slug}` : `${SITE_URL}/cosa-fare/${slug}`
  const categoria = attivita.categorie[0]

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href={lang === 'en' ? '/en' : '/'} className="hover:text-amber-600">{t.event.breadcrumbHome}</Link>
        <span>›</span>
        <Link href={lang === 'en' ? '/en/cosa-fare' : '/cosa-fare'} className="hover:text-amber-600">{t.nav.whatToDo}</Link>
        <span>›</span>
        <Link href={`${lang === 'en' ? '/en' : ''}/localita/${attivita.geoNodo.slug}`} className="hover:text-amber-600">{attivita.geoNodo.nome}</Link>
        <span>›</span>
        <span className="text-gray-900 font-medium truncate">{attivita.titolo}</span>
      </nav>

      <div className="grid lg:grid-cols-3 gap-8">

        {/* Colonna principale */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-100">
            <ImmagineEvento
              fonti={attivita.immagineCopertura ? [{ url: attivita.immagineCopertura, alt: attivita.titolo }] : []}
              categoriaSlug={categoria?.slug}
              categoriaNome={categoria ? nomeCategoria(categoria, lang) : undefined}
              categoriaColore={categoria?.colore}
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 66vw"
              priority
            />
            <div className="absolute top-4 left-4 flex gap-2">
              {attivita.categorie.map(cat => (
                <span key={cat.id} className="text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide" style={{ backgroundColor: cat.colore }}>
                  {nomeCategoria(cat, lang)}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">{attivita.titolo}</h1>
            {attivita.descrizione && (
              <div className="mt-4 text-gray-700 leading-relaxed whitespace-pre-line">{attivita.descrizione}</div>
            )}

            {/*
              Trasparenza sui contenuti di origine automatizzata — stesso
              trattamento riservato agli eventi (vedi eventi/[slug]/page.tsx):
              le attività individuate dalla procedura di ricerca automatica
              dichiarano pubblicamente la fonte da cui l'informazione è stata
              tratta, così che chi legge possa verificarla. La scheda resta
              comunque approvata a mano prima della pubblicazione.
            */}
            {attivita.fonteUrl && (
              <aside className="mt-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs text-blue-900">
                <p>
                  <span aria-hidden="true">ℹ️ </span>
                  {lang === 'en'
                    ? 'This listing was compiled from public sources by an automated search and reviewed by our team before publication. Please check the official source for last-minute changes.'
                    : 'Questa scheda è stata compilata a partire da fonti pubbliche tramite una ricerca automatica ed è stata verificata dalla redazione prima della pubblicazione. Ti consigliamo di controllare la fonte ufficiale per eventuali variazioni dell’ultimo momento.'}
                </p>
                <p className="mt-1.5 break-words">
                  {lang === 'en' ? 'Source: ' : 'Fonte: '}
                  <a
                    href={attivita.fonteUrl}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="underline hover:no-underline font-semibold"
                  >
                    {attivita.fonteUrl}
                  </a>
                </p>
              </aside>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {attivita.quando && (
              <InfoRow icon="🗓️" label={t.event.when}>
                {attivita.quando}
              </InfoRow>
            )}
            {attivita.durata && (
              <InfoRow icon="🕐" label={lang === 'en' ? 'Duration' : 'Durata'}>
                {attivita.durata}
              </InfoRow>
            )}
            <InfoRow icon="📍" label={t.event.town}>
              {attivita.geoNodo.nome}
            </InfoRow>
            {attivita.livello && (
              <InfoRow icon="⛰️" label={lang === 'en' ? 'Level' : 'Livello'}>
                {t.activity[`level${attivita.livello.charAt(0).toUpperCase()}${attivita.livello.slice(1)}` as 'levelEasy' | 'levelMedium' | 'levelExpert'] ?? attivita.livello}
              </InfoRow>
            )}
            {attivita.target && (
              <InfoRow icon="👥" label={lang === 'en' ? 'Suitable for' : 'Adatta a'}>
                {attivita.target}
              </InfoRow>
            )}
            <InfoRow icon="🏷️" label={t.event.price}>
              <span className={attivita.gratuito ? 'text-green-600 font-bold' : 'font-semibold'}>{prezzo}</span>
            </InfoRow>
            {attivita.organizzatore && (
              <InfoRow icon="🏢" label={t.event.organizer}>
                {attivita.organizzatore.nome}
              </InfoRow>
            )}
            {attivita.emailContatto && (
              <InfoRow icon="✉️" label={t.event.email}>
                <a href={`mailto:${attivita.emailContatto}`} className="text-amber-600 hover:underline">{attivita.emailContatto}</a>
              </InfoRow>
            )}
            {attivita.telefonoContatto && (
              <InfoRow icon="📞" label={t.event.phone}>
                <a href={`tel:${attivita.telefonoContatto}`} className="text-amber-600 hover:underline">{attivita.telefonoContatto}</a>
              </InfoRow>
            )}
          </div>

          {/* CTA sito ufficiale + prenotazione */}
          {(attivita.sitoUfficiale || attivita.urlPrenotazione) && (
            <div className="flex flex-col sm:flex-row gap-3">
              {attivita.sitoUfficiale && (
                <a
                  href={attivita.sitoUfficiale}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-white font-bold py-3 px-6 rounded-xl transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  {t.event.visitOfficialSite}
                </a>
              )}
              {attivita.urlPrenotazione && (
                <a
                  href={attivita.urlPrenotazione}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 border-2 border-amber-400 text-amber-600 hover:bg-amber-50 font-bold py-3 px-6 rounded-xl transition-colors"
                >
                  🎟️ {t.event.bookOrBuyTickets}
                </a>
              )}
            </div>
          )}

          {/* Avviso di non responsabilità */}
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <span className="text-xl shrink-0">⚠️</span>
            <p className="text-sm text-amber-900 leading-relaxed">
              <strong>{t.event.noticeTitle}</strong>{' '}
              {lang === 'en'
                ? 'information about activities is provided by the organizers.'
                : 'le informazioni sulle attività sono fornite dagli organizzatori.'}{' '}
              <em>moesco</em> {t.event.noticeRest}
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4 sticky top-24">
            <div className="text-center">
              <p className={`text-2xl font-extrabold ${attivita.gratuito ? 'text-green-600' : 'text-gray-900'}`}>{prezzo}</p>
              {attivita.quando && (
                <p className="text-sm text-gray-500 mt-0.5">{attivita.quando}</p>
              )}
            </div>
            {attivita.urlPrenotazione ? (
              <a
                href={attivita.urlPrenotazione}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center w-full bg-amber-400 hover:bg-amber-500 text-white font-bold py-3 rounded-xl transition-colors"
              >
                🎟️ {t.event.bookTicketsShort}
              </a>
            ) : attivita.sitoUfficiale ? (
              <a
                href={attivita.sitoUfficiale}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center w-full bg-amber-400 hover:bg-amber-500 text-white font-bold py-3 rounded-xl transition-colors"
              >
                {t.event.infoOnOfficialSite}
              </a>
            ) : (
              <p className="text-xs text-center text-gray-400">
                {t.event.contactOrganizerForInfo}
              </p>
            )}
          </div>

          {attivita.organizzatore && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{t.event.organizer}</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center font-bold text-amber-600">
                  {attivita.organizzatore.nome.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">{attivita.organizzatore.nome}</p>
                </div>
              </div>
            </div>
          )}

          <ShareButtons titolo={attivita.titolo} url={paginaUrl} />
        </div>
      </div>

      {correlate.length > 0 && (
        <section className="mt-14">
          <h2 className="text-xl font-bold text-gray-900 mb-5">{t.event.youMightAlsoLike}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {correlate.map(a => <ActivityCard key={a.id} attivita={a} />)}
          </div>
        </section>
      )}
    </div>
  )
}

function InfoRow({ icon, label, children }: { icon: string; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
      <span className="text-xl shrink-0">{icon}</span>
      <div>
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">{label}</p>
        <div className="text-sm font-medium text-gray-900 mt-0.5">{children}</div>
      </div>
    </div>
  )
}
